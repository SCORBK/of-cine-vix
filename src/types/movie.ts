export interface DbMovie {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  year: number | null;
  rating: number | null;
  image_url: string | null;
  trailer_url: string | null;
  created_at: string;
  updated_at: string;
}
