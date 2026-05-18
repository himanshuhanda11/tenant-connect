/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Aireatro'
const ADMIN_URL = 'https://app.aireatro.com/control'

interface Props {
  userId?: string
  email?: string
  fullName?: string
  loginTime?: string
  device?: string
  method?: string
}

const LoginNotificationAdminEmail = ({
  userId, email, fullName, loginTime, device, method,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Customer login: ${email || 'Aireatro account'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={topBar}>
          <Text style={topBarText}>🔐 Customer login notification</Text>
        </Section>

        <Heading style={h1}>A customer signed in</Heading>

        <Section style={card}>
          <Row label="Name" value={fullName} />
          <Row label="Email" value={email} link={email ? `mailto:${email}` : undefined} />
          <Row label="User ID" value={userId} />
          <Row label="Login time" value={loginTime || new Date().toUTCString()} />
          <Row label="Method" value={method || 'Email/password'} />
          <Row label="Device" value={device || 'Browser session'} />
        </Section>

        <Section style={{ textAlign: 'center' as const, margin: '18px 0' }}>
          <Button style={primaryBtn} href={ADMIN_URL}>Open Control Center →</Button>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>Internal security notification · {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

const Row: React.FC<{ label: string; value?: string; link?: string }> = ({ label, value, link }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
    <tbody>
      <tr>
        <td style={kvLabel}>{label}</td>
        <td style={kvValue}>{value ? (link ? <Link href={link} style={{ color: '#0a0f1f' }}>{value}</Link> : value) : <span style={{ color: '#94a3b8' }}>—</span>}</td>
      </tr>
    </tbody>
  </table>
)

export const template = {
  component: LoginNotificationAdminEmail,
  to: 'admin@aireatro.com',
  subject: (d: Record<string, any>) => `Customer login: ${d.email || 'Aireatro account'}`,
  displayName: 'Login notification — admin',
  previewData: {
    userId: '00000000-0000-4000-8000-000000000000',
    email: 'jane@example.com',
    fullName: 'Jane Doe',
    loginTime: new Date().toUTCString(),
    method: 'Email/password',
    device: 'Chrome on macOS',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { backgroundColor: '#ffffff', padding: '26px', maxWidth: '640px', margin: '0 auto', border: '1px solid #e2e8f0', borderRadius: '16px' }
const topBar = { background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px' }
const topBarText = { fontSize: '13px', fontWeight: 800 as const, color: '#ffffff', margin: 0, letterSpacing: '0.3px' }
const h1 = { fontSize: '23px', fontWeight: 800 as const, color: '#0a0f1f', margin: '0 0 14px' }
const card = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', margin: '14px 0' }
const kvLabel = { fontSize: '11px', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.5px', padding: '6px 10px 6px 0', width: '32%' as const, fontWeight: 700 as const, verticalAlign: 'top' as const }
const kvValue = { fontSize: '13px', color: '#0a0f1f', padding: '6px 0', fontWeight: 600 as const, verticalAlign: 'top' as const, wordBreak: 'break-word' as const }
const primaryBtn = { backgroundColor: '#0a0f1f', color: '#ffffff', fontSize: '13px', fontWeight: 800 as const, borderRadius: '8px', padding: '11px 20px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0 10px' }
const footer = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: 0 }