import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "MovGator Privacy Policy: How we collect, use, and protect your data when you discover films and anime, roll the dice, or host Movie Nights.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
          Legal
        </p>
        <h1 className="font-display mt-3 text-4xl font-extrabold md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          Last updated: October 2026. This policy is an initial version — review with qualified counsel before public launch, including Ghana Data Protection Act requirements.
        </p>
      </header>

      <nav className="mr-card p-4 mb-8" aria-label="Table of contents">
        <h2 className="font-display font-bold mb-3">Contents</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          <li><Link href="#data-we-collect" className="text-sm underline">1. Data We Collect</Link></li>
          <li><Link href="#data-we-dont-collect" className="text-sm underline">2. Data We Don't Collect</Link></li>
          <li><Link href="#how-we-use-data" className="text-sm underline">3. How We Use Your Data</Link></li>
          <li><Link href="#third-parties" className="text-sm underline">4. Third Parties</Link></li>
          <li><Link href="#data-retention" className="text-sm underline">5. Data Retention & Deletion</Link></li>
          <li><Link href="#your-rights" className="text-sm underline">6. Your Rights</Link></li>
          <li><Link href="#cookies" className="text-sm underline">7. Cookies & Local Storage</Link></li>
          <li><Link href="#security" className="text-sm underline">8. Security</Link></li>
          <li><Link href="#children" className="text-sm underline">9. Children's Privacy</Link></li>
          <li><Link href="#content-safety" className="text-sm underline">10. Content Safety & Age Verification</Link></li>
          <li><Link href="#changes" className="text-sm underline">11. Changes to This Policy</Link></li>
          <li><Link href="#contact" className="text-sm underline">12. Contact Us</Link></li>
        </ul>
      </nav>

      <section id="data-we-collect" className="mt-8">
        <h2 className="font-display text-2xl font-bold">1. Data We Collect</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          We collect only what you directly provide or what is necessary for the service to function:
        </p>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li><strong>Account data:</strong> Email address, display name, and an avatar seed (derived from your user ID — never your email) when you create an account.</li>
          <li><strong>Profile customization:</strong> Theme preference (light/dark/system) and onboarding genre selections.</li>
          <li><strong>Activity data:</strong> Your watchlist, ratings (1–5 stars + liked flag), watched history, and swipe signals (like/pass) used for Dice recommendations.</li>
          <li><strong>Movie Night data:</strong> Nights you create or join, votes you cast, and candidates you add. Invite tokens are hashed and expire after 7 days.</li>
          <li><strong>Technical logs:</strong> Request IDs, timestamps, and error details (retained up to 30 days for debugging). No IP-based profiling.</li>
          <li><strong>Safety preferences:</strong> Your adult-content filter setting (on by default) and, if you complete it, your age-verification outcome (verified flag, timestamp, method).</li>
        </ul>
        <p className="mt-3 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          <strong>Public browsing</strong> (feed, search, title pages, Dice preview) requires no account and we store no profile against it.
        </p>
      </section>

      <section id="data-we-dont-collect" className="mt-8">
        <h2 className="font-display text-2xl font-bold">2. Data We Don't Collect</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li>No payment or billing information (the service is free).</li>
          <li>No dates of birth, ID documents, or biometric data — age verification keeps only the pass/fail outcome.</li>
          <li>No precise geolocation, contacts, camera, microphone, or device sensors.</li>
          <li>No sale or rental of personal data to third parties.</li>
          <li>No third-party advertising trackers, pixels, or fingerprinting scripts in the app shell.</li>
          <li>No cross-site tracking identifiers.</li>
        </ul>
      </section>

      <section id="how-we-use-data" className="mt-8">
        <h2 className="font-display text-2xl font-bold">3. How We Use Your Data</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li>Provide core functionality: watchlist, ratings, Dice recommendations, Movie Night voting.</li>
          <li>Authenticate you securely (HttpOnly SameSite cookies, CSRF protection, Argon2id password hashing).</li>
          <li>Send essential service communications (account verification, password reset — only if you request them).</li>
          <li>Improve the service with privacy-friendly, aggregated analytics (only with your consent via cookie banner).</li>
          <li>Enforce rate limits and prevent abuse.</li>
        </ul>
      </section>

      <section id="third-parties" className="mt-8">
        <h2 className="font-display text-2xl font-bold">4. Third Parties</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li><strong>TMDB (The Movie Database):</strong> Movie/TV metadata, artwork, and ratings. See <a href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">TMDB's Privacy Policy</a>. This product uses the TMDB API but is not endorsed or certified by TMDB.</li>
          <li><strong>Navii Avatars:</strong> Generates placeholder avatars from a hash of your user ID. No email or personal data is sent. See <a href="https://github.com/navii" target="_blank" rel="noopener noreferrer" className="underline">Navii project</a>.</li>
          <li><strong>Google OAuth:</strong> When enabled, authentication is governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Google's Privacy Policy</a>. We receive only your email, verified status, name, and profile picture.</li>
          <li><strong>Hosting providers:</strong> Render (backend) and Vercel (frontend) process traffic logs per their policies.</li>
        </ul>
      </section>

      <section id="data-retention" className="mt-8">
        <h2 className="font-display text-2xl font-bold">5. Data Retention & Deletion</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li><strong>Account data:</strong> Retained until you delete your account (Profile → Delete account), which permanently removes your profile, watchlist, ratings, watched history, swipe signals, and Movie Night votes.</li>
          <li><strong>Movie Night sessions:</strong> Invite tokens are hashed (SHA-256) and expire after 7 days. Night data is retained until the host deletes it or all members leave.</li>
          <li><strong>Logs:</strong> Request IDs and error details retained up to 30 days for debugging and security.</li>
          <li><strong>Safety records:</strong> Your filter preference and age-verification outcome are kept until you change the setting or delete your account (which removes them with everything else). Failed verification attempts are rate-limited and never stored as personal data.</li>
          <li><strong>Backups:</strong> Database backups (if configured) follow the same retention; deleted data is removed on the next backup cycle.</li>
        </ul>
      </section>

      <section id="your-rights" className="mt-8">
        <h2 className="font-display text-2xl font-bold">6. Your Rights</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          Depending on your jurisdiction, you may have the right to:
        </p>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li>Access the personal data we hold about you.</li>
          <li>Rectify inaccurate or incomplete data.</li>
          <li>Erase your data (via Profile → Delete account).</li>
          <li>Restrict or object to processing.</li>
          <li>Data portability (export your watchlist, ratings, etc. — self-serve from Profile).</li>
          <li>Withdraw consent for optional analytics at any time (via cookie banner or Privacy page).</li>
        </ul>
        <p className="mt-3 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          To exercise these rights, use the self-serve tools in your Profile or <Link href="/contact" className="underline">contact us</Link>.
        </p>
      </section>

      <section id="cookies" className="mt-8">
        <h2 className="font-display text-2xl font-bold">7. Cookies & Local Storage</h2>
        <table className="mt-3 w-full text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--mr-line)" }}>
              <th className="pb-2 font-bold">Name</th>
              <th className="pb-2 font-bold">Purpose</th>
              <th className="pb-2 font-bold">Duration</th>
              <th className="pb-2 font-bold">Type</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--mr-line)" }}>
              <td className="py-2 font-mono">mr_session</td>
              <td>Signed-in session (JWT access token)</td>
              <td>30 minutes</td>
              <td>HttpOnly, SameSite=Lax, Secure (prod)</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--mr-line)" }}>
              <td className="py-2 font-mono">mr_refresh</td>
              <td>Session refresh (rotating JWT)</td>
              <td>30 days</td>
              <td>HttpOnly, SameSite=Lax, Secure (prod)</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--mr-line)" }}>
              <td className="py-2 font-mono">mr_csrf</td>
              <td>CSRF protection (double-submit)</td>
              <td>30 days</td>
              <td>SameSite=Lax, Secure (prod)</td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--mr-line)" }}>
              <td className="py-2 font-mono">movgator-cookie-consent</td>
              <td>Stores your cookie preferences</td>
              <td>1 year</td>
              <td>LocalStorage (client-side only)</td>
            </tr>
            <tr>
              <td className="py-2 font-mono">theme</td>
              <td>Remembers your theme preference</td>
              <td>1 year</td>
              <td>LocalStorage (client-side only)</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          No advertising or tracking cookies. Optional analytics cookies load only after explicit consent via the cookie banner.
        </p>
      </section>

      <section id="security" className="mt-8">
        <h2 className="font-display text-2xl font-bold">8. Security</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li>Passwords hashed with Argon2id (memory-hard, salted).</li>
          <li>JWT sessions: short-lived access tokens (30 min), rotating refresh tokens (single-use, 30 days), server-side revocation.</li>
          <li>CSRF protection via double-submit cookie pattern.</li>
          <li>CSP, HSTS, X-Frame-Options, Referrer-Policy, and Permissions-Policy headers enforced in production.</li>
          <li>All API traffic over HTTPS; cookies marked Secure in production.</li>
          <li>Rate limiting on auth endpoints; brute-force protection.</li>
        </ul>
      </section>

      <section id="children" className="mt-8">
        <h2 className="font-display text-2xl font-bold">9. Children's Privacy</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          MovGator is not directed to children under 13 (or the applicable age in your jurisdiction). We do not knowingly collect personal data from children. If you believe a child has provided data, <Link href="/contact" className="underline">contact us</Link> and we will delete it.
          Adult or sexually explicit titles are additionally hidden for everyone by default and require a completed 18+ age verification to view (see section 10).
        </p>
      </section>

      <section id="content-safety" className="mt-8">
        <h2 className="font-display text-2xl font-bold">10. Content Safety & Age Verification</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li><strong>Filter by default:</strong> Adult or sexually explicit titles (flagged via TMDB's adult classification) are hidden by default for everyone — including signed-out visitors — across feeds, search, recommendations, Dice picks, title pages, and related titles.</li>
          <li><strong>18+ gate:</strong> Turning the adult-content filter off (Profile → Settings → Content Filters) requires completing age verification confirming you are at least 18 years old. Unverified users cannot disable the filter; the server enforces this even if the app UI is bypassed.</li>
          <li><strong>What we store:</strong> Only the verification <em>outcome</em> (verified flag, timestamp, method). Your date of birth is checked once in memory and never stored, logged, or transmitted anywhere else. No ID documents are collected by the built-in flow.</li>
          <li><strong>Third-party verifiers:</strong> If a dedicated identity provider is ever enabled (configured via <span className="font-mono">AGE_VERIFICATION_PROVIDER</span>), its own privacy terms apply to that step; we still keep only the outcome. We will update this section before enabling one.</li>
          <li><strong>No circumvention:</strong> Adult titles are excluded server-side from catalogue responses and direct title links return "not found" for filtered users, so they cannot be reached via shared URLs, cached pages, or API calls.</li>
        </ul>
      </section>

      <section id="changes" className="mt-8">
        <h2 className="font-display text-2xl font-bold">11. Changes to This Policy</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          We may update this policy as the service evolves. Material changes will be announced in-app and via the email on your account (if provided). Continued use after changes constitutes acceptance.
        </p>
      </section>

      <section id="contact" className="mt-8">
        <h2 className="font-display text-2xl font-bold">12. Contact Us</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          Questions about this policy or your data? <Link href="/contact" className="underline font-medium">Visit our Contact page</Link> or email the address associated with your account.
        </p>
      </section>
    </article>
  );
}