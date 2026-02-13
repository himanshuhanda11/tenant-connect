-- Allow anyone to look up an invite by token (for the accept page)
CREATE POLICY "public_invite_lookup_by_token"
ON public.member_invites
FOR SELECT
USING (true);
