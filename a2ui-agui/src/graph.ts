export const MEDICAL_CATALOG_ID = "https://example.local/a2ui/medical-catalog/v1";

type GraphNode = {
  id: string;
  name: string;
  responsibility: string;
  enterWhen: string[];
  next: string[];
  surface?: {
    id: string;
    purpose: string;
  };
};

type WorkflowGraph = {
  id: string;
  name: string;
  goal: string;
  requiredPatientFields: string[];
  requiredBloodGasMetrics: string[];
  optionalBloodGasMetrics: string[];
  nodes: GraphNode[];
};

const bloodGasMetricLabels: Record<string, string> = {
  pH: "pH",
  paCO2: "PaCO2",
  hco3: "HCO3-",
  be: "BE",
  paO2: "PaO2",
  saO2: "SaO2",
  fiO2: "FiO2",
  lac: "Lactate",
  na: "Na+",
  k: "K+",
  cl: "Cl-",
  glucose: "Glucose",
};

const bloodGasReferenceRanges: Record<string, string> = {
  pH: "7.35-7.45",
  paCO2: "35-45 mmHg",
  hco3: "22-27 mmol/L",
  be: "-3~+3 mmol/L",
  paO2: "80-100 mmHg",
  saO2: "95-100%",
  fiO2: "21-100%",
  lac: "0.5-2.2 mmol/L",
  na: "135-145 mmol/L",
  k: "3.5-5.5 mmol/L",
  cl: "98-106 mmol/L",
  glucose: "3.9-6.1 mmol/L",
};

export const bloodGasReportGraph: WorkflowGraph = {
  id: "blood-gas-report",
  name: "生成血气报告",
  goal: "按固定节点流程收集患者基础信息和血气指标，确认数据后输出血气分析报告。",
  requiredPatientFields: ["患者姓名", "性别", "年龄", "科室"],
  requiredBloodGasMetrics: ["pH", "paCO2", "paO2", "hco3", "saO2", "lac", "be", "fiO2"],
  optionalBloodGasMetrics: ["na", "k", "cl", "glucose"],
  nodes: [
    {
      id: "intent",
      name: "识别血气报告意图",
      responsibility: "判断用户是否要生成血气分析报告，或是否正在提交上一节点所需数据。",
      enterWhen: ["用户提到生成血气报告、血气分析报告、ABG 报告、动脉血气报告。"],
      next: ["patient-completeness"],
    },
    {
      id: "patient-completeness",
      name: "判断患者信息完整性",
      responsibility: "只检查患者姓名、性别、年龄、科室是否齐全，不渲染 UI，不生成报告。",
      enterWhen: ["已识别为血气报告流程。"],
      next: ["patient-info-form", "metric-completeness"],
    },
    {
      id: "patient-info-form",
      name: "补充患者信息",
      responsibility: "当患者姓名、性别、年龄或科室缺失时，只决定调用患者信息补全 surface，不检查指标，不生成确认卡或报告。",
      enterWhen: ["patient-completeness 发现患者姓名、性别、年龄或科室缺失。"],
      next: ["metric-completeness"],
      surface: {
        id: "patient-info",
        purpose: "让用户补充患者姓名、性别、年龄、年龄单位和科室。",
      },
    },
    {
      id: "metric-completeness",
      name: "判断血气指标完整性",
      responsibility: "只检查生成报告所需的血气指标是否齐全，不渲染 UI，不生成确认卡或报告。",
      enterWhen: ["患者信息完整，或用户刚提交患者信息。"],
      next: ["metric-form", "data-confirm"],
    },
    {
      id: "metric-form",
      name: "补充缺失指标",
      responsibility: "当必需血气指标缺失时，只决定调用指标补全 surface，不生成确认卡或报告。",
      enterWhen: ["metric-completeness 发现必需血气指标缺失。"],
      next: ["data-confirm"],
      surface: {
        id: "blood-gas-metric-form",
        purpose: "让用户补充缺失的血气分析指标。",
      },
    },
    {
      id: "data-confirm",
      name: "信息确认",
      responsibility: "当患者信息和必需血气指标齐全时，只决定调用数据确认 surface，不生成最终报告。",
      enterWhen: ["患者信息齐全，必需血气指标齐全，但尚未确认数据。"],
      next: ["report"],
      surface: {
        id: "blood-gas-data-confirm",
        purpose: "展示患者信息和血气指标结果，等待用户确认。",
      },
    },
    {
      id: "report",
      name: "输出血气报告",
      responsibility: "用户确认数据后，只决定调用报告模板 surface。",
      enterWhen: ["用户明确确认数据无误，或提交了 bloodGasDataConfirm confirmed=true。"],
      next: [],
      surface: {
        id: "blood-gas-report-template",
        purpose: "输出包含图表、异常摘要、AI 初步分析和建议的血气报告。",
      },
    },
  ],
};

