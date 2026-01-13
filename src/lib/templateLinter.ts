import { 
  LintRule, 
  LintValidationResult,
  Template, 
  TemplateVersion,
  TemplateButton 
} from '@/types/template';

// Re-export LintValidationResult for external use
export type { LintValidationResult } from '@/types/template';

// Banned words list (can be extended per tenant)
const BANNED_WORDS = [
  'free', 'winner', 'congratulations', 'click here', 'act now',
  'limited time', 'urgent', 'claim', 'prize', 'lottery'
];

// Lint rules for template validation
export const LINT_RULES: LintRule[] = [
  {
    code: 'VAR_SEQUENTIAL',
    name: 'Variables must be sequential',
    severity: 'error',
    validate: (_, version) => {
      if (!version.body) return null;
      
      const variables = version.body.match(/\{\{(\d+)\}\}/g) || [];
      const numbers = variables.map(v => parseInt(v.replace(/[{}]/g, '')));
      
      if (numbers.length === 0) return null;
      
      const sorted = [...numbers].sort((a, b) => a - b);
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] !== i + 1) {
          return {
            rule_code: 'VAR_SEQUENTIAL',
            severity: 'error',
            message: `Variables must be sequential starting from {{1}}. Found: ${variables.join(', ')}`,
            field: 'body',
            suggestion: 'Renumber variables sequentially: {{1}}, {{2}}, {{3}}, etc.'
          };
        }
      }
      return null;
    }
  },
  {
    code: 'BODY_LENGTH',
    name: 'Body length limit',
    severity: 'error',
    validate: (_, version) => {
      if (!version.body) return null;
      
      if (version.body.length > 1024) {
        return {
          rule_code: 'BODY_LENGTH',
          severity: 'error',
          message: `Body exceeds 1024 characters (current: ${version.body.length})`,
          field: 'body',
          suggestion: 'Shorten the message body to 1024 characters or less'
        };
      }
      return null;
    }
  },
  {
    code: 'BODY_MIN_LENGTH',
    name: 'Body minimum length',
    severity: 'error',
    validate: (_, version) => {
      if (!version.body || version.body.trim().length < 1) {
        return {
          rule_code: 'BODY_MIN_LENGTH',
          severity: 'error',
          message: 'Body cannot be empty',
          field: 'body',
          suggestion: 'Add message content to the body'
        };
      }
      return null;
    }
  },
  {
    code: 'BANNED_WORDS',
    name: 'Banned words check',
    severity: 'warning',
    validate: (template, version) => {
      if (!version.body) return null;
      
      const bodyLower = version.body.toLowerCase();
      const foundWords = BANNED_WORDS.filter(word => bodyLower.includes(word.toLowerCase()));
      
      if (foundWords.length > 0 && template.category === 'UTILITY') {
        return {
          rule_code: 'BANNED_WORDS',
          severity: 'warning',
          message: `Found promotional words in Utility template: ${foundWords.join(', ')}`,
          field: 'body',
          suggestion: 'Utility templates should avoid promotional language. Consider using Marketing category instead.'
        };
      }
      return null;
    }
  },
  {
    code: 'BUTTON_URL_HTTPS',
    name: 'Button URL must be HTTPS',
    severity: 'error',
    validate: (_, version) => {
      if (!version.buttons || !Array.isArray(version.buttons)) return null;
      
      const urlButtons = (version.buttons as TemplateButton[]).filter(b => b.type === 'URL');
      for (const button of urlButtons) {
        if (button.url && !button.url.startsWith('https://')) {
          return {
            rule_code: 'BUTTON_URL_HTTPS',
            severity: 'error',
            message: `Button URL must use HTTPS: ${button.url}`,
            field: 'buttons',
            suggestion: 'Change the URL to use https:// protocol'
          };
        }
      }
      return null;
    }
  },
  {
    code: 'BUTTON_PHONE_E164',
    name: 'Phone number must be E.164 format',
    severity: 'error',
    validate: (_, version) => {
      if (!version.buttons || !Array.isArray(version.buttons)) return null;
      
      const phoneButtons = (version.buttons as TemplateButton[]).filter(b => b.type === 'PHONE_NUMBER');
      const e164Regex = /^\+[1-9]\d{1,14}$/;
      
      for (const button of phoneButtons) {
        if (button.phone_number && !e164Regex.test(button.phone_number)) {
          return {
            rule_code: 'BUTTON_PHONE_E164',
            severity: 'error',
            message: `Phone number must be in E.164 format: ${button.phone_number}`,
            field: 'buttons',
            suggestion: 'Use format: +[country code][number], e.g., +14155551234'
          };
        }
      }
      return null;
    }
  },
  {
    code: 'AUTH_OTP_REQUIRED',
    name: 'Authentication templates must contain OTP',
    severity: 'error',
    validate: (template, version) => {
      if (template.category !== 'AUTHENTICATION') return null;
      if (!version.body) return null;
      
      const hasOtpVariable = version.body.includes('{{1}}');
      const hasOtpKeyword = /otp|code|verification|password/i.test(version.body);
      
      if (!hasOtpVariable || !hasOtpKeyword) {
        return {
          rule_code: 'AUTH_OTP_REQUIRED',
          severity: 'error',
          message: 'Authentication templates must include a verification code variable {{1}} and OTP-related keywords',
          field: 'body',
          suggestion: 'Include {{1}} for the OTP code and mention "verification code" or "OTP" in the message'
        };
      }
      return null;
    }
  },
  {
    code: 'HEADER_LENGTH',
    name: 'Header text length limit',
    severity: 'error',
    validate: (_, version) => {
      if (version.header_type !== 'text' || !version.header_content) return null;
      
      if (version.header_content.length > 60) {
        return {
          rule_code: 'HEADER_LENGTH',
          severity: 'error',
          message: `Header text exceeds 60 characters (current: ${version.header_content.length})`,
          field: 'header',
          suggestion: 'Shorten the header text to 60 characters or less'
        };
      }
      return null;
    }
  },
  {
    code: 'FOOTER_LENGTH',
    name: 'Footer length limit',
    severity: 'error',
    validate: (_, version) => {
      if (!version.footer) return null;
      
      if (version.footer.length > 60) {
        return {
          rule_code: 'FOOTER_LENGTH',
          severity: 'error',
          message: `Footer exceeds 60 characters (current: ${version.footer.length})`,
          field: 'footer',
          suggestion: 'Shorten the footer to 60 characters or less'
        };
      }
      return null;
    }
  },
  {
    code: 'BUTTON_COUNT',
    name: 'Maximum buttons limit',
    severity: 'error',
    validate: (_, version) => {
      if (!version.buttons || !Array.isArray(version.buttons)) return null;
      
      if (version.buttons.length > 3) {
        return {
          rule_code: 'BUTTON_COUNT',
          severity: 'error',
          message: `Too many buttons (${version.buttons.length}). Maximum is 3`,
          field: 'buttons',
          suggestion: 'Remove some buttons to have at most 3'
        };
      }
      return null;
    }
  },
  {
    code: 'VAR_SAMPLES_MISSING',
    name: 'Variable samples should be provided',
    severity: 'warning',
    validate: (_, version) => {
      if (!version.body) return null;
      
      const variables = version.body.match(/\{\{(\d+)\}\}/g) || [];
      if (variables.length === 0) return null;
      
      const samples = version.variable_samples || {};
      const missingVars = variables.filter(v => {
        const num = v.replace(/[{}]/g, '');
        return !samples[num];
      });
      
      if (missingVars.length > 0) {
        return {
          rule_code: 'VAR_SAMPLES_MISSING',
          severity: 'warning',
          message: `Missing sample values for variables: ${missingVars.join(', ')}`,
          field: 'variable_samples',
          suggestion: 'Provide sample values for all variables to improve approval chances'
        };
      }
      return null;
    }
  }
];

