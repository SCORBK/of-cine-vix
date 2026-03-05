
-- Add verified column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Create avatar_gallery table for admin-uploaded predefined avatars/covers
CREATE TABLE IF NOT EXISTS public.avatar_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  type text NOT NULL DEFAULT 'avatar', -- 'avatar' or 'cover'
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.avatar_gallery ENABLE ROW LEVEL SECURITY;

-- Anyone can view gallery items
CREATE POLICY "Anyone can view gallery" ON public.avatar_gallery
  FOR SELECT TO authenticated USING (true);

-- Admins can manage gallery
CREATE POLICY "Admins can manage gallery" ON public.avatar_gallery
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete followers (for admin followers tab)
DROP POLICY IF EXISTS "Users can unfollow" ON public.followers;
CREATE POLICY "Users or admins can unfollow" ON public.followers
  FOR DELETE TO authenticated
  USING (
    auth.uid() = follower_id 
    OR has_role(auth.uid(), 'admin'::app_role)
  );