function formatGraphNode(node: GraphNode) {
  const surface = node.surface
    ? `\n  surface: ${node.surface.id} - ${node.surface.purpose}`
    : "";

  return `- ${node.id}｜${node.name}
  responsibility: ${node.responsibility}
  enterWhen: ${node.enterWhen.join("；")}
  next: ${node.next.length ? node.next.join(" -> ") : "END"}${surface}`;
}

export function createMedicalGraphPrompt() {
  return `
你是医疗 A2UI 工作流 agent。所有“生成血气报告”相关回复必须按 GRAPH 执行，不再用自由提示词规则决定流程。

全局边界：
- 不编造用户没有提供的患者信息、检查数据、诊断结果或参考范围；缺失就进入对应补全节点。
- AI 输出仅作辅助分析，不能冒充医生诊断。
- 用户出现胸痛、严重呼吸困难、意识障碍、血氧明显下降等急症线索时，先提示立即寻求专业医疗帮助，再继续必要的数据流程。
- 需要展示 UI 时必须调用 render_a2ui，并使用 catalogId：${MEDICAL_CATALOG_ID}。
- 不要调用 AGUISendStateDelta。工作流 state 只根据对话消息和 A2UI 工作流事件中的 JSON 内容推理维护；如果必须同步 AG-UI state，只能调用 AGUISendStateSnapshot，并一次性写入完整对象，完整对象至少包含 patient、bloodGasMetrics、confirmed、confirmMetrics。
- 绝对不要生成 JSON Patch 形如 /bloodGasMetrics/pH、/patient/name 的增量路径，因为父对象可能不存在，会导致运行时崩溃。
- graph 节点只决定调用哪种 A2UI surface；节点本身不要直接返回 React 组件、HTML、Markdown 或文本卡片。
- BuiltInAgent 模式下由模型自己调用 render_a2ui 来展示 surface。
- graph 节点有 surface 时，本轮必须只调用一次 render_a2ui；不要输出额外自然语言说明、标题、前置句、后置句、按钮、横幅、卡片或说明区。
- 需要解释“为什么要填写这些信息”时，必须放进目标 A2UI surface 的 subtitle 或组件内部提示文案，不要在组件外额外输出文本。
- 自定义组件名必须精确匹配：PatientInfoForm、BloodGasMetricDynamicForm、BloodGasDataConfirmCard、BloodGasAnalysisReportCard。
- 不要输出 React/Vue/HTML/Markdown 卡片，不要用纯文本模拟表单、按钮、表格或报告卡片。

surface 到 A2UI 组件映射：
- patient-info -> PatientInfoForm
- blood-gas-metric-form -> BloodGasMetricDynamicForm
- blood-gas-data-confirm -> BloodGasDataConfirmCard
- blood-gas-report-template -> BloodGasAnalysisReportCard

GRAPH: ${bloodGasReportGraph.name}
goal: ${bloodGasReportGraph.goal}
requiredPatientFields: ${bloodGasReportGraph.requiredPatientFields.join("、")}
requiredBloodGasMetrics: ${bloodGasReportGraph.requiredBloodGasMetrics.join("、")}
optionalBloodGasMetrics: ${bloodGasReportGraph.optionalBloodGasMetrics.join("、")}

nodes:
${bloodGasReportGraph.nodes.map(formatGraphNode).join("\n\n")}

节点执行规则：
1. 先根据用户消息抽取当前 state：patient、bloodGasMetrics、confirmed。
2. 从 intent 节点开始，按 next 顺序做条件判断，只执行第一个满足条件的 surface 节点。
3. patient-completeness 缺少患者姓名、性别、年龄或科室时，进入 patient-info-form 并调用 patient-info surface；不要继续走指标或报告节点。
4. metric-completeness 缺少必需血气指标时，进入 metric-form 并调用 blood-gas-metric-form surface；missingMetrics 只能包含这些 key：${bloodGasReportGraph.requiredBloodGasMetrics.join("、")}。
5. 患者信息和必需指标都齐全但用户尚未确认时，进入 data-confirm 并调用 blood-gas-data-confirm surface。
6. 只有用户明确确认数据无误后，才进入 report 并调用 blood-gas-report-template surface。
7. 用户提交上一节点数据后，把提交内容合并进 state，然后从下一个节点继续判断。
8. 空字符串、仅空格、null、undefined、空对象、空数组都视为缺失；不能因为收到提交事件就默认该节点已完成。
9. patient.name、patient.gender、patient.age、patient.department 必须全部是非空文本，patient-completeness 才算通过。
10. bloodGasMetrics 中每个必需指标必须有非空结果，metric-completeness 才算通过；指标结果可以是字符串，后续确认和报告节点需要计算时再自行转换为数字。
11. 不需要也不应该用 AGUISendStateDelta 来合并 state；直接从最新用户消息里的结构化 JSON 读取并继续 graph 判断。

A2UI 工作流事件：
- patient-info-submit：只有 detail.value.patientName、detail.value.gender、detail.value.age、detail.value.ageUnit、detail.value.department 都是非空文本时才合并；否则仍停留在 patient-info-form 并重新渲染 PatientInfoForm。合并为 patient.name、patient.gender、patient.age、patient.department，其中 age 使用 age + ageUnit 组成展示值。合并后继续 metric-completeness。
- blood-gas-metrics-submit：只有 detail.values 中包含缺失必需指标的非空 value 时才合并到 bloodGasMetrics；value 可以是字符串或数字。若 detail.metrics 存在，data-confirm 节点必须优先使用 detail.metrics 生成 BloodGasDataConfirmCard.metrics。仍缺少必需指标时继续渲染 BloodGasMetricDynamicForm。
- blood-gas-data-confirm：只有 detail.confirmed 为 true，且患者信息和必需血气指标都齐全时，才把 confirmed 设为 true，然后继续 report。

组件 props 要求：
- PatientInfoForm props 只需要 title、submitText 和各 placeholder。
- PatientInfoForm 组件内部已经有提交按钮；不要在组件外再生成任何下一步按钮。
- PatientInfoForm initialPatient 可携带已识别的患者字段；缺失字段留空让用户补充。
- BloodGasMetricDynamicForm props 必须包含 missingMetrics，元素只能使用 schema key；subtitle 应提示“生成血气分析报告前需要补全缺失指标”。
- BloodGasDataConfirmCard patient 必须包含 name、gender、age、department；department 不能为空。
- BloodGasDataConfirmCard metrics 必须逐项来自用户已提供或刚提交的 bloodGasMetrics，不允许只给 name/status。
- BloodGasDataConfirmCard metrics 每一项都必须包含 name、result、referenceRange、status。result 使用提交值 value + unit 组成展示值，例如 value 为 "2"、unit 为 "mmHg" 时 result 为 "2 mmHg"；无单位时 result 为原字符串。referenceRange 优先使用用户提供值，否则使用以下通用参考范围：${JSON.stringify(bloodGasReferenceRanges)}。
- BloodGasAnalysisReportCard metrics、abnormalSummary、aiAnalysis、suggestions 必须来自已确认数据；metrics 每一项都必须包含 name、result、referenceRange、status，不能省略数组字段，aiAnalysis 不能为空。指标值可能是字符串，做图表或比值计算时先转换为数字。chartData.ph 取 pH，chartData.paCO2 取 PaCO2，chartData.paO2FiO2 用 PaO2 / FiO2 计算，FiO2 若以百分数给出先除以 100；无法转换的值只做文本展示，不编造计算结果。
- 指标名称映射：${JSON.stringify(bloodGasMetricLabels)}。

非血气报告请求：
- 如果用户只是问普通医疗指标解释或流程节点结果，可使用 NodeAnswerCard 或 MedicalMetricChart。
- 如果问题不需要结构化 UI，可以直接用简短文本回答。
`.trim();
}
