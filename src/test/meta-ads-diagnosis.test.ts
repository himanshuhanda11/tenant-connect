import { describe, it, expect } from 'vitest';
import { diagnoseMetaConnection, REQUIRED_PERMISSIONS } from '../../supabase/functions/_shared/metaAdsDiagnosis';

const granted = (names: string[]) => names.map((permission) => ({ permission, status: 'granted' }));
const LEAD = ['leads_retrieval', 'pages_manage_ads', 'pages_show_list', 'pages_read_engagement', 'pages_manage_metadata', 'business_management'];
// What Meta reported live for the AIREATRO app in Oct 2026 (no ads_read / ads_management)
const APP_LIVE_WITHOUT_ADS = [...LEAD, 'email', 'public_profile', 'whatsapp_business_management'];
const APP_LIVE_ALL = [...APP_LIVE_WITHOUT_ADS, 'ads_read', 'ads_management'];

describe('diagnoseMetaConnection', () => {
  it('blames Meta app approval (not the customer) when ad permissions are not approved for the app', () => {
    const d = diagnoseMetaConnection({
      tokenValid: true,
      userPermissions: granted(LEAD),
      appLivePermissions: APP_LIVE_WITHOUT_ADS,
      adAccounts: { count: 0, error: { code: 200, message: '(#200) Missing Permissions' } },
      pagesCount: 1,
    });
    expect(d.code).toBe('app_review_required');
    expect(d.whoFixes).toBe('aireatro');
    expect(d.permissions.find((p) => p.permission === 'ads_read')?.state).toBe('not_approved_by_meta');
  });

  it('asks the customer to re-allow when they declined ad access', () => {
    const d = diagnoseMetaConnection({
      tokenValid: true,
      userPermissions: [...granted(LEAD), { permission: 'ads_read', status: 'declined' }],
      appLivePermissions: APP_LIVE_ALL,
      adAccounts: { count: 0, error: { code: 200 } },
      pagesCount: 1,
    });
    expect(d.code).toBe('ads_permission_declined');
    expect(d.whoFixes).toBe('customer');
  });

  it('treats missing ad permission as customer-fixable when the app is approved', () => {
    const d = diagnoseMetaConnection({
      tokenValid: true,
      userPermissions: granted(LEAD),
      appLivePermissions: APP_LIVE_ALL,
      adAccounts: { count: 0, error: { code: 200 } },
      pagesCount: 1,
    });
    expect(d.code).toBe('ads_permission_missing');
  });

  it('does not claim an app-review problem when the app approval list could not be read', () => {
    const d = diagnoseMetaConnection({
      tokenValid: true,
      userPermissions: granted(LEAD),
      appLivePermissions: null,
      adAccounts: { count: 0, error: { code: 200 } },
      pagesCount: 1,
    });
    expect(d.code).toBe('ads_permission_missing');
  });

  it('reports an expired token before anything else', () => {
    const d = diagnoseMetaConnection({
      tokenValid: false,
      userPermissions: [],
      appLivePermissions: APP_LIVE_ALL,
      adAccounts: { count: 0, error: { code: 190 } },
      pagesCount: 0,
    });
    expect(d.code).toBe('token_invalid');
  });

  it('distinguishes zero shared ad accounts from a permission problem', () => {
    const d = diagnoseMetaConnection({
      tokenValid: true,
      userPermissions: granted(REQUIRED_PERMISSIONS),
      appLivePermissions: APP_LIVE_ALL,
      adAccounts: { count: 0 },
      pagesCount: 2,
    });
    expect(d.code).toBe('no_ad_accounts');
  });

  it('flags a Graph access error when permissions are granted but the account is blocked', () => {
    const d = diagnoseMetaConnection({
      tokenValid: true,
      userPermissions: granted(REQUIRED_PERMISSIONS),
      appLivePermissions: APP_LIVE_ALL,
      adAccounts: { count: 0, error: { code: 10, message: 'Application does not have permission' } },
      pagesCount: 1,
    });
    expect(d.code).toBe('ad_account_access_denied');
  });

  it('treats unknown Graph errors as temporary, not as a permission problem', () => {
    const d = diagnoseMetaConnection({
      tokenValid: true,
      userPermissions: granted(REQUIRED_PERMISSIONS),
      appLivePermissions: APP_LIVE_ALL,
      adAccounts: { count: 0, error: { code: 2, message: 'Service temporarily unavailable' } },
      pagesCount: 1,
    });
    expect(d.code).toBe('graph_error');
  });

  it('is ok with multiple ad accounts and all permissions', () => {
    const d = diagnoseMetaConnection({
      tokenValid: true,
      userPermissions: granted(REQUIRED_PERMISSIONS),
      appLivePermissions: APP_LIVE_ALL,
      adAccounts: { count: 3 },
      pagesCount: 2,
    });
    expect(d.code).toBe('ok');
    expect(d.severity).toBe('ok');
    expect(d.missingPermissions).toEqual([]);
  });
});
