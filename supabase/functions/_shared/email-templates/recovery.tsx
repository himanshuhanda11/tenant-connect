/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Choose a new AiReatro password securely</Preview>
    <Body style={main}>
      <Container style={container}>
        <Container style={card}>
          <Img
            src="https://aireatro.com/logo.svg"
            alt="AiReatro"
            width="156"
            style={logo}
          />
          <Text style={eyebrow}>Secure account recovery</Text>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            We received a request to create a new password for your AiReatro
            account. Use the secure button below to continue.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Reset Password
          </Button>
          <Text style={linkHelp}>
            Button not working? Copy and paste this link into your browser:
          </Text>
          <Text style={linkText}>{confirmationUrl}</Text>
        </Container>
        <Text style={text}>
          This link expires soon for your protection. If you didn't request a
          password reset, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          Sent by AiReatro from noreply@update.aireatro.com. Add this address to
          your contacts so future password reset emails land in your inbox.
        </Text>
        <Text style={footer}>© AiReatro — WhatsApp CRM automation</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
}
const container = { padding: '28px 18px', maxWidth: '560px', margin: '0 auto' }
const card = {
  backgroundColor: '#f8faf9',
  border: '1px solid #dfe8e3',
  borderRadius: '18px',
  padding: '34px 28px',
}
const logo = { margin: '0 0 28px', display: 'block' as const }
const eyebrow = {
  color: 'hsl(142, 70%, 34%)',
  fontSize: '12px',
  fontWeight: '700' as const,
  letterSpacing: '0.08em',
  margin: '0 0 10px',
  textTransform: 'uppercase' as const,
}
const h1 = {
  fontSize: '28px',
  lineHeight: '1.2',
  fontWeight: '700' as const,
  color: 'hsl(220, 20%, 10%)',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(220, 10%, 46%)',
  lineHeight: '1.65',
  margin: '22px 0 0',
}
const button = {
  backgroundColor: 'hsl(142, 70%, 45%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '700' as const,
  borderRadius: '10px',
  padding: '14px 22px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '8px 0 24px',
}
const linkHelp = { fontSize: '12px', color: 'hsl(220, 10%, 46%)', margin: '0 0 8px' }
const linkText = {
  color: 'hsl(142, 70%, 34%)',
  fontSize: '12px',
  lineHeight: '1.55',
  wordBreak: 'break-all' as const,
  margin: '0',
}
const footer = { fontSize: '12px', color: '#9aa5a0', margin: '16px 0 0', textAlign: 'center' as const }