export function lintTemplate(
  template: Partial<Template>,
  version: Partial<TemplateVersion>
): LintValidationResult[] {
  const results: LintValidationResult[] = [];
  
  for (const rule of LINT_RULES) {
    const result = rule.validate(template, version);
    if (result) {
      results.push(result);
    }
  }
  
  return results;
}

export function hasLintErrors(results: LintValidationResult[]): boolean {
  return results.some(r => r.severity === 'error');
}

export function calculateTemplateScore(
  lintResults: LintValidationResult[],
  approvalHistory: { approved: number; rejected: number }
): number {
  let score = 100;
  
  // Deduct for lint issues
  const errors = lintResults.filter(r => r.severity === 'error').length;
  const warnings = lintResults.filter(r => r.severity === 'warning').length;
  score -= errors * 20;
  score -= warnings * 5;
  
  // Factor in approval history
  const total = approvalHistory.approved + approvalHistory.rejected;
  if (total > 0) {
    const approvalRate = approvalHistory.approved / total;
    score = Math.round(score * (0.5 + approvalRate * 0.5));
  }
  
  return Math.max(0, Math.min(100, score));
}

export function getSuggestedFix(rejectionReason: string): string | null {
  const fixes: Record<string, string> = {
    'INVALID_PARAMETER': 'Check that all variables {{1}}, {{2}}, etc. are properly formatted and sequential.',
    'PARAM_LENGTH': 'Variable content in the sample may be too long. Try shorter sample values.',
    'INVALID_FORMAT': 'Review the template structure. Ensure header, body, footer, and buttons follow Meta guidelines.',
    'REJECTED_BODY': 'The message body was rejected. Remove promotional language, spelling errors, or policy-violating content.',
    'URL_MISMATCH': 'The button URL domain must match your registered business domain.',
    'INCONSISTENT_LANGUAGE': 'Ensure all text is in the declared template language.'
  };
  
  for (const [key, fix] of Object.entries(fixes)) {
    if (rejectionReason.toUpperCase().includes(key)) {
      return fix;
    }
  }
  
  return 'Review the rejection reason and update the template content accordingly. Common issues include formatting, language consistency, and policy compliance.';
}
