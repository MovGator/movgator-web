"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
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
    async function load() {
      try {
        const user = await api.me();
        if (!cancelled) setMe(user);
      } catch {
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSplashDone(true);
        }
      }
    }
    load();
    return () => { cancelled = true; };
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