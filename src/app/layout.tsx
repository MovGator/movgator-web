import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { ToastProvider } from "@/components/Toast";
import { CookieConsentBanner } from "@/components/CookieConsent";
import { Analytics } from "@/components/Analytics";
import { SplashScreenWrapper } from "@/components/SplashScreenWrapper";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "MovGator — Find what to watch tonight",
    template: "%s · MovGator",
  },
  description:
    "MovGator helps you discover films and anime, roll the dice when you can't choose, and decide together with Movie Night. Free to browse, no sign-up required.",
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
    types: {
      "application/manifest+json": "/manifest.webmanifest",
    },
  },
  openGraph: {
    type: "website",
    siteName: "MovGator",
    title: "MovGator — Find what to watch tonight",
    description:
      "Discover films and anime. Roll the dice. Host a Movie Night. Free to browse.",
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/brand/og-image.svg",
        width: 1200,
        height: 630,
        alt: "MovGator - Movie & Anime Discovery",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@movgator",
    creator: "@movgator",
    title: "MovGator — Find what to watch tonight",
    description:
      "Discover films and anime. Roll the dice. Host a Movie Night.",
    images: ["/brand/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/brand/movgator-icon-logo-light.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", type: "image/png" },
    ],
    shortcut: "/brand/movgator-icon-logo-light.svg",
  },
  manifest: "/manifest.webmanifest",
  verification: {
    other: {
      "google-site-verification": "your-verification-code",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F6F8" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0714" },
  ],
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/brand/movgator-icon-logo-light.svg" type="image/svg+xml" />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
            <SplashScreenWrapper />
          </AuthProvider>
        </ThemeProvider>
        <CookieConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
