import type { Metadata } from "next";
import { AppTabBar, AppSidebar, AppTopbar } from "@/components/AppNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { EmailVerificationGuard } from "@/components/EmailVerificationGuard";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "MovGator" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  other: { "mobile-web-app-capable": "yes" },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <ServiceWorkerRegister />
      <AppSidebar />
      <div className="app-content">
        <AppTopbar />
        <main id="main" className="app-main">
          <EmailVerificationGuard>{children}</EmailVerificationGuard>
        </main>
      </div>
      <AppTabBar />
    </div>
  );
}
