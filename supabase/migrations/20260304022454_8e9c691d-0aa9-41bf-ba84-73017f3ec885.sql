
-- Drop the restrictive SELECT policies on support_messages
DROP POLICY IF EXISTS "Staff can view all support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Users can view own report messages" ON public.support_messages;

-- Recreate as PERMISSIVE so either one passing grants access
CREATE POLICY "Staff can view all support messages"
  ON public.support_messages FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'support'::app_role)
    OR has_role(auth.uid(), 'moderator'::app_role)
  );

CREATE POLICY "Users can view own report messages"
  ON public.support_messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = support_messages.report_id
      AND reports.reporter_id = auth.uid()
    )
  );
