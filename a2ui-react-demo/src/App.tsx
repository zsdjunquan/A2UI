import { CopilotChat, CopilotKit, createA2UIMessageRenderer } from "@copilotkit/react-core/v2";
import { defaultTheme } from "@copilotkit/a2ui-renderer";
import "@copilotkit/react-core/v2/styles.css";
import { medicalCatalog } from "./a2ui/medicalCatalog";
import "./App.css";

const chatLabels = {
  chatInputPlaceholder: "请粘贴检查报告、指标或输入需要解读的问题...",
  chatDisclaimerText: "AI 分析仅供临床参考，请结合医生判断与原始报告核实。",
  welcomeMessageText: "欢迎使用医疗 AI 报告助手，请输入报告内容开始分析。",
};

const A2UIRenderer = createA2UIMessageRenderer({
  theme: defaultTheme,
  // 渲染阶段：当后端返回 MedicalMetricChart / NodeAnswerCard 时，用 medicalCatalog 找到对应 React 组件。
  catalog: medicalCatalog,
});

export default function App() {
  return (
    <CopilotKit
      runtimeUrl="http://localhost:8080/api/copilotkit"
      // 生成阶段：把 catalog schema 注入给模型。少了这一步，模型通常只会生成 Basic Catalog 组件。
      a2ui={{ catalog: medicalCatalog }}
      renderActivityMessages={[A2UIRenderer]}
    >
      <main className="app-shell">
        <section className="hospital-chat-card" aria-label="医疗 AI 报告助手">
          <header className="hospital-chat-header">
            <div className="hospital-brand">
              <div className="hospital-logo" aria-hidden="true">AI</div>
              <div className="hospital-title-group">
                <h1>医疗 AI 报告助手</h1>
                <p>报告解读 · 指标异常 · 风险提示 · 复查建议</p>
              </div>
            </div>

            <div className="hospital-header-actions" aria-label="服务状态">
              <span className="status-dot" />
              <span>辅助分析中</span>
            </div>
          </header>

          <div className="hospital-tip-bar">
            <span>建议输入：血常规、凝血功能、D-二聚体、尿蛋白、血压记录或影像摘要</span>
          </div>

          <div className="hospital-chat-body">
            <CopilotChat className="medical-chat" labels={chatLabels} />
          </div>
        </section>
      </main>
    </CopilotKit>
  );
}
