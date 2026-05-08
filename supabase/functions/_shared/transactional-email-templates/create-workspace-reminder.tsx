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
  workspaceUrl?: string
}

const CreateWorkspaceReminderEmail = ({ name, workspaceUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>One last step — create your workspace and boost your business 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={hero}>
          <Heading style={h1}>{name ? `Welcome, ${name}!` : 'Welcome aboard!'} 👋</Heading>
          <Text style={subtitle}>
            Your account is verified — now <strong>create your workspace</strong> to start
            converting WhatsApp chats into customers.
          </Text>
        </Section>

        <Section style={card}>
          <Heading as="h2" style={h2}>Create your workspace in &lt; 10 minutes</Heading>
          <Text style={text}>
            A workspace is your business hub on {SITE_NAME}. Once it's live, you can:
          </Text>
          <ul style={list}>
            <li style={li}>📞 Connect your WhatsApp Business number</li>
            <li style={li}>👥 Invite teammates &amp; assign roles</li>
            <li style={li}>🎯 Launch broadcast campaigns to all your contacts</li>
            <li style={li}>🧠 Train your AI assistant to qualify leads automatically</li>
          </ul>

          <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
            <Button style={button} href={workspaceUrl || `${SITE_URL}/create-workspace`}>
              Create Workspace →
            </Button>
          </Section>
          <Text style={muted}>Free plan available — no credit card required.</Text>
        </Section>

        <Section style={tipCard}>
          <Text style={tipLabel}>💡 PRO TIP</Text>
          <Text style={tipText}>
            Businesses that activate their workspace within 7 days see
            <strong> 3.4× more leads </strong>in their first month.
          </Text>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Stuck somewhere? Just reply to this email — we'll personally help you get set up.<br />
          <Link href={SITE_URL} style={link}>{SITE_NAME}</Link> · WhatsApp CRM built for growth
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CreateWorkspaceReminderEmail,
  subject: 'Create your workspace and boost your business 🚀',
  displayName: 'Create workspace reminder',
  previewData: { name: 'Alex', workspaceUrl: 'https://aireatro.com/create-workspace' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const hero = { textAlign: 'center' as const, padding: '8px 0 24px' }
const h1 = { fontSize: '26px', fontWeight: 700 as const, color: '#0a0f1f', margin: '0 0 12px' }
const subtitle = { fontSize: '15px', color: '#475569', margin: 0, lineHeight: '1.6' }
const card = {
  background: 'linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%)',
  border: '1px solid #bfdbfe',
  borderRadius: '14px',
  padding: '28px 24px',
  margin: '20px 0',
}
const h2 = { fontSize: '18px', fontWeight: 700 as const, color: '#0a0f1f', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '0 0 12px' }
const list = { padding: '0 0 0 18px', margin: '0 0 8px', color: '#334155' }
const li = { fontSize: '14px', lineHeight: '1.9' }
const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '10px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const muted = { fontSize: '12px', color: '#64748b', textAlign: 'center' as const, margin: '8px 0 0' }
const tipCard = { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px 20px', margin: '20px 0' }
const tipLabel = { fontSize: '11px', fontWeight: 700 as const, letterSpacing: '1.5px', color: '#b45309', margin: '0 0 6px' }
const tipText = { fontSize: '13px', color: '#78350f', lineHeight: '1.6', margin: 0 }
const hr = { borderColor: '#e5e7eb', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', textAlign: 'center' as const }
const link = { color: '#2563eb', textDecoration: 'none', fontWeight: 600 as const }
