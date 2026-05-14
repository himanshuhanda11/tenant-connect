/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Aireatro'
const WA_LINK = 'https://wa.me/971586585863'

interface Props {
  recipientName?: string
  ticketId?: string
  categoryLabel?: string
  agentName?: string
  replyBody?: string
  originalSubject?: string
}

const ContactRequestReplyEmail = ({
  recipientName, ticketId, categoryLabel, agentName, replyBody, originalSubject,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Reply from ${SITE_NAME} support — ${ticketId || ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{agentName ? `${agentName} from ${SITE_NAME}` : `${SITE_NAME} support`} replied</Heading>
        <Text style={subtitle}>
          Hi {recipientName || 'there'}, here's an update on your request{ticketId ? ` (${ticketId})` : ''}.
        </Text>

        <Section style={replyCard}>
          <Text style={replyBodyStyle}>{replyBody || ''}</Text>
        </Section>

        <Section style={ticketCard}>
          <Text style={meta}><strong>Ticket:</strong> {ticketId || '—'}</Text>
          <Text style={meta}><strong>Category:</strong> {categoryLabel || '—'}</Text>
          {originalSubject ? <Text style={meta}><strong>Subject:</strong> {originalSubject}</Text> : null}
        </Section>

        <Section style={{ textAlign: 'center' as const, margin: '20px 0' }}>
          <Button style={primaryBtn} href={WA_LINK}>💬 Reply on WhatsApp</Button>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Just reply to this email to continue the conversation. We'll keep ticket {ticketId} open until you confirm everything is resolved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactRequestReplyEmail,
  subject: (d: Record<string, any>) =>
    `Re: ${d.originalSubject || d.categoryLabel || 'Your support request'} – ${d.ticketId || ''}`.trim(),
  displayName: 'Contact request — admin reply to customer',
  previewData: {
    recipientName: 'Jane',
    ticketId: 'AIR-26-A1B2C3',
    categoryLabel: 'WhatsApp API Setup',
    agentName: 'Rohit',
    replyBody: 'Hi Jane,\n\nThanks for reaching out! I have reviewed your account…',
    originalSubject: 'Help connecting WABA',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#f6f8fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { backgroundColor: '#ffffff', padding: '32px 28px', maxWidth: '600px', margin: '24px auto', borderRadius: '16px', border: '1px solid #e2e8f0' }
const h1 = { fontSize: '22px', fontWeight: 800 as const, color: '#0a0f1f', margin: '0 0 6px' }
const subtitle = { fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 18px' }
const replyCard = { background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '3px solid #16a34a', borderRadius: '8px', padding: '16px 18px', margin: '8px 0' }
const replyBodyStyle = { fontSize: '14px', color: '#0a0f1f', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' as const }
const ticketCard = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', margin: '14px 0' }
const meta = { fontSize: '12px', color: '#475569', margin: '2px 0' }
const primaryBtn = { backgroundColor: '#16a34a', color: '#ffffff', fontSize: '14px', fontWeight: 700 as const, borderRadius: '10px', padding: '12px 26px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0 10px' }
const footer = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: 0 }
