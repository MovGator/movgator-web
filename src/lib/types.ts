export type MediaType = "movie" | "anime" | "series";

export interface Title {
  id: string;
  provider: string;
  provider_id: string;
  title: string;
  original_title?: string | null;
  media_type: MediaType;
  is_anime: boolean;
  synopsis: string;
  release_date?: string | null;
  release_year?: number | null;
  runtime_min?: number | null;
  genres: string[];
  poster_url?: string | null;
  backdrop_url?: string | null;
  trailer_key?: string | null;
  tmdb_rating?: number | null;
  certification?: string | null;
  is_adult?: boolean;
  popularity: number;
  hidden_gem: boolean;
  provenance: string;
}

export interface FeedSection {
  key: string;
  title: string;
  items: Title[];
  next_cursor?: number | null;
  total?: number;
}

export interface FeedSectionPaginated {
  key: string;
  title: string;
  items: Title[];
  next_cursor?: number | null;
  total?: number;
}

export interface FeedResponse {
  sections: FeedSection[];
  feed: Title[];
  next_cursor: number | null;
  total: number;
  section?: FeedSectionPaginated;
}

export interface Genre {
  id: string;
  label: string;
  is_anime_category: boolean;
}

export interface Me {
  id: string;
  email: string;
  email_verified: boolean;
  email_verification_required: boolean;
  display_name: string;
  avatar_provider: string;
  avatar_seed?: string | null;
  avatar_url?: string | null;
  theme: "light" | "dark" | "system";
  onboarding_done: boolean;
  auth_provider: string;
  age_verified: boolean;
  has_password: boolean;
}
