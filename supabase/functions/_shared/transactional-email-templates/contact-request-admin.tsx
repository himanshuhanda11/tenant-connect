/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Aireatro'
const SITE_URL = 'https://aireatro.com'
const ADMIN_URL = 'https://app.aireatro.com/control/contact-requests'

interface Props {
  ticketId?: string
  category?: string
  categoryLabel?: string
  priority?: string
  fullName?: string
  email?: string
  phone?: string
  businessName?: string
  country?: string
  workspaceLabel?: string
  subject?: string
  message?: string
  attachmentUrl?: string
  submittedAt?: string
  metadataLines?: string[]
  sourcePage?: string
}

const priorityColor: Record<string, string> = {
  urgent: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#16a34a',
}

const ContactRequestAdminEmail = ({
  ticketId, categoryLabel, priority, fullName, email, phone, businessName, country,
  workspaceLabel, subject, message, attachmentUrl, submittedAt, metadataLines, sourcePage,
}: Props) => {
  const pColor = priorityColor[(priority || 'medium').toLowerCase()] || '#64748b'
  const waLink = phone
    ? `https://wa.me/${(phone || '').replace(/[^0-9]/g, '')}`
    : 'https://wa.me/'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`[${(priority || 'medium').toUpperCase()}] ${categoryLabel || 'New enquiry'} — ${ticketId || ''}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={topBar}>
            <Text style={topBarText}>🆕 New Aireatro Contact Request</Text>
          </Section>

          <Section style={{ padding: '4px 0 0' }}>
            <Heading style={h1}>{categoryLabel || 'Enquiry'}</Heading>
            <table style={{ width: '100%', marginTop: '6px' }}>
              <tbody>
                <tr>
                  <td>
                    <span style={{ ...badge, backgroundColor: '#0a0f1f' }}>{ticketId || '—'}</span>
                  </td>
                  <td style={{ textAlign: 'right' as const }}>
                    <span style={{ ...badge, backgroundColor: pColor }}>{(priority || 'medium').toUpperCase()}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={card}>
            <Text style={cardTitle}>Customer details</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <tbody>
                <Row label="Name" value={fullName} />
                <Row label="Email" value={email} link={email ? `mailto:${email}` : undefined} />
                <Row label="Phone" value={phone} link={phone ? `tel:${phone}` : undefined} />
                <Row label="Business" value={businessName} />
                <Row label="Country" value={country} />
                <Row label="Workspace" value={workspaceLabel} />
                <Row label="Submitted" value={submittedAt || new Date().toUTCString()} />
                <Row label="Source page" value={sourcePage} />
              </tbody>
            </table>
          </Section>

          {subject ? (
            <Section style={card}>
              <Text style={cardTitle}>Subject</Text>
              <Text style={cardBody}>{subject}</Text>
            </Section>
          ) : null}

          <Section style={card}>
            <Text style={cardTitle}>Message</Text>
            <Text style={cardBody}>{message || '(no message)'}</Text>
          </Section>

          {metadataLines && metadataLines.length > 0 ? (
            <Section style={card}>
              <Text style={cardTitle}>Additional details</Text>
              {metadataLines.map((line, i) => (
                <Text key={i} style={metaLine}>• {line}</Text>
              ))}
            </Section>
          ) : null}

          {attachmentUrl ? (
            <Section style={{ textAlign: 'center' as const, margin: '12px 0' }}>
              <Button style={attachBtn} href={attachmentUrl}>📎 View Attachment</Button>
            </Section>
          ) : null}

          <Section style={{ textAlign: 'center' as const, margin: '16px 0' }}>
            <Button style={primaryBtn} href={ADMIN_URL}>Open in Admin →</Button>
            {email ? <Button style={ghostBtn} href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject || categoryLabel || 'Your enquiry')} (${ticketId || ''})`}>Reply by Email</Button> : null}
            {phone ? <Button style={waBtn} href={waLink}>WhatsApp</Button> : null}
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Internal notification · {SITE_NAME} support pipeline</Text>
          <Text style={footerSm}><Link href={SITE_URL} style={{ color: '#94a3b8' }}>{SITE_URL}</Link></Text>
        </Container>
      </Body>
    </Html>
  )
}

