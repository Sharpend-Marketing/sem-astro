import { useState, type CSSProperties } from 'react'

type ExtraFieldType = 'text' | 'textarea' | 'select' | 'checkbox'

export interface ContactFormExtraField {
  readonly name: string
  readonly label: string
  readonly type?: ExtraFieldType
  readonly required?: boolean
  readonly placeholder?: string
  readonly options?: readonly string[]
}

export interface ContactFormProps {
  readonly formId?: string
  readonly formName?: string
  readonly sourcePage?: string
  readonly submitLabel?: string
  readonly submittingLabel?: string
  readonly successTitle?: string
  readonly successMessage?: string
  readonly messageLabel?: string
  readonly messagePlaceholder?: string
  readonly requestAuditDefault?: boolean
  readonly requestAuditLabel?: string
  readonly showAuditOption?: boolean
  readonly extraFields?: readonly ContactFormExtraField[]
}

interface FormData {
  readonly name: string
  readonly email: string
  readonly phone: string
  readonly message: string
  readonly requestAudit: boolean
  readonly website: string
  readonly extraFields: Record<string, string | boolean>
}

interface FormErrors {
  readonly name?: string
  readonly email?: string
  readonly message?: string
  readonly extraFields?: Record<string, string>
  readonly submit?: string
}

function getInitialFormData(
  extraFields: readonly ContactFormExtraField[],
  requestAuditDefault: boolean,
): FormData {
  return {
    name: '',
    email: '',
    phone: '',
    message: '',
    requestAudit: requestAuditDefault,
    website: '',
    extraFields: Object.fromEntries(
      extraFields.map(field => [field.name, field.type === 'checkbox' ? false : '']),
    ),
  }
}

function validateForm(data: FormData, extraFields: readonly ContactFormExtraField[]): FormErrors {
  const errors: Record<string, string> = {}
  const extraErrors: Record<string, string> = {}

  if (!data.name.trim()) {
    errors.name = 'Name is required'
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!data.message.trim()) {
    errors.message = 'Message is required'
  }

  for (const field of extraFields) {
    if (!field.required) continue

    const value = data.extraFields[field.name]
    if (field.type === 'checkbox') {
      if (value !== true) {
        extraErrors[field.name] = `${field.label} is required`
      }
    } else if (typeof value !== 'string' || !value.trim()) {
      extraErrors[field.name] = `${field.label} is required`
    }
  }

  return Object.keys(extraErrors).length > 0 ? { ...errors, extraFields: extraErrors } : errors
}

