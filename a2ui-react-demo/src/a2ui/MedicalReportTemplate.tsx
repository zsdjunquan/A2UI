import type { IndicatorStatus, MedicalReportTemplateData, RiskLevel } from './types'
import './medical-a2ui.css'

interface Props {
  data: MedicalReportTemplateData
}

const riskTextMap: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '需关注',
  high: '高风险',
}

const statusTextMap: Record<IndicatorStatus, string> = {
  normal: '正常',
  warning: '异常',
  danger: '高危',
}

export function MedicalReportTemplate({ data }: Props) {
  return (
    <article className="medical-report">
      <header className="report-header">
        <div>
          <div className="report-label">AI 医疗辅助报告</div>
          <h2 className="report-title">{data.title}</h2>
          {data.reportNo && <div className="report-no">报告编号：{data.reportNo}</div>}
        </div>

        <div className={`medical-risk-tag large ${data.riskLevel}`}>
          {riskTextMap[data.riskLevel]}
        </div>
      </header>

      <section className="patient-panel">
        <InfoItem label="患者姓名" value={data.patient.name} />
        <InfoItem label="性别" value={data.patient.gender} />
        <InfoItem label="年龄" value={String(data.patient.age)} />
        {data.patient.department && <InfoItem label="科室" value={data.patient.department} />}
        {data.patient.patientId && <InfoItem label="患者 ID" value={data.patient.patientId} />}
        {data.diagnosis && <InfoItem label="初步诊断" value={data.diagnosis} />}
      </section>

      <section className="report-section">
        <div className="section-title">关键指标</div>

        <div className="indicator-grid">
          {data.indicators.map((item, index) => (
            <div className={`indicator-card ${item.status}`} key={index}>
              <div className="indicator-top">
                <span className="indicator-name">{item.name}</span>
                <span className={`indicator-status ${item.status}`}>
                  {statusTextMap[item.status]}
                </span>
              </div>

              <div className="indicator-value">
                {item.value}
                {item.unit && <span>{item.unit}</span>}
              </div>

              {item.reference && (
                <div className="indicator-reference">参考范围：{item.reference}</div>
              )}

              {item.description && (
                <div className="indicator-desc">{item.description}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="report-section">
        <div className="section-title">风险评估</div>
        <p className="report-text">{data.assessment.summary}</p>

        <div className="evidence-list">
          {data.assessment.evidence.map((item, index) => (
            <div className="evidence-item" key={index}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="report-section">
        <div className="section-title">评估结论</div>
        <p className="report-conclusion">{data.assessment.conclusion}</p>
      </section>

      <section className="report-section">
        <div className="section-title">处理建议</div>
        <ul className="suggestion-list">
          {data.suggestions.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <footer className="report-footer">
        {data.disclaimer ||
          '本报告由 AI 辅助生成，仅供临床参考，不能替代医生诊断与治疗决策。'}
      </footer>
    </article>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="patient-info-item">
      <div className="patient-info-label">{label}</div>
      <div className="patient-info-value">{value}</div>
    </div>
  )
}