"use client";
import { useEffect } from "react";
import { useCookieConsent } from "@/components/CookieConsent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    loadAnalytics?: () => void;
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean>; u?: string }) => void;
    umami?: (event: string, data?: Record<string, unknown>) => void;
  }
}

function getAnalyticsConfig() {
  return {
    plausible: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    umami: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    ga4: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
  };
}

export function Analytics() {
  const { consent } = useCookieConsent();
  const config = getAnalyticsConfig();

  useEffect(() => {
    if (!consent?.analytics) return;

    // Load Plausible
    if (config.plausible && typeof window !== "undefined") {
      const existing = document.querySelector('script[data-domain]');
      if (!existing) {
        const script = document.createElement("script");
        script.defer = true;
        script.dataset.domain = config.plausible;
        script.dataset.apiHost = "https://plausible.io";
        script.src = "https://plausible.io/js/script.js";
        document.head.appendChild(script);
      }
      // Initialize queue - use type assertion to bypass TS strictness for runtime-only code
      const win = window as Window & {
        plausible?: ((event: string, options?: { props?: Record<string, string | number | boolean>; u?: string }) => void) & { q: Array<[string, { props?: Record<string, string | number | boolean>; u?: string }]> };
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      win.plausible = win.plausible ?? ((function (event: string, options?: { props?: Record<string, string | number | boolean>; u?: string }) {
        const opts = options ?? { props: undefined, u: undefined };
        (win.plausible!.q = win.plausible!.q || []).push([event, opts]);
      }) as any);
    }

    // Load Umami
    if (config.umami && typeof window !== "undefined") {
      const existing = document.querySelector('script[data-website-id]');
      if (!existing) {
        const script = document.createElement("script");
        script.defer = true;
        script.src = "https://cloud.umami.is/script.js";
        script.dataset.websiteId = config.umami;
        document.head.appendChild(script);
      }
    }

    // Load GA4
    if (config.ga4 && typeof window !== "undefined") {
      const existing = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${config.ga4}"]`);
      if (!existing) {
        const script1 = document.createElement("script");
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4}`;
        document.head.appendChild(script1);
      }

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer!.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", config.ga4, { anonymize_ip: true });
    }

    window.loadAnalytics = () => {};
  }, [consent?.analytics, config.plausible, config.umami, config.ga4]);

  // Track page views for SPA navigation
  useEffect(() => {
    if (!consent?.analytics) return;

    const handleRouteChange = (url: string) => {
      if (window.plausible) {
        window.plausible("pageview", { u: url });
      }
      if (window.umami) {
        window.umami("pageview", { url });
      }
      if (window.gtag) {
        window.gtag("event", "page_view", { page_path: url });
      }
    };

    const originalPushState = history.pushState.bind(history);
    history.pushState = function (...args: [data: unknown, unused: string, url?: string | URL | null]) {
      originalPushState(...args);
      handleRouteChange(window.location.href);
    };
    const originalReplaceState = history.replaceState.bind(history);
    history.replaceState = function (...args: [data: unknown, unused: string, url?: string | URL | null]) {
      originalReplaceState(...args);
      handleRouteChange(window.location.href);
    };
    window.addEventListener("popstate", () => handleRouteChange(window.location.href));

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", () => handleRouteChange(window.location.href));
    };
  }, [consent?.analytics]);

  return null;
}

export function trackEvent(eventName: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;

  if (window.plausible) {
    window.plausible(eventName, { props });
  }
  if (window.umami) {
    window.umami(eventName, props);
  }
  if (window.gtag) {
    window.gtag("event", eventName, props);
  }
}