
-- Allow agents to update their own auto-reply settings
CREATE POLICY "Agents can update own auto-reply"
ON public.agents
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
