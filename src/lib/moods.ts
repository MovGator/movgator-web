/** Mood browsing: moods are NOT stored metadata — each maps to catalogue
 *  genre slugs and is applied as a real genre filter. The UI states this so
 *  a mood never pretends to be a separate signal. */
export interface Mood {
  id: string;
  label: string;
  genres: string[];
}

export const MOODS: Mood[] = [
  { id: "feel-good", label: "Feel-good", genres: ["comedy", "romance"] },
  { id: "edge-of-seat", label: "Edge of your seat", genres: ["thriller", "crime", "horror"] },
  { id: "mind-bending", label: "Mind-bending", genres: ["mystery", "sci-fi"] },
  { id: "epic", label: "Epic adventure", genres: ["adventure", "fantasy", "action"] },
  { id: "heartfelt", label: "Heartfelt", genres: ["drama", "romance"] },
];

export function genresForMood(moodId: string): string[] {
  return MOODS.find((m) => m.id === moodId)?.genres ?? [];
}
