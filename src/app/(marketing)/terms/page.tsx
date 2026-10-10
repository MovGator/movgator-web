export const metadata = { title: "Terms" };
export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold">Terms — initial version</h1>
      <p className="mt-4 text-sm" style={{ color: "var(--mr-ink-soft)" }}>Last updated: October 2026. Review with qualified counsel before public launch.</p>
      <div className="mt-6 flex flex-col gap-3 text-sm leading-relaxed">
        <p><strong>The service.</strong> MovGator offers movie/anime discovery, randomised Dice picks, and shared Movie Night voting. Browsing is public; saving, rating and hosting require an account.</p>
        <p><strong>Acceptable use.</strong> Don&rsquo;t abuse rate limits, scrape the service, probe other users&rsquo; private data, or share invite links beyond your intended group.</p>
        <p><strong>Content.</strong> Metadata and artwork belong to their providers (TMDB when configured — this product is not endorsed by TMDB). Demo catalogue entries are MovGator originals. We don&rsquo;t host copyrighted films.</p>
        <p><strong>Accounts.</strong> You&rsquo;re responsible for activity under your account. We may rate-limit or suspend accounts for abuse, and you may delete your account at any time from Profile.</p>
        <p><strong>Availability.</strong> Provided as-is during development; uptime, free-tier limits and sleeping behaviour of hosting providers apply (see deployment docs).</p>
      </div>
    </article>
  );
}
