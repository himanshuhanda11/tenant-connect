/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Aireatro'

interface Props {
  recipientName?: string
  accountEmail?: string
  contactCount?: number
  workspaceCount?: number
  downloadUrl?: string
  expiresAt?: string
  isAdminCopy?: boolean
}

const ContactsExportEmail = ({
  recipientName, accountEmail, contactCount, workspaceCount, downloadUrl, expiresAt, isAdminCopy,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {isAdminCopy
        ? `Account deleted — contacts archive for ${accountEmail || 'user'}`
        : 'Your contacts archive from Aireatro'}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {isAdminCopy ? '🗄️ Account Deletion Archive' : '📂 Your Contacts Archive'}
        </Heading>
        <Text style={text}>
          {isAdminCopy
            ? <>The account <strong>{accountEmail}</strong> was permanently deleted.
              A complete contacts export is attached below for your records.</>
            : <>Hi {recipientName || 'there'}, as requested, your account on {SITE_NAME} has been
              permanently deleted. Below is your full contacts export — please download it within 7 days.</>}
        </Text>

        <Section style={statBox}>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={statCell}>
                  <div style={statNum}>{contactCount ?? 0}</div>
                  <div style={statLbl}>Contacts</div>
                </td>
                <td style={statCell}>
                  <div style={statNum}>{workspaceCount ?? 0}</div>
                  <div style={statLbl}>Workspaces</div>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          {downloadUrl && (
            <Button style={button} href={downloadUrl}>Download CSV</Button>
          )}
          <Text style={muted}>
            CSV is grouped by team and sorted by date (newest first).
            {expiresAt ? <> Link expires on {expiresAt}.</> : null}
          </Text>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          {isAdminCopy
            ? 'This is an automated archive sent to platform admins for compliance.'
            : <>If you didn't request this deletion, please <Link href="https://aireatro.com/contact" style={link}>contact us immediately</Link>.</>}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactsExportEmail,
  subject: (d: Record<string, any>) =>
    d.isAdminCopy
      ? `[Archive] Account deleted: ${d.accountEmail || 'user'} — contacts attached`
      : 'Your contacts archive from Aireatro',
  displayName: 'Contacts export (account deletion)',
  previewData: {
    recipientName: 'Alex',
    accountEmail: 'alex@example.com',
    contactCount: 1284,
    workspaceCount: 2,
    downloadUrl: 'https://example.com/download',
    expiresAt: '2026-05-15',
    isAdminCopy: false,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 700 as const, color: '#0a0f1f', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#334155', lineHeight: '1.7', margin: '0 0 16px' }
const statBox = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', margin: '16px 0' }
const statCell = { textAlign: 'center' as const, padding: '8px', width: '50%' }
const statNum = { fontSize: '26px', fontWeight: 800 as const, color: '#0a0f1f' }
const statLbl = { fontSize: '12px', color: '#64748b', marginTop: '4px', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const button = {
  backgroundColor: '#0a0f1f', color: '#ffffff', fontSize: '14px', fontWeight: 600 as const,
  borderRadius: '10px', padding: '12px 24px', textDecoration: 'none', display: 'inline-block',
}
const muted = { fontSize: '12px', color: '#94a3b8', margin: '12px 0 0' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0 12px' }
const footer = { fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', textAlign: 'center' as const }
const link = { color: '#dc2626', textDecoration: 'underline' }
