"use client";
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Production only: a service worker in `next dev` serves stale cached
    // shells and makes HMR look broken/slow. PWA behavior is unchanged in
    // production builds (`npm run build && npm start`).
    if (process.env.NODE_ENV !== "production") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support unavailable — app still works online */
      });
    }
  }, []);
  return null;
}
