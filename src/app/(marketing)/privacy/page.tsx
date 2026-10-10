export const metadata = { title: "Privacy" };
export default function PrivacyPage() {
  return (
    <article className="prose mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold">Privacy — initial version</h1>
      <p className="mt-4 text-sm" style={{ color: "var(--mr-ink-soft)" }}>Last updated: October 2026. Review with qualified counsel before public launch, including Ghana Data Protection Act requirements.</p>
      <section className="mt-6 flex flex-col gap-3 text-sm leading-relaxed">
        <p><strong>What we collect.</strong> Account data you provide (email, display name, avatar seed); your watchlist, ratings, watched history and swipe signals; Movie Night sessions you create or join. Browsing the public feed, search and title pages requires no account and we store no profile against it.</p>
        <p><strong>What we don&rsquo;t.</strong> No payment data in this release. No sale of personal data. No third-party trackers in the app shell.</p>
        <p><strong>Third parties.</strong> Movie metadata and artwork come from TMDB when configured (see TMDB&rsquo;s privacy policy for their API). Avatars render via api.navii.dev from your user ID seed — no email is sent as a seed. Google OAuth, when enabled, is governed by Google&rsquo;s policies.</p>
        <p><strong>Retention.</strong> Account data is kept until you delete your account (Profile → Delete account), which removes your profile, lists, ratings and votes. Logs retain request IDs up to 30 days. Invite tokens expire after 7 days.</p>
        <p><strong>Your rights.</strong> Access, correct or delete your data from your Profile page, or contact us via the Help page.</p>
        <p><strong>Cookies.</strong> Signed-in sessions use HttpOnly SameSite cookies (mr_session, mr_refresh) plus a CSRF cookie. No advertising cookies.</p>
      </section>
    </article>
  );
}
