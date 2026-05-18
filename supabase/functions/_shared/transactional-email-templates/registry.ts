/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as completeSignupReminder } from './complete-signup-reminder.tsx'
import { template as createWorkspaceReminder } from './create-workspace-reminder.tsx'
import { template as contactsExport } from './contacts-export.tsx'
import { template as contactRequestCustomer } from './contact-request-customer.tsx'
import { template as contactRequestAdmin } from './contact-request-admin.tsx'
import { template as contactRequestReply } from './contact-request-reply.tsx'
import { template as loginNotificationCustomer } from './login-notification-customer.tsx'
import { template as loginNotificationAdmin } from './login-notification-admin.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'complete-signup-reminder': completeSignupReminder,
  'create-workspace-reminder': createWorkspaceReminder,
  'contacts-export': contactsExport,
  'contact-request-customer': contactRequestCustomer,
  'contact-request-admin': contactRequestAdmin,
  'contact-request-reply': contactRequestReply,
  'login-notification-customer': loginNotificationCustomer,
  'login-notification-admin': loginNotificationAdmin,
}