export default function ContactForm({
  formId = 'contact',
  formName = 'Website contact form',
  sourcePage = '',
  submitLabel = 'Send Message',
  submittingLabel = 'Sending...',
  successTitle = 'Thank you for reaching out',
  successMessage = 'We have received your message and will get back to you within one business day.',
  messageLabel = 'Message',
  messagePlaceholder,
  requestAuditDefault = true,
  requestAuditLabel = 'Request a free mini audit of my website & social media',
  showAuditOption = true,
  extraFields = [],
}: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>(() => getInitialFormData(extraFields, requestAuditDefault))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const { [field as keyof FormErrors]: _, ...rest } = prev
        return rest
      })
    }
  }

  const updateExtraField = (fieldName: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      extraFields: {
        ...prev.extraFields,
        [fieldName]: value,
      },
    }))
    if (errors.extraFields?.[fieldName]) {
      setErrors(prev => ({
        ...prev,
        extraFields: Object.fromEntries(
          Object.entries(prev.extraFields ?? {}).filter(([key]) => key !== fieldName),
        ),
      }))
    }
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const validationErrors = validateForm(formData, extraFields)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstErrorField = validationErrors.name ? 'name' : validationErrors.email ? 'email' : validationErrors.message ? 'message' : ''
      const firstExtraError = Object.keys(validationErrors.extraFields ?? {})[0]
      const element = document.getElementById(firstErrorField ? `${formId}-${firstErrorField}` : `${formId}-extra-${firstExtraError}`)
      element?.focus()
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          formName,
          sourcePage,
        }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        setErrors({
          ...(result.errors ?? {}),
          submit: result.message ?? 'We could not send your message right now.',
        })
        return
      }

      setSubmitted(true)
    } catch {
      setErrors({ submit: 'We could not send your message right now. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8" role="status">
        <p className="font-heading text-h2 font-medium" style={{ color: '#086d72' }}>
          {successTitle}
        </p>
        <p className="mt-4 font-body text-lead" style={{ color: '#525866' }}>
          {successMessage}
        </p>
      </div>
    )
  }

  const inputClasses = "mt-1 block w-full rounded-lg border px-4 py-2.5 font-body text-sm transition-colors focus:outline-none focus:ring-2"
  const inputStyle = {
    borderColor: 'rgba(9, 14, 29, 0.1)',
    color: '#0A0D14',
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        <div>
          <label htmlFor={`${formId}-website`} className="sr-only">
            Website
          </label>
          <input
            id={`${formId}-website`}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={e => updateField('website', e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <label htmlFor={`${formId}-name`} className="block font-body text-sm font-medium" style={{ color: '#0A0D14' }}>
            Name
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={e => updateField('name', e.target.value)}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            className={inputClasses}
            style={{ ...inputStyle, '--tw-ring-color': 'rgba(8, 109, 114, 0.2)' } as CSSProperties}
          />
          {errors.name && (
            <p id={`${formId}-name-error`} className="mt-1 font-body text-sm text-danger" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className="block font-body text-sm font-medium" style={{ color: '#0A0D14' }}>
            Email
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={e => updateField('email', e.target.value)}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
            className={inputClasses}
            style={inputStyle}
          />
          {errors.email && (
            <p id={`${formId}-email-error`} className="mt-1 font-body text-sm text-danger" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-phone`} className="block font-body text-sm font-medium" style={{ color: '#0A0D14' }}>
            Phone <span className="font-normal" style={{ color: 'rgba(10, 13, 20, 0.45)' }}>(optional)</span>
          </label>
          <input
            id={`${formId}-phone`}
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={e => updateField('phone', e.target.value)}
            className={inputClasses}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-message`} className="block font-body text-sm font-medium" style={{ color: '#0A0D14' }}>
            {messageLabel}
          </label>
          <textarea
            id={`${formId}-message`}
            rows={4}
            required
            placeholder={messagePlaceholder}
            value={formData.message}
            onChange={e => updateField('message', e.target.value)}
            aria-invalid={errors.message ? 'true' : undefined}
            aria-describedby={errors.message ? `${formId}-message-error` : undefined}
            className={inputClasses}
            style={inputStyle}
          />
          {errors.message && (
            <p id={`${formId}-message-error`} className="mt-1 font-body text-sm text-danger" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        {extraFields.map(field => {
          const fieldId = `${formId}-extra-${field.name}`
          const fieldError = errors.extraFields?.[field.name]
          const fieldValue = formData.extraFields[field.name]

          if (field.type === 'checkbox') {
            return (
              <div className="flex items-center gap-3" key={field.name}>
                <input
                  id={fieldId}
                  type="checkbox"
                  checked={fieldValue === true}
                  onChange={e => updateExtraField(field.name, e.target.checked)}
                  aria-invalid={fieldError ? 'true' : undefined}
                  aria-describedby={fieldError ? `${fieldId}-error` : undefined}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: '#086d72' }}
                />
                <label htmlFor={fieldId} className="font-body text-sm" style={{ color: '#525866' }}>
                  {field.label}
                </label>
                {fieldError && (
                  <p id={`${fieldId}-error`} className="mt-1 font-body text-sm text-danger" role="alert">
                    {fieldError}
                  </p>
                )}
              </div>
            )
          }

          return (
            <div key={field.name}>
              <label htmlFor={fieldId} className="block font-body text-sm font-medium" style={{ color: '#0A0D14' }}>
                {field.label}{!field.required && <span className="font-normal" style={{ color: 'rgba(10, 13, 20, 0.45)' }}> (optional)</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={fieldId}
                  rows={3}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={typeof fieldValue === 'string' ? fieldValue : ''}
                  onChange={e => updateExtraField(field.name, e.target.value)}
                  aria-invalid={fieldError ? 'true' : undefined}
                  aria-describedby={fieldError ? `${fieldId}-error` : undefined}
                  className={inputClasses}
                  style={inputStyle}
                />
              ) : field.type === 'select' ? (
                <select
                  id={fieldId}
                  required={field.required}
                  value={typeof fieldValue === 'string' ? fieldValue : ''}
                  onChange={e => updateExtraField(field.name, e.target.value)}
                  aria-invalid={fieldError ? 'true' : undefined}
                  aria-describedby={fieldError ? `${fieldId}-error` : undefined}
                  className={inputClasses}
                  style={inputStyle}
                >
                  <option value="">Select one</option>
                  {(field.options ?? []).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={fieldId}
                  type="text"
                  required={field.required}
                  placeholder={field.placeholder}
                  value={typeof fieldValue === 'string' ? fieldValue : ''}
                  onChange={e => updateExtraField(field.name, e.target.value)}
                  aria-invalid={fieldError ? 'true' : undefined}
                  aria-describedby={fieldError ? `${fieldId}-error` : undefined}
                  className={inputClasses}
                  style={inputStyle}
                />
              )}
              {fieldError && (
                <p id={`${fieldId}-error`} className="mt-1 font-body text-sm text-danger" role="alert">
                  {fieldError}
                </p>
              )}
            </div>
          )
        })}

        {showAuditOption && (
          <div className="flex items-center gap-3">
            <input
              id={`${formId}-audit`}
              type="checkbox"
              checked={formData.requestAudit}
              onChange={e => updateField('requestAudit', e.target.checked)}
              className="h-4 w-4 rounded"
              style={{ accentColor: '#086d72' }}
            />
            <label htmlFor={`${formId}-audit`} className="font-body text-sm" style={{ color: '#525866' }}>
              {requestAuditLabel}
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full font-body text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: isSubmitting ? 'rgba(8, 109, 114, 0.56)' : 'rgba(8, 109, 114, 0.82)',
            padding: '0.75rem 1.5rem',
            borderRadius: '0px 7px',
            cursor: isSubmitting ? 'wait' : 'pointer',
          }}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>

        {errors.submit && (
          <p className="font-body text-sm text-danger" role="alert">
            {errors.submit}
          </p>
        )}
      </div>
    </form>
  )
}
