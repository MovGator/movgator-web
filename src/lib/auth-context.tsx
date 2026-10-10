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
}
const Ctx = createContext<AuthCtx>({ me: null, loading: true, splashDone: false, refresh: async () => {}, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
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
  }, []);

  return <Ctx.Provider value={{ me, loading, splashDone, refresh, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);