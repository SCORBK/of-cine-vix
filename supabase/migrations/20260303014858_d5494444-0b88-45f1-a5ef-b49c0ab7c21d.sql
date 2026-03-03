
-- Create storage bucket for user uploads (avatars, covers)
INSERT INTO storage.buckets (id, name, public) VALUES ('user-uploads', 'user-uploads', true);

-- Anyone can view uploads
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'user-uploads');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own files
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (
  bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (
  bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
