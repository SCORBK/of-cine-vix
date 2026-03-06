
-- Add content_type to movies (movie vs series)
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'movie';

-- Episodes table for series
CREATE TABLE public.episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  season_number integer NOT NULL DEFAULT 1,
  episode_number integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  description text,
  video_url text,
  thumbnail_url text,
  duration text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(movie_id, season_number, episode_number)
);

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view episodes" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Admins can manage episodes" ON public.episodes FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Moderators can manage episodes" ON public.episodes FOR ALL USING (has_role(auth.uid(), 'moderator'));
