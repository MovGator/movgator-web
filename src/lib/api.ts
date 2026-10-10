import type { Genre, Title } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function csrf(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(/(?:^|; )mr_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** Hard ceiling per request. Without this, a sleeping backend hangs
 *  Vercel prerender past its 60s page budget and fails the whole build;
 *  with it, SSR falls back gracefully and ISR revalidates when the API wakes. */
const TIMEOUT_MS = 15000;

let isRefreshing = false;
let refreshPromise: Promise<import("./types").Me> | null = null;

async function refreshAuth(): Promise<import("./types").Me> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = req<import("./types").Me>(`/api/v1/auth/refresh`, {
    method: "POST",
    body: "{}",
  }).finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });
  return refreshPromise;
}

async function req<T>(path: string, init?: RequestInit, isRetry = false): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  const token = init?.method && init.method !== "GET" ? csrf() : undefined;
  if (token) headers["x-csrf-token"] = token;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers,
      credentials: "include",
      signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "TimeoutError") {
      throw new ApiError(504, "timeout", "The catalogue is waking up. Try again in a moment.");
    }
    throw new ApiError(503, "unreachable", "Couldn't reach the catalogue service.");
  }
  if (!res.ok) {
    // Handle 401 with automatic token refresh and retry
    if (res.status === 401 && !isRetry && (path === "/api/v1/me" || init?.method)) {
      try {
        await refreshAuth();
        // Retry the original request once after refresh
        return req<T>(path, init, true);
      } catch {
        // Refresh failed, throw original error
      }
    }
    let code = "http_error";
    let message = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      code = j?.error?.code ?? code;
      message = j?.error?.message ?? message;
    } catch {
      /* keep generic */
    }
    throw new ApiError(res.status, code, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  feed: (cursor = 0, limit = 12) =>
    req<{ sections: { key: string; title: string; items: Title[] }[]; feed: Title[]; next_cursor: number | null; total: number }>(
      `/api/v1/feed?cursor=${cursor}&limit=${limit}`
    ),
  search: (params: Record<string, string | number>) => {
    const q = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    return req<{ items: Title[]; next_cursor: number | null; total: number }>(
      `/api/v1/search?${q}`
    );
  },
  title: (id: string) => req<Title>(`/api/v1/titles/${id}`),
  related: (id: string) => req<Title[]>(`/api/v1/titles/${id}/related`),
  genres: () => req<Genre[]>(`/api/v1/genres`),
  onboarding: (genre_ids: string[], include_anime: boolean) =>
    req<Title[]>(`/api/v1/onboarding/recommendations`, {
      method: "POST",
      body: JSON.stringify({ genre_ids, include_anime }),
    }),
  dice: (body: object) =>
    req<{ pick: Title | null; candidate_count: number }>(`/api/v1/dice/roll`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: () => req<import("./types").Me>(`/api/v1/me`),
  patchMe: (body: object) =>
    req<import("./types").Me>(`/api/v1/me`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteMe: () => req<{ ok: boolean }>(`/api/v1/me`, { method: "DELETE" }),
  register: (body: object) =>
    req<import("./types").Me>(`/api/v1/auth/register`, { method: "POST", body: JSON.stringify(body) }),
  login: (body: object) =>
    req<import("./types").Me>(`/api/v1/auth/login`, { method: "POST", body: JSON.stringify(body) }),
  logout: () => req<{ ok: boolean }>(`/api/v1/auth/logout`, { method: "POST", body: "{}" }),
  refreshSession: () => req<import("./types").Me>(`/api/v1/auth/refresh`, { method: "POST", body: "{}" }),
  googleUrl: () => req<{ url: string }>(`/api/v1/auth/google/url`),
  watchlist: () => req<Title[]>(`/api/v1/me/watchlist`),
  watchlistAdd: (title_id: string) =>
    req<{ ok: boolean }>(`/api/v1/me/watchlist`, { method: "POST", body: JSON.stringify({ title_id }) }),
  watchlistRm: (title_id: string) =>
    req<{ ok: boolean }>(`/api/v1/me/watchlist/${title_id}`, { method: "DELETE" }),
  ratings: () => req<{ title_id: string; score: number; liked: boolean }[]>(`/api/v1/me/ratings`),
  rate: (body: object) => req<{ ok: boolean }>(`/api/v1/me/ratings`, { method: "POST", body: JSON.stringify(body) }),
  watchedAdd: (title_id: string) =>
    req<{ ok: boolean }>(`/api/v1/me/watched`, { method: "POST", body: JSON.stringify({ title_id }) }),
  swipe: (body: object) => req<{ ok: boolean }>(`/api/v1/me/swipes`, { method: "POST", body: JSON.stringify(body) }),
  prefs: () => req<{ favourite_genres: string[]; include_anime: boolean }>(`/api/v1/me/preferences`),
  prefsPatch: (body: object) =>
    req<{ ok: boolean }>(`/api/v1/me/preferences`, { method: "PATCH", body: JSON.stringify(body) }),
  nightCreate: (body: { name: string; scheduled_at?: string | null; blind_voting?: boolean; prefs?: Record<string, unknown> }) =>
    req<NightCreated>(
      `/api/v1/movie-nights`, { method: "POST", body: JSON.stringify(body) }
    ),
  nightMine: (guestKeys: string[]) =>
    req<NightHistory[]>(`/api/v1/movie-nights?guest_keys=${encodeURIComponent(guestKeys.join(","))}`),
  nightJoin: (id: string, body: object) =>
    req<{ voter_key: string; guest_key: string; snapshot: NightSnapshot }>(
      `/api/v1/movie-nights/${id}/join`, { method: "POST", body: JSON.stringify(body) }
    ),
  nightSnapshot: (id: string, invite: string) =>
    req<NightSnapshot>(`/api/v1/movie-nights/${id}?invite=${encodeURIComponent(invite)}`),
  nightAddCandidate: (id: string, title_id: string, guest_key = "") =>
    req<{ candidate_id: string }>(`/api/v1/movie-nights/${id}/candidates`, {
      method: "POST",
      body: JSON.stringify({ title_id, guest_key }),
    }),
  nightVote: (id: string, candidate_id: string, guest_key = "") =>
    req<{ winner: string | null; tied: string[] }>(`/api/v1/movie-nights/${id}/votes`, {
      method: "POST",
      body: JSON.stringify({ candidate_id, guest_key }),
    }),
  nightTiebreak: (id: string, guest_key = "") =>
    req<{ winner: string | null; tied: string[] }>(`/api/v1/movie-nights/${id}/tiebreak`, {
      method: "POST",
      body: JSON.stringify({ guest_key }),
    }),
};

export interface NightCreated {
  id: string;
  code: string;
  name: string;
  status: string;
  invite_url: string | null;
  scheduled_at: string | null;
  blind_voting: boolean;
  prefs: Record<string, unknown>;
}

export interface NightHistory {
  id: string;
  code: string;
  name: string;
  status: string;
  winner_title_id: string | null;
  scheduled_at: string | null;
  member_count: number;
  candidate_count: number;
  created_at: string | null;
}

export interface NightSnapshot {
  night: {
    id: string;
    code: string;
    name: string;
    status: string;
    winner_title_id: string | null;
    scheduled_at: string | null;
    blind_voting: boolean;
    prefs: Record<string, unknown>;
    total_votes: number;
  };
  members: { display_name: string; kind: string }[];
  candidates: {
    id: string;
    title: string;
    media_type: string;
    is_anime: boolean;
    release_year: number | null;
    genres: string[];
    poster_url: string | null;
    votes: number;
    candidate_id: string;
  }[];
  votes: Record<string, number>;
}

export function wsUrl(nightId: string, voter: string, invite: string): string {
  const u = new URL(BASE);
  u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
  u.pathname = `/api/v1/movie-nights/${nightId}/live`;
  u.search = new URLSearchParams({ voter, invite }).toString();
  return u.toString();
}
