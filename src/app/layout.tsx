import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import { ToastProvider } from "@/components/Toast";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: { default: "MovGator — Find what to watch tonight", template: "%s · MovGator" },
  description:
    "MovGator helps you discover films and anime, roll the dice when you can't choose, and decide together with Movie Night.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    siteName: "MovGator",
    title: "MovGator — Find what to watch tonight",
    description: "Discover films and anime. Roll the dice. Host a Movie Night.",
    images: ["/brand/movgator-logo-primary.svg"],
  },
  twitter: { card: "summary", title: "MovGator", description: "Find what to watch tonight." },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F6F8" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0714" },
  ],
  viewportFit: "cover",
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
