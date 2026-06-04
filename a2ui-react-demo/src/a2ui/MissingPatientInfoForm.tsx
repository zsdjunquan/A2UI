import { useState } from 'react'
import type { MissingPatientInfoFormData } from './types'
import './medical-a2ui.css'

interface Props {
  data: MissingPatientInfoFormData
  onSubmit?: (payload: { action: string; patient: Record<string, string> }) => void
}

export function MissingPatientInfoForm({ data, onSubmit }: Props) {
  const [form, setForm] = useState<Record<string, string>>({})

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = () => {
    const missingField = data.fields.find((field) => {
      return field.required && !form[field.key]
    })

    if (missingField) {
      alert(`请补充：${missingField.label}`)
      return
    }

    onSubmit?.({
      action: data.submitAction.type,
      patient: form,
    })
  }

  return (
    <section className="medical-card patient-form-card">
      <header className="medical-card-header">
        <div className="medical-card-icon">＋</div>
        <div>
          <h3 className="medical-card-title">{data.title}</h3>
          {data.description && <p className="medical-card-desc">{data.description}</p>}
        </div>
      </header>

      <div className="patient-form-grid">
        {data.fields.map((field) => (
          <label className="patient-form-item" key={field.key}>
            <span>
              {field.label}
              {field.required && <em>*</em>}
            </span>

            {field.fieldType === 'select' ? (
              <select
                value={form[field.key] ?? ''}
                onChange={(event) => updateField(field.key, event.target.value)}
              >
                <option value="">请选择</option>
                {field.options?.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.fieldType}
                value={form[field.key] ?? ''}
                placeholder={field.placeholder}
                onChange={(event) => updateField(field.key, event.target.value)}
              />
            )}
          </label>
        ))}
      </div>

      <button className="medical-primary-btn" onClick={handleSubmit}>
        {data.submitAction.label}
      </button>
    </section>
  )
}
