// Pure classifier for a customer's Facebook connection. No Deno/Node APIs so it can be unit-tested.
// It turns raw Meta Graph results into one specific, customer-readable cause + recovery steps.

export const ADS_PERMISSIONS = ['ads_read', 'ads_management'] as const;
export const LEAD_PERMISSIONS = [
  'leads_retrieval',
  'pages_manage_ads',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_metadata',
  'business_management',
] as const;
export const REQUIRED_PERMISSIONS: string[] = [...ADS_PERMISSIONS, ...LEAD_PERMISSIONS];

export type PermissionState = 'granted' | 'declined' | 'not_approved_by_meta' | 'not_granted';

export interface PermissionRow {
  permission: string;
  state: PermissionState;
  /** null when Aireatro could not read its own app approval list from Meta */
  appApproved: boolean | null;
}

export interface GraphError {
  code?: number;
  error_subcode?: number;
  message?: string;
  type?: string;
}

export interface DiagnosisInput {
  tokenValid: boolean | null;
  tokenError?: GraphError | null;
  userPermissions: { permission: string; status: string }[];
  appLivePermissions: string[] | null;
  adAccounts: { count: number; error?: GraphError | null };
  pagesCount: number;
}

export type DiagnosisCode =
  | 'ok'
  | 'token_invalid'
  | 'app_review_required'
  | 'ads_permission_declined'
  | 'ads_permission_missing'
  | 'ad_account_access_denied'
  | 'no_ad_accounts'
  | 'graph_error';

export interface Diagnosis {
  code: DiagnosisCode;
  severity: 'ok' | 'warning' | 'error';
  /** Who can fix it: the customer, the Aireatro platform owner (Meta app settings), or nobody */
  whoFixes: 'customer' | 'aireatro' | 'none';
  title: string;
  message: string;
  steps: string[];
  permissions: PermissionRow[];
  missingPermissions: string[];
  adAccountCount: number;
  pagesCount: number;
}

const TOKEN_ERROR_CODES = new Set([190, 102]);
const ACCESS_ERROR_CODES = new Set([10, 200, 294, 270, 3]);

export function buildPermissionRows(
  userPermissions: { permission: string; status: string }[],
  appLivePermissions: string[] | null,
): PermissionRow[] {
  const byName = new Map(userPermissions.map((p) => [p.permission, p.status]));
  return REQUIRED_PERMISSIONS.map((permission) => {
    const status = byName.get(permission);
    const appApproved = appLivePermissions ? appLivePermissions.includes(permission) : null;
    let state: PermissionState;
    if (status === 'granted') state = 'granted';
    else if (status === 'declined') state = 'declined';
    else if (appApproved === false) state = 'not_approved_by_meta';
    else state = 'not_granted';
    return { permission, state, appApproved };
  });
}

