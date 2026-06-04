export type RiskLevel = 'low' | 'medium' | 'high'

export type IndicatorStatus = 'normal' | 'warning' | 'danger'

export type A2UIBlock =
  | MedicalAnswerCardData
  | MedicalReportTemplateData
  | MissingPatientInfoFormData

export interface MedicalAnswerCardData {
  type: 'medical_answer_card'
  title: string
  category?: string
  riskLevel?: RiskLevel
  confidence?: number
  summary: string
  evidence?: string[]
  nextSteps?: string[]
}

export interface MedicalReportTemplateData {
  type: 'medical_report_template'
  title: string
  reportNo?: string
  patient: {
    name: string
    gender: string
    age: string | number
    department?: string
    patientId?: string
  }
  diagnosis?: string
  riskLevel: RiskLevel
  indicators: Array<{
    name: string
    value: string
    unit?: string
    reference?: string
    status: IndicatorStatus
    description?: string
  }>
  assessment: {
    summary: string
    evidence: string[]
    conclusion: string
  }
  suggestions: string[]
  disclaimer?: string
}

export interface MissingPatientInfoFormData {
  type: 'missing_patient_info_form'
  title: string
  description?: string
  fields: Array<{
    key: string
    label: string
    fieldType: 'text' | 'number' | 'select'
    required?: boolean
    options?: string[]
    placeholder?: string
  }>
  submitAction: {
    type: string
    label: string
  }
}