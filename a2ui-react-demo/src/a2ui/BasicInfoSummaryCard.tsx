import type { PropsOf } from "@copilotkit/a2ui-renderer";
import type { medicalCatalogDefinitions } from "./catalogDefinitions";

type BasicInfoSummaryCardProps = PropsOf<
  typeof medicalCatalogDefinitions,
  "BasicInfoSummaryCard"
>;

type BasicInfoItem = BasicInfoSummaryCardProps["items"][number];

const styles = `
.basic-info-summary-card,
.basic-info-summary-card * {
  box-sizing: border-box;
  max-width: 100%;
}

.basic-info-summary-card {
  width: 100%;
  min-width: 0;
  margin: 8px 0;
  padding: 16px 18px 18px;
  overflow: hidden;
  border: 1px solid #dce8ee;
  border-radius: 12px;
  background: #ffffff;
  color: #172334;
  box-shadow: 0 10px 28px rgba(26, 48, 73, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", Arial, sans-serif;
}

.basic-info-summary-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.basic-info-summary-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.basic-info-summary-card__mark {
  flex: none;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: #1d5fbf;
}

.basic-info-summary-card__title {
  margin: 0;
  color: #172334;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
}

.basic-info-summary-card__status {
  flex: none;
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border: 1px solid #b7dfc9;
  border-radius: 5px;
  background: #eefbf3;
  color: #138a4d;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.basic-info-summary-card__table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e1e7ef;
}

.basic-info-summary-card__table {
  width: 100%;
  min-width: 460px;
  border-collapse: collapse;
  table-layout: fixed;
  background: #ffffff;
}

.basic-info-summary-card__table th {
  height: 36px;
  padding: 0 12px;
  border-bottom: 1px solid #e1e7ef;
  background: #f8fafc;
  color: #172334;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
}

.basic-info-summary-card__table td {
  min-height: 36px;
  padding: 9px 12px;
  border-bottom: 1px solid #e8edf3;
  color: #243247;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  vertical-align: top;
}

.basic-info-summary-card__table tr:last-child td {
  border-bottom: none;
}

.basic-info-summary-card__label {
  width: 34%;
  color: #4b5f78;
  font-weight: 700;
}

.basic-info-summary-card__value {
  color: #172334;
  font-weight: 600;
}

.basic-info-summary-card__next {
  margin: 12px 0 0;
  color: #5f6f82;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .basic-info-summary-card {
    padding: 14px;
  }

  .basic-info-summary-card__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .basic-info-summary-card__table {
    min-width: 360px;
  }
}
`;

function getDisplayValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || "未填写";
}

export function BasicInfoSummaryCard({
  props,
}: {
  props: BasicInfoSummaryCardProps;
}) {
  // 汇总卡片只负责渲染 tool result；所有字段由后端 render_a2ui 生成，避免再落回 Markdown 表格。
  const items: BasicInfoItem[] = Array.isArray(props.items) ? props.items : [];

  return (
    <section className="basic-info-summary-card">
      <style>{styles}</style>

      <header className="basic-info-summary-card__header">
        <div className="basic-info-summary-card__title-wrap">
          <span className="basic-info-summary-card__mark" aria-hidden="true" />
          <h3 className="basic-info-summary-card__title">
            {props.title || "基本信息已提交"}
          </h3>
        </div>

        <span className="basic-info-summary-card__status">
          {props.statusText || "已记录"}
        </span>
      </header>

      <div className="basic-info-summary-card__table-wrap">
        <table className="basic-info-summary-card__table">
          <thead>
            <tr>
              <th>字段</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.label}-${index}`}>
                <td className="basic-info-summary-card__label">{item.label}</td>
                <td className="basic-info-summary-card__value">
                  {getDisplayValue(item.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {props.nextPrompt ? (
        <p className="basic-info-summary-card__next">{props.nextPrompt}</p>
      ) : null}
    </section>
  );
}
