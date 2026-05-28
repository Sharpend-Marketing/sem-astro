import { useState, type CSSProperties } from 'react'

interface FormData {
  readonly name: string
  readonly email: string
  readonly phone: string
  readonly message: string
  readonly requestAudit: boolean
  readonly website: string
}

interface FormErrors {
  readonly name?: string
  readonly email?: string
  readonly message?: string
  readonly submit?: string
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  message: '',
  requestAudit: true,
  website: '',
}

function validateForm(data: FormData): FormErrors {
  const errors: Record<string, string> = {}

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

  return errors
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
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

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    const validationErrors = validateForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstErrorField = Object.keys(validationErrors)[0]
      const element = document.getElementById(`contact-${firstErrorField}`)
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
        body: JSON.stringify(formData),
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
          Thank you for reaching out
        </p>
        <p className="mt-4 font-body text-lead" style={{ color: '#525866' }}>
          We have received your message and will get back to you within one business day.
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
          <label htmlFor="contact-website" className="sr-only">
            Website
          </label>
          <input
            id="contact-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={e => updateField('website', e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <label htmlFor="contact-name" className="block font-body text-sm font-medium" style={{ color: '#0A0D14' }}>
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={e => updateField('name', e.target.value)}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            className={inputClasses}
            style={{ ...inputStyle, '--tw-ring-color': 'rgba(8, 109, 114, 0.2)' } as CSSProperties}
          />
          {errors.name && (
            <p id="contact-name-error" className="mt-1 font-body text-sm text-danger" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="block font-body text-sm font-medium" style={{ color: '#0A0D14' }}>
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={e => updateField('email', e.target.value)}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            className={inputClasses}
            style={inputStyle}
          />
          {errors.email && (
            <p id="contact-email-error" className="mt-1 font-body text-sm text-danger" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-phone" className="block font-body text-sm font-medium" style={{ color: '#0A0D14' }}>
            Phone <span className="font-normal" style={{ color: 'rgba(10, 13, 20, 0.45)' }}>(optional)</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={e => updateField('phone', e.target.value)}
            className={inputClasses}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="block font-body text-sm font-medium" style={{ color: '#0A0D14' }}>
            Message
          </label>
          <textarea
            id="contact-message"
            rows={4}
            required
            value={formData.message}
            onChange={e => updateField('message', e.target.value)}
            aria-invalid={errors.message ? 'true' : undefined}
            aria-describedby={errors.message ? 'contact-message-error' : undefined}
            className={inputClasses}
            style={inputStyle}
          />
          {errors.message && (
            <p id="contact-message-error" className="mt-1 font-body text-sm text-danger" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            id="contact-audit"
            type="checkbox"
            checked={formData.requestAudit}
            onChange={e => updateField('requestAudit', e.target.checked)}
            className="h-4 w-4 rounded"
            style={{ accentColor: '#086d72' }}
          />
          <label htmlFor="contact-audit" className="font-body text-sm" style={{ color: '#525866' }}>
            Request a free mini audit of my website &amp; social media
          </label>
        </div>

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
          {isSubmitting ? 'Sending...' : 'Send Message'}
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
