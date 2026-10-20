# Project rules

- Workspace-scoped Meta (Facebook) data syncs (lead forms, pages, leads) must use only that workspace's own connected token from `smeksh_meta_ad_accounts`; never fall back to the platform `META_SYSTEM_USER_TOKEN`. Why: the platform token belongs to another business and leaks its Pages/forms into unconnected workspaces.
