import type { MedicalAnswerCardData, RiskLevel } from './types'

interface Props {
  data: MedicalAnswerCardData
}

const riskTextMap: Record<RiskLevel, string> = {
  low: '低风险',
  medium: '需关注',
  high: '高风险',
}

const styles = `
.medical-answer-card-root,
.medical-answer-card-root * {
  box-sizing: border-box;
  max-width: 100%;
}

.medical-answer-card-root {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
  background: #ffffff;
  border: 1px solid #dcebf2;
  border-radius: 18px;
  box-shadow: 0 12px 32px rgba(15, 47, 72, 0.06);
  color: #102a43;
}

.medical-answer-card-root .medical-card-header {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid #edf4f7;
  background: linear-gradient(180deg, #f8fcfd 0%, #ffffff 100%);
}

.medical-answer-card-root .medical-card-icon {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e9f7f7;
  color: #0f8f8f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.medical-answer-card-root .medical-card-title-wrap {
  min-width: 0;
  flex: 1;
}

.medical-answer-card-root .medical-card-category {
  font-size: 12px;
  color: #6b8190;
  line-height: 1.4;
}

.medical-answer-card-root .medical-card-title {
  margin: 2px 0 0;
  font-size: 17px;
  line-height: 1.45;
  font-weight: 700;
  color: #102a43;
}

.medical-answer-card-root .medical-card-body {
  padding: 18px 20px 20px;
  min-width: 0;
}

.medical-answer-card-root .medical-summary {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: #263f52;
  overflow-wrap: anywhere;
}

.medical-answer-card-root .medical-risk-tag {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.medical-answer-card-root .medical-risk-tag.low {
  color: #047857;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.medical-answer-card-root .medical-risk-tag.medium {
  color: #ad6800;
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.medical-answer-card-root .medical-risk-tag.high {
  color: #b42318;
  background: #fff1f0;
  border: 1px solid #ffccc7;
}

.medical-answer-card-root .confidence-block {
  margin-top: 18px;
}

.medical-answer-card-root .confidence-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: #526d7a;
}

.medical-answer-card-root .confidence-row strong {
  color: #102a43;
}

.medical-answer-card-root .confidence-track {
  margin-top: 8px;
  height: 6px;
  border-radius: 999px;
  background: #edf3f7;
  overflow: hidden;
}

.medical-answer-card-root .confidence-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0f8f8f, #16a3a3);
}

.medical-answer-card-root .medical-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.medical-answer-card-root .medical-info-box {
  min-width: 0;
  padding: 14px;
  border-radius: 14px;
  background: #f8fbfd;
  border: 1px solid #e1edf3;
}

.medical-answer-card-root .medical-info-title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #102a43;
}

.medical-answer-card-root .medical-info-box ul {
  margin: 0;
  padding-left: 18px;
}

.medical-answer-card-root .medical-info-box li {
  margin: 6px 0;
  font-size: 13px;
  line-height: 1.75;
  color: #375365;
}

@media (max-width: 900px) {
  .medical-answer-card-root .medical-card-grid {
    grid-template-columns: 1fr;
  }

  .medical-answer-card-root .medical-card-header {
    flex-direction: column;
  }

  .medical-answer-card-root .medical-risk-tag {
    align-self: flex-start;
  }
}
`

export function MedicalAnswerCard({ data }: Props) {
  return (
    <section className="medical-answer-card-root">
      <style>{styles}</style>
      <header className="medical-card-header">
        <div className="medical-card-icon">⌘</div>

        <div className="medical-card-title-wrap">
          {data.category && <div className="medical-card-category">{data.category}</div>}
          <h3 className="medical-card-title">{data.title}</h3>
        </div>

        {data.riskLevel && (
          <div className={`medical-risk-tag ${data.riskLevel}`}>
            {riskTextMap[data.riskLevel]}
          </div>
        )}
      </header>

      <div className="medical-card-body">
        <p className="medical-summary">{data.summary}</p>

        {typeof data.confidence === 'number' && (
          <div className="confidence-block">
            <div className="confidence-row">
              <span>回答可信度</span>
              <strong>{data.confidence}%</strong>
            </div>
            <div className="confidence-track">
              <div
                className="confidence-bar"
                style={{ width: `${Math.max(0, Math.min(data.confidence, 100))}%` }}
              />
            </div>
          </div>
        )}

        <div className="medical-card-grid">
          {data.evidence?.length ? (
            <div className="medical-info-box">
              <div className="medical-info-title">依据</div>
              <ul>
                {data.evidence.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.nextSteps?.length ? (
            <div className="medical-info-box">
              <div className="medical-info-title">下一步</div>
              <ul>
                {data.nextSteps.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