const Row: React.FC<{ label: string; value?: string; link?: string }> = ({ label, value, link }) => (
  <tr>
    <td style={kvLabel}>{label}</td>
    <td style={kvValue}>
      {value ? (link ? <Link href={link} style={{ color: '#0a0f1f' }}>{value}</Link> : value) : <span style={{ color: '#94a3b8' }}>—</span>}
    </td>
  </tr>
)

export const template = {
  component: ContactRequestAdminEmail,
  to: 'admin@aireatro.com',
  subject: (d: Record<string, any>) =>
    `New Aireatro Contact Request – ${d.categoryLabel || 'Enquiry'} – ${d.ticketId || ''}`.trim(),
  displayName: 'Contact request — admin notification',
  previewData: {
    ticketId: 'AIR-26-A1B2C3',
    categoryLabel: 'WhatsApp API Setup',
    priority: 'high',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+971 50 123 4567',
    businessName: 'Acme LLC',
    country: 'United Arab Emirates',
    workspaceLabel: 'Acme Workspace',
    subject: 'Help connecting WABA',
    message: 'We need help connecting our WhatsApp number to Aireatro…',
    submittedAt: new Date().toUTCString(),
    metadataLines: ['WABA ID: 1234567890', 'Issue: Verification stuck'],
    sourcePage: '/contact',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { backgroundColor: '#ffffff', padding: '24px 26px', maxWidth: '640px', margin: '24px auto', borderRadius: '16px', border: '1px solid #e2e8f0' }
const topBar = { background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)', padding: '10px 14px', borderRadius: '10px', marginBottom: '14px' }
const topBarText = { fontSize: '13px', fontWeight: 700 as const, color: '#ffffff', margin: 0, letterSpacing: '0.3px' }
const h1 = { fontSize: '22px', fontWeight: 800 as const, color: '#0a0f1f', margin: '0' }
const badge = { display: 'inline-block', padding: '5px 10px', borderRadius: '999px', color: '#ffffff', fontSize: '11px', fontWeight: 700 as const, letterSpacing: '0.6px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }
const card = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', margin: '14px 0' }
const cardTitle = { fontSize: '11px', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.6px', margin: '0 0 8px', fontWeight: 700 as const }
const cardBody = { fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' as const }
const kvLabel = { fontSize: '11px', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.5px', padding: '5px 8px 5px 0', width: '32%' as const, fontWeight: 600 as const, verticalAlign: 'top' as const }
const kvValue = { fontSize: '13px', color: '#0a0f1f', padding: '5px 0', verticalAlign: 'top' as const }
const metaLine = { fontSize: '12px', color: '#334155', margin: '2px 0' }
const primaryBtn = { backgroundColor: '#0a0f1f', color: '#ffffff', fontSize: '13px', fontWeight: 700 as const, borderRadius: '8px', padding: '10px 18px', textDecoration: 'none', display: 'inline-block', margin: '0 4px' }
const ghostBtn = { backgroundColor: '#ffffff', color: '#0a0f1f', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 as const, borderRadius: '8px', padding: '10px 18px', textDecoration: 'none', display: 'inline-block', margin: '4px' }
const waBtn = { backgroundColor: '#16a34a', color: '#ffffff', fontSize: '13px', fontWeight: 700 as const, borderRadius: '8px', padding: '10px 18px', textDecoration: 'none', display: 'inline-block', margin: '0 4px' }
const attachBtn = { backgroundColor: '#0ea5e9', color: '#ffffff', fontSize: '12px', fontWeight: 700 as const, borderRadius: '8px', padding: '8px 16px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0 10px' }
const footer = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: 0 }
const footerSm = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: '4px 0 0' }
