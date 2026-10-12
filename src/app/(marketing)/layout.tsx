import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/components/Marketing";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main id="main" className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:pt-10" data-app-ready>
        {children}
      </main>
      <MarketingFooter />
    </>
  );
}
