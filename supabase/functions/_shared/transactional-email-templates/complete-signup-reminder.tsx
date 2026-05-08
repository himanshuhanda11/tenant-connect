/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Aireatro'
const SITE_URL = 'https://aireatro.com'

interface Props {
  name?: string
  resumeUrl?: string
}

const CompleteSignupReminderEmail = ({ name, resumeUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Finish setting up your {SITE_NAME} account — 5x your business with WhatsApp</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={hero}>
          <Heading style={h1}>{name ? `${name}, ` : ''}your account is almost ready 🚀</Heading>
          <Text style={subtitle}>
            You're one step away from unlocking the WhatsApp CRM that helps brands
            <strong> 5x their conversions</strong>.
          </Text>
        </Section>

        <Section style={card}>
          <Heading as="h2" style={h2}>Complete your profile in &lt; 2 minutes</Heading>
          <Text style={text}>
            Finish signing up and instantly get access to:
          </Text>
          <ul style={list}>
            <li style={li}>📈 AI-powered lead capture &amp; qualification</li>
            <li style={li}>💬 Unified WhatsApp inbox for your whole team</li>
            <li style={li}>🤖 Smart auto-replies &amp; broadcasts that convert</li>
            <li style={li}>📊 Real-time analytics &amp; ROI attribution</li>
          </ul>

          <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
            <Button style={button} href={resumeUrl || `${SITE_URL}/signup`}>
              Complete Signup →
            </Button>
          </Section>
          <Text style={muted}>Setup takes &lt; 10 minutes. No credit card required.</Text>
        </Section>

        <Section style={statsCard}>
          <Text style={statHeading}>Why teams choose {SITE_NAME}</Text>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <tbody>
              <tr>
                <td style={statCell}><div style={statNum}>5×</div><div style={statLbl}>Higher reply rates</div></td>
                <td style={statCell}><div style={statNum}>10 min</div><div style={statLbl}>Avg. setup time</div></td>
                <td style={statCell}><div style={statNum}>24/7</div><div style={statLbl}>AI assistance</div></td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Need help? Just reply to this email — a real human reads every message.<br />
          <Link href={SITE_URL} style={link}>{SITE_NAME}</Link> · The WhatsApp CRM built for growth
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CompleteSignupReminderEmail,
  subject: 'Finish your Aireatro signup — 5x your business with WhatsApp',
  displayName: 'Complete signup reminder',
  previewData: { name: 'Alex', resumeUrl: 'https://aireatro.com/signup' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const hero = { textAlign: 'center' as const, padding: '8px 0 24px' }
const h1 = { fontSize: '26px', fontWeight: 700 as const, color: '#0a0f1f', margin: '0 0 12px', lineHeight: '1.3' }
const subtitle = { fontSize: '15px', color: '#475569', margin: 0, lineHeight: '1.6' }
const card = {
  background: 'linear-gradient(135deg,#f0fdf4 0%,#ecfeff 100%)',
  border: '1px solid #d1fae5',
  borderRadius: '14px',
  padding: '28px 24px',
  margin: '20px 0',
}
const h2 = { fontSize: '18px', fontWeight: 700 as const, color: '#0a0f1f', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '0 0 12px' }
const list = { padding: '0 0 0 18px', margin: '0 0 8px', color: '#334155' }
const li = { fontSize: '14px', lineHeight: '1.9' }
const button = {
  backgroundColor: '#16a34a',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '10px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const muted = { fontSize: '12px', color: '#64748b', textAlign: 'center' as const, margin: '8px 0 0' }
const statsCard = { background: '#0a0f1f', borderRadius: '14px', padding: '22px 18px', margin: '20px 0', color: '#fff' }
const statHeading = { fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '1px', color: '#94a3b8', margin: '0 0 14px', textAlign: 'center' as const }
const statCell = { textAlign: 'center' as const, padding: '4px', verticalAlign: 'top' as const, width: '33%' }
const statNum = { fontSize: '22px', fontWeight: 800 as const, color: '#22d3ee' }
const statLbl = { fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }
const hr = { borderColor: '#e5e7eb', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', textAlign: 'center' as const }
const link = { color: '#16a34a', textDecoration: 'none', fontWeight: 600 as const }
