/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Aireatro'
const SITE_URL = 'https://aireatro.com'
const WA_LINK = 'https://wa.me/919319711126'

interface Props {
  recipientName?: string
  ticketId?: string
  category?: string
  categoryLabel?: string
  priority?: string
  subject?: string
  message?: string
  expectedResponse?: string
  submittedAt?: string
}

const ContactRequestCustomerEmail = ({
  recipientName, ticketId, categoryLabel, priority, subject, message, expectedResponse, submittedAt,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Your ${SITE_NAME} support request ${ticketId || ''} has been received`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={hero}>
          <Heading style={h1}>We've received your request ✅</Heading>
          <Text style={subtitle}>
            Hi {recipientName || 'there'}, thanks for reaching out to {SITE_NAME}. Our team has logged
            your request and will get back to you shortly.
          </Text>
        </Section>

        <Section style={ticketCard}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <tbody>
              <tr>
                <td style={ticketLabel}>Ticket ID</td>
                <td style={ticketValueStrong}>{ticketId || '—'}</td>
              </tr>
              <tr>
                <td style={ticketLabel}>Category</td>
                <td style={ticketValue}>{categoryLabel || 'Other enquiry'}</td>
              </tr>
              <tr>
                <td style={ticketLabel}>Priority</td>
                <td style={ticketValue}>{(priority || 'medium').toUpperCase()}</td>
              </tr>
              {subject ? (
                <tr>
                  <td style={ticketLabel}>Subject</td>
                  <td style={ticketValue}>{subject}</td>
                </tr>
              ) : null}
              <tr>
                <td style={ticketLabel}>Submitted</td>
                <td style={ticketValue}>{submittedAt || new Date().toUTCString()}</td>
              </tr>
              <tr>
                <td style={ticketLabel}>Expected reply</td>
                <td style={ticketValue}>{expectedResponse || 'Within 24 hours'}</td>
              </tr>
            </tbody>
          </table>
        </Section>

        {message ? (
          <Section style={msgCard}>
            <Text style={msgTitle}>Your message</Text>
            <Text style={msgBody}>{message}</Text>
          </Section>
        ) : null}

        <Section style={{ textAlign: 'center', margin: '28px 0 8px' }}>
          <Button style={primaryBtn} href={WA_LINK}>💬 Chat on WhatsApp</Button>
        </Section>
        <Section style={{ textAlign: 'center', margin: '6px 0 0' }}>
          <Link href={`${SITE_URL}/help`} style={secondaryLink}>Visit Help Center →</Link>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          You're receiving this email because you submitted a support request on {SITE_NAME}.
          Please keep ticket ID <strong>{ticketId || ''}</strong> for reference.
        </Text>
        <Text style={footerSm}>{SITE_NAME} · Dubai, UAE · <Link href={SITE_URL} style={{ color: '#0a0f1f' }}>aireatro.com</Link></Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactRequestCustomerEmail,
  subject: (d: Record<string, any>) =>
    `Your ${SITE_NAME} Support Request Has Been Received – ${d.ticketId || ''}`.trim(),
  displayName: 'Contact request — customer confirmation',
  previewData: {
    recipientName: 'Jane',
    ticketId: 'AIR-26-A1B2C3',
    categoryLabel: 'WhatsApp API Setup',
    priority: 'high',
    subject: 'Help connecting my WABA',
    message: 'Hi team, I need help connecting my WhatsApp Business number…',
    expectedResponse: 'Within 4 hours',
    submittedAt: new Date().toUTCString(),
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#f6f8fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { backgroundColor: '#ffffff', padding: '32px 28px', maxWidth: '600px', margin: '24px auto', borderRadius: '16px', border: '1px solid #e2e8f0' }
const hero = { textAlign: 'center' as const, marginBottom: '8px' }
const h1 = { fontSize: '24px', fontWeight: 800 as const, color: '#0a0f1f', margin: '0 0 8px' }
const subtitle = { fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px' }
const ticketCard = { background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px 20px', margin: '8px 0 16px' }
const ticketLabel = { fontSize: '11px', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.6px', padding: '6px 0', width: '38%' as const, fontWeight: 600 as const }
const ticketValue = { fontSize: '13px', color: '#0a0f1f', padding: '6px 0', fontWeight: 500 as const }
const ticketValueStrong = { ...ticketValue, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 700 as const, color: '#047857', fontSize: '14px' }
const msgCard = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', margin: '12px 0' }
const msgTitle = { fontSize: '11px', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.6px', margin: '0 0 6px', fontWeight: 700 as const }
const msgBody = { fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' as const }
const primaryBtn = { backgroundColor: '#16a34a', color: '#ffffff', fontSize: '14px', fontWeight: 700 as const, borderRadius: '10px', padding: '12px 26px', textDecoration: 'none', display: 'inline-block' }
const secondaryLink = { fontSize: '13px', color: '#0a0f1f', textDecoration: 'underline', fontWeight: 600 as const }
const hr = { borderColor: '#e5e7eb', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#64748b', lineHeight: '1.6', textAlign: 'center' as const, margin: '0 0 6px' }
const footerSm = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: 0 }
