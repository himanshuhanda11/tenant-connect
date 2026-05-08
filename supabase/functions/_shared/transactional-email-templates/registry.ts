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

export const TEMPLATES: Record<string, TemplateEntry> = {
  'complete-signup-reminder': completeSignupReminder,
  'create-workspace-reminder': createWorkspaceReminder,
  'contacts-export': contactsExport,
}
