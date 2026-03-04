
-- Support messages table for report conversations
CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages on their own reports
CREATE POLICY "Users can view own report messages"
  ON public.support_messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.reports WHERE id = report_id AND reporter_id = auth.uid())
  );

-- Staff can view all support messages
CREATE POLICY "Staff can view all support messages"
  ON public.support_messages FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'support') OR
    public.has_role(auth.uid(), 'moderator')
  );

-- Authenticated users can send support messages
CREATE POLICY "Users can send support messages"
  ON public.support_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Staff can delete support messages (for cleanup on resolve)
CREATE POLICY "Staff can delete support messages"
  ON public.support_messages FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'support') OR
    public.has_role(auth.uid(), 'moderator')
  );

-- Site settings table for customization
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for support messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Allow staff to delete reports
CREATE POLICY "Staff can delete reports"
  ON public.reports FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'support') OR
    public.has_role(auth.uid(), 'moderator')
  );

-- Allow users to update chat messages (mark as read)
CREATE POLICY "Users can mark messages as read"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = receiver_id);
