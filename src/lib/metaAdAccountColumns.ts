// Columns of smeksh_meta_ad_accounts the browser is allowed to read.
// Facebook access tokens are server-only (column privileges block them), so never select '*'.
export const META_AD_ACCOUNT_PUBLIC_COLUMNS =
  'id, workspace_id, meta_account_id, meta_account_name, meta_user_id, meta_user_name, token_expires_at, facebook_page_id, facebook_page_name, whatsapp_phone_number_id, whatsapp_display_number, status, last_synced_at, sync_error, is_active, connected_by, created_at, updated_at, setup_data, instagram_account_id, instagram_username, pixel_id, pixel_name, scopes_granted, business_id, business_name' as const;
