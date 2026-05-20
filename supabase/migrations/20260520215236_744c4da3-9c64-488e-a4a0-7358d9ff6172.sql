-- Add DRAFT status for templates so drafts persist independently of Meta-side states
ALTER TYPE template_status ADD VALUE IF NOT EXISTS 'DRAFT' BEFORE 'PENDING';