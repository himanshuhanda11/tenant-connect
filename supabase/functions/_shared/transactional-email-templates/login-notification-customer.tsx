/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Aireatro'
const SITE_URL = 'https://app.aireatro.com'

interface Props {
  recipientName?: string
  email?: string
  loginTime?: string
  device?: string
  method?: string
}

const LoginNotificationCustomerEmail = ({
  recipientName, email, loginTime, device, method,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New login to your ${SITE_NAME} account`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={hero}>
          <Text style={eyebrow}>Security notification</Text>
          <Heading style={h1}>New login detected</Heading>
          <Text style={subtitle}>
            Hi {recipientName || 'there'}, your {SITE_NAME} account was just signed in successfully.
          </Text>
        </Section>

        <Section style={detailsCard}>
          <Row label="Account" value={email} />
          <Row label="Login time" value={loginTime || new Date().toUTCString()} />
          <Row label="Method" value={method || 'Email/password'} />
          <Row label="Device" value={device || 'Browser session'} />
        </Section>

        <Text style={text}>
          If this was you, no action is needed. If you do not recognize this login, reset your password immediately and contact Aireatro support.
        </Text>

        <Section style={{ textAlign: 'center' as const, margin: '24px 0 8px' }}>
          <Button style={primaryBtn} href={`${SITE_URL}/forgot-password`}>Reset Password</Button>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>Sent by {SITE_NAME} security from admin@aireatro.com.</Text>
        <Text style={footerSm}><Link href={SITE_URL} style={{ color: '#94a3b8' }}>{SITE_URL}</Link></Text>
      </Container>
    </Body>
  </Html>
)

const Row: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
    <tbody>
      <tr>
        <td style={kvLabel}>{label}</td>
        <td style={kvValue}>{value || '—'}</td>
      </tr>
    </tbody>
  </table>
)

export const template = {
  component: LoginNotificationCustomerEmail,
  subject: `New login to your ${SITE_NAME} account`,
  displayName: 'Login notification — customer',
  previewData: {
    recipientName: 'Jane',
    email: 'jane@example.com',
    loginTime: new Date().toUTCString(),
    method: 'Email/password',
    device: 'Chrome on macOS',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { backgroundColor: '#ffffff', padding: '30px 26px', maxWidth: '600px', margin: '0 auto', border: '1px solid #e2e8f0', borderRadius: '16px' }
const hero = { textAlign: 'center' as const, marginBottom: '14px' }
const eyebrow = { color: '#16a34a', fontSize: '12px', fontWeight: 800 as const, letterSpacing: '0.08em', textTransform: 'uppercase' as const, margin: '0 0 8px' }
const h1 = { fontSize: '26px', fontWeight: 800 as const, color: '#0a0f1f', margin: '0 0 10px' }
const subtitle = { fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0' }
const detailsCard = { background: '#f8fafc', border: '1px solid #dbe7df', borderRadius: '12px', padding: '14px 18px', margin: '18px 0' }
const kvLabel = { fontSize: '11px', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.5px', padding: '6px 10px 6px 0', width: '34%' as const, fontWeight: 700 as const }
const kvValue = { fontSize: '13px', color: '#0a0f1f', padding: '6px 0', fontWeight: 600 as const }
const text = { fontSize: '14px', color: '#475569', lineHeight: '1.65', margin: '0' }
const primaryBtn = { backgroundColor: '#16a34a', color: '#ffffff', fontSize: '14px', fontWeight: 800 as const, borderRadius: '10px', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#64748b', textAlign: 'center' as const, margin: '0 0 6px' }
const footerSm = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: 0 }