import type { APIRoute } from 'astro'
import { Resend } from 'resend'

export const prerender = false

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const maxFieldLength = 300
const maxMessageLength = 4000

interface ContactPayload {
  readonly name?: unknown
  readonly email?: unknown
  readonly phone?: unknown
  readonly message?: unknown
  readonly requestAudit?: unknown
  readonly website?: unknown
}

function cleanString(value: unknown, maxLength = maxFieldLength) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().slice(0, maxLength)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function toParagraphs(value: string) {
  return escapeHtml(value).replaceAll('\n', '<br>')
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function getRecipients(value: string) {
  return value
    .split(',')
    .map(email => email.trim())
    .filter(Boolean)
}

export const POST: APIRoute = async ({ request }) => {
  let payload: ContactPayload

  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ message: 'Invalid form submission.' }, 400)
  }

  if (cleanString(payload.website)) {
    return jsonResponse({ message: 'Thanks, your message has been sent.' })
  }

  const name = cleanString(payload.name)
  const email = cleanString(payload.email)
  const phone = cleanString(payload.phone)
  const message = cleanString(payload.message, maxMessageLength)
  const requestAudit = payload.requestAudit === true
  const errors: Record<string, string> = {}

  if (!name) {
    errors.name = 'Name is required'
  }

  if (!email) {
    errors.email = 'Email is required'
  } else if (!emailPattern.test(email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!message) {
    errors.message = 'Message is required'
  }

  if (Object.keys(errors).length > 0) {
    return jsonResponse({ message: 'Please check the highlighted fields.', errors }, 400)
  }

  const apiKey = import.meta.env.RESEND_API_KEY
  const fromEmail = import.meta.env.CONTACT_FORM_FROM
  const toEmails = getRecipients(import.meta.env.CONTACT_FORM_TO ?? '')

  if (!apiKey || !fromEmail || toEmails.length === 0) {
    console.error('Contact form email is missing RESEND_API_KEY, CONTACT_FORM_FROM, or CONTACT_FORM_TO.')
    return jsonResponse({ message: 'Email delivery is not configured yet.' }, 500)
  }

  const escapedName = escapeHtml(name)
  const escapedEmail = escapeHtml(email)
  const escapedPhone = phone ? escapeHtml(phone) : 'Not provided'
  const auditLabel = requestAudit ? 'Yes' : 'No'
  const subjectName = name.replace(/\s+/g, ' ')
  const resend = new Resend(apiKey)

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmails,
      replyTo: email,
      subject: `New Sharp End Marketing inquiry from ${subjectName}`,
      html: `
        <h1>New website inquiry</h1>
        <p><strong>Name:</strong> ${escapedName}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapedEmail}">${escapedEmail}</a></p>
        <p><strong>Phone:</strong> ${escapedPhone}</p>
        <p><strong>Requested mini audit:</strong> ${auditLabel}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${toParagraphs(message)}</p>
      `,
      text: [
        'New website inquiry',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || 'Not provided'}`,
        `Requested mini audit: ${auditLabel}`,
        '',
        'Message:',
        message,
      ].join('\n'),
    })

    if (error) {
      console.error('Resend contact form error:', error)
      return jsonResponse({ message: 'We could not send your message right now.' }, 502)
    }

    return jsonResponse({ message: 'Thanks, your message has been sent.' })
  } catch (error) {
    console.error('Unexpected contact form error:', error)
    return jsonResponse({ message: 'We could not send your message right now.' }, 502)
  }
}