export function diagnoseMetaConnection(input: DiagnosisInput): Diagnosis {
  const permissions = buildPermissionRows(input.userPermissions, input.appLivePermissions);
  const missingPermissions = permissions.filter((p) => p.state !== 'granted').map((p) => p.permission);
  const base = {
    permissions,
    missingPermissions,
    adAccountCount: input.adAccounts.count,
    pagesCount: input.pagesCount,
  };

  const tokenBroken =
    input.tokenValid === false ||
    (input.tokenError?.code !== undefined && TOKEN_ERROR_CODES.has(input.tokenError.code)) ||
    (input.adAccounts.error?.code !== undefined && TOKEN_ERROR_CODES.has(input.adAccounts.error.code));
  if (tokenBroken) {
    return {
      ...base,
      code: 'token_invalid',
      severity: 'error',
      whoFixes: 'customer',
      title: 'Facebook login expired',
      message: 'Your Facebook login for Aireatro has expired or was removed. Sign in again to restore access.',
      steps: ['Click Reconnect Facebook and sign in again.'],
    };
  }

  const adsRows = permissions.filter((p) => (ADS_PERMISSIONS as readonly string[]).includes(p.permission));
  const adsReadable = adsRows.some((p) => p.state === 'granted');

  if (!adsReadable) {
    if (adsRows.some((p) => p.state === 'declined')) {
      return {
        ...base,
        code: 'ads_permission_declined',
        severity: 'error',
        whoFixes: 'customer',
        title: 'Ad access was turned off',
        message: 'You turned off the permission that lets Aireatro see your ad accounts.',
        steps: [
          'Click Reconnect Facebook.',
          'When Facebook asks, allow access to your ads (do not untick it).',
          'If Facebook shows a list of ad accounts or businesses, select the ones you want to use.',
        ],
      };
    }
    if (adsRows.every((p) => p.appApproved === false)) {
      return {
        ...base,
        code: 'app_review_required',
        severity: 'error',
        whoFixes: 'aireatro',
        title: 'Ad account access is waiting on Meta approval',
        message:
          "Your Facebook Page and lead forms are connected. Ad accounts can't be listed yet because Meta has not approved Aireatro for ad account access. Reconnecting will not change this — Aireatro support has to complete Meta's approval.",
        steps: [
          'Lead forms and Page features keep working.',
          'Contact Aireatro support; ad accounts will appear after Meta approves access.',
        ],
      };
    }
    return {
      ...base,
      code: 'ads_permission_missing',
      severity: 'error',
      whoFixes: 'customer',
      title: 'Ad access was not granted',
      message: 'Facebook did not give Aireatro permission to see your ad accounts.',
      steps: [
        'Click Reconnect Facebook.',
        'Allow all requested permissions, including access to your ads.',
        'If Facebook shows a list of ad accounts or businesses, select the ones you want to use.',
      ],
    };
  }

  const adErr = input.adAccounts.error;
  if (adErr) {
    if (adErr.code !== undefined && ACCESS_ERROR_CODES.has(adErr.code)) {
      return {
        ...base,
        code: 'ad_account_access_denied',
        severity: 'error',
        whoFixes: 'customer',
        title: 'Facebook blocked access to your ad accounts',
        message: `Facebook refused to list your ad accounts${adErr.message ? ` ("${adErr.message}")` : ''}.`,
        steps: [
          'Check that your Facebook profile has a role on the ad account in Meta Business Settings → Accounts → Ad accounts → People.',
          'Then click Reconnect Facebook and select that ad account.',
        ],
      };
    }
    return {
      ...base,
      code: 'graph_error',
      severity: 'error',
      whoFixes: 'none',
      title: 'Facebook had a temporary problem',
      message: `Facebook returned an error while listing ad accounts${adErr.message ? `: ${adErr.message}` : ''}.`,
      steps: ['Wait a minute and click Refresh Assets or Reconnect Facebook again.'],
    };
  }

  if (input.adAccounts.count === 0) {
    return {
      ...base,
      code: 'no_ad_accounts',
      severity: 'warning',
      whoFixes: 'customer',
      title: 'No ad accounts shared with Aireatro',
      message: 'Ad access is allowed, but no ad account was shared with Aireatro or your profile has none.',
      steps: [
        'Click Reconnect Facebook; if Facebook offers to change settings, select your ad account.',
        'Make sure your Facebook profile has a role on the ad account in Meta Business Settings → Accounts → Ad accounts → People.',
        'If you have no ad account yet, create one in Meta Ads Manager first.',
      ],
    };
  }

  const leadMissing = missingPermissions.filter((p) => (LEAD_PERMISSIONS as readonly string[]).includes(p));
  return {
    ...base,
    code: 'ok',
    severity: leadMissing.length > 0 ? 'warning' : 'ok',
    whoFixes: leadMissing.length > 0 ? 'customer' : 'none',
    title: leadMissing.length > 0 ? 'Connected, some features limited' : 'Connected',
    message:
      leadMissing.length > 0
        ? `Ad accounts are available. Some lead features need extra permissions: ${leadMissing.join(', ')}.`
        : `Found ${input.adAccounts.count} ad account(s) and ${input.pagesCount} page(s).`,
    steps: leadMissing.length > 0 ? ['Click Reconnect Facebook and allow all requested permissions.'] : [],
  };
}
