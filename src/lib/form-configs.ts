import type { ContactFormProps } from '../components/ContactForm'

export type SEMFormConfig = Omit<ContactFormProps, 'sourcePage'>

export const contactFormConfig: SEMFormConfig = {
  formId: 'contact',
  formName: 'General contact',
  submitLabel: 'Send Message',
  successTitle: 'Thank you for reaching out',
  successMessage: 'We have received your message and will get back to you within one business day.',
  requestAuditDefault: true,
  requestAuditLabel: 'Request a free mini audit of my website & social media',
  showAuditOption: true,
}

export const serviceInquiryFormConfig: SEMFormConfig = {
  formId: 'service-inquiry',
  formName: 'Service inquiry',
  submitLabel: 'Request a Consultation',
  successTitle: 'Thanks for the details',
  successMessage: 'We have received your service inquiry and will follow up with next steps.',
  messageLabel: 'What are you hoping to improve?',
  messagePlaceholder: 'Tell us about your goals, current challenges, or the campaign you have in mind.',
  requestAuditDefault: true,
  showAuditOption: true,
  extraFields: [
    {
      name: 'serviceInterest',
      label: 'Primary service interest',
      type: 'select',
      required: true,
      options: [
        'Digital Marketing',
        'Social Media',
        'Paid Advertising',
        'Creative Design',
        'AI Workflow Optimization',
        'SEO',
        'Brand Strategy',
      ],
    },
    {
      name: 'timeline',
      label: 'Ideal timeline',
      type: 'select',
      options: ['As soon as possible', 'This quarter', 'Next quarter', 'Still exploring'],
    },
  ],
}

export const formConfigs = {
  contact: contactFormConfig,
  serviceInquiry: serviceInquiryFormConfig,
}
