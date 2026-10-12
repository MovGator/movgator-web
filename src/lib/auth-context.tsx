"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "./api";
import type { Me } from "./types";

interface AuthCtx {
  me: Me | null;
  loading: boolean;
  splashDone: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Adult-content filter state. True = covers obscured (default, incl. anonymous). */
  filterOn: boolean;
  setFilterOn: (on: boolean) => void;
  refreshFilter: () => Promise<void>;
}
const Ctx = createContext<AuthCtx>({ me: null, loading: true, splashDone: false, refresh: async () => {}, signOut: async () => {}, filterOn: true, setFilterOn: () => {}, refreshFilter: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [filterOn, setFilterOn] = useState(true);
  const loadingRef = useRef(loading);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const refresh = useCallback(async () => {
    try {
      setMe(await api.me());
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshFilter = useCallback(async () => {
    try {
      const p = await api.prefs();
      setFilterOn(p.adult_filter_enabled);
    } catch {
      // Anonymous or unreachable: filter stays on (safe default).
      setFilterOn(true);
    }
  }, []);

  useEffect(() => {
    if (me) {
      refreshFilter();
    } else {
      setFilterOn(true);
    }
  }, [me, refreshFilter]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    async function load() {
      try {
        const user = await api.me();
        if (!cancelled) setMe(user);
      } catch {
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setLoading(false);
          setSplashDone(true);
        }
      }
    }
    load();
    // Safety timeout: ensure splashDone is set even if api.me() hangs
    timeoutId = setTimeout(() => {
      if (!cancelled && loadingRef.current) {
        setLoading(false);
        setSplashDone(true);
      }
    }, 10000);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* already out */
    }
    setMe(null);
    setFilterOn(true);
  }, []);

  return <Ctx.Provider value={{ me, loading, splashDone, refresh, signOut, filterOn, setFilterOn, refreshFilter }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);