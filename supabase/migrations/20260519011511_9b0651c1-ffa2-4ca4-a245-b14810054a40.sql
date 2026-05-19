INSERT INTO public.platform_settings (key, value)
VALUES ('whatsapp_otp_enabled', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;