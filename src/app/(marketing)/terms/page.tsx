import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description:
    "MovGator Terms of Service: Rules and conditions governing your use of our movie and anime discovery service, including Dice rolls and Movie Night voting.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="mr-chip inline-block px-3 py-1 text-xs font-semibold" style={{ background: "var(--mr-surface-2)" }}>
          Legal
        </p>
        <h1 className="font-display mt-3 text-4xl font-extrabold md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--mr-ink-soft)" }}>
          Last updated: October 2026. This is an initial version — review with qualified counsel before public launch.
        </p>
      </header>

      <nav className="mr-card p-4 mb-8" aria-label="Table of contents">
        <h2 className="font-display font-bold mb-3">Contents</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          <li><Link href="#acceptance" className="text-sm underline">1. Acceptance</Link></li>
          <li><Link href="#the-service" className="text-sm underline">2. The Service</Link></li>
          <li><Link href="#accounts" className="text-sm underline">3. Accounts & Registration</Link></li>
          <li><Link href="#acceptable-use" className="text-sm underline">4. Acceptable Use</Link></li>
          <li><Link href="#content" className="text-sm underline">5. Content & Intellectual Property</Link></li>
          <li><Link href="#movie-nights" className="text-sm underline">6. Movie Night Sessions</Link></li>
          <li><Link href="#disclaimers" className="text-sm underline">7. Disclaimers & Limitations</Link></li>
          <li><Link href="#termination" className="text-sm underline">8. Termination</Link></li>
          <li><Link href="#governing-law" className="text-sm underline">9. Governing Law</Link></li>
          <li><Link href="#changes" className="text-sm underline">10. Changes</Link></li>
          <li><Link href="#age-restrictions" className="text-sm underline">11. Age Restrictions & Mature Content</Link></li>
          <li><Link href="#contact" className="text-sm underline">12. Contact</Link></li>
        </ul>
      </nav>

      <section id="acceptance" className="mt-8">
        <h2 className="font-display text-2xl font-bold">1. Acceptance of Terms</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          By creating an account or using MovGator (the "Service"), you agree to these Terms. If you do not agree, do not use the Service.
          These Terms form a binding legal agreement between you and the MovGator operators.
        </p>
      </section>

      <section id="the-service" className="mt-8">
        <h2 className="font-display text-2xl font-bold">2. The Service</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          MovGator provides movie and anime discovery, randomised "Roll the Dice" picks, and shared "Movie Night" voting.
          Browsing the public catalogue, search, and title pages is free and requires no account.
          Saving titles to a watchlist, rating, onboarding preferences, and hosting Movie Nights require a registered account.
        </p>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          We do not host, stream, or distribute copyrighted films or episodes. All metadata and artwork are sourced from TMDB
          (attributed; this product is not endorsed or certified by TMDB) or from our clearly labelled demo catalogue.
        </p>
      </section>

      <section id="accounts" className="mt-8">
        <h2 className="font-display text-2xl font-bold">3. Accounts & Registration</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li><strong>Eligibility:</strong> You must be at least 13 years old (or the minimum age in your jurisdiction) to create an account. Viewing adult or sexually explicit titles additionally requires completing age verification confirming you are at least 18 (see section 12).</li>
          <li><strong>Accuracy:</strong> Provide accurate, current information. Keep your email and password secure.</li>
          <li><strong>Security:</strong> You are responsible for all activity under your account. Notify us immediately of any unauthorized use via the Contact page.</li>
          <li><strong>Passwords:</strong> Must be at least 8 characters with letters and numbers. We hash passwords with Argon2id and never store them in plaintext.</li>
          <li><strong>Google OAuth:</strong> When enabled, you may sign in with Google. Your Google account's security settings apply.</li>
          <li><strong>Deletion:</strong> You may delete your account at any time from Profile → Delete account. This permanently removes all your data.</li>
        </ul>
      </section>

      <section id="acceptable-use" className="mt-8">
        <h2 className="font-display text-2xl font-bold">4. Acceptable Use</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          You agree not to:
        </p>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li>Abuse rate limits, scrape, or crawl the Service beyond normal interactive use.</li>
          <li>Attempt to access other users' private data, invite tokens, or session cookies.</li>
          <li>Circumvent content filtering or age verification (e.g., sharing adult titles to evade filters, misrepresenting your age).</li>
          <li>Share Movie Night invite links beyond your intended group or post them publicly.</li>
          <li>Use automated scripts, bots, or the API for competitive analysis, data harvesting, or spam.</li>
          <li>Impersonate another user or entity, or misrepresent your affiliation.</li>
          <li>Interfere with the Service's security, integrity, or performance (e.g., DoS, vulnerability probing).</li>
          <li>Use the Service for any illegal purpose or in violation of applicable laws.</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          We may rate-limit, suspend, or terminate accounts that violate these terms. Suspensions are not appealable for clear abuse.
        </p>
      </section>

      <section id="content" className="mt-8">
        <h2 className="font-display text-2xl font-bold">5. Content & Intellectual Property</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li><strong>TMDB data:</strong> Movie/TV metadata, posters, backdrops, and ratings belong to their respective owners and TMDB. Used under TMDB's API terms. This product is not endorsed or certified by TMDB.</li>
          <li><strong>Demo catalogue:</strong> Original placeholder entries created by MovGator are our IP.</li>
          <li><strong>Your content:</strong> You retain ownership of your watchlist, ratings, and Movie Night data. By using the Service, you grant us a worldwide, non-exclusive license to store, process, and display that data solely to provide the Service.</li>
          <li><strong>No user-generated public content:</strong> There are no public comments, reviews, or forums. Movie Night votes are private to the session.</li>
          <li><strong>DMCA:</strong> We do not host copyrighted media. If you believe metadata artwork infringes, contact TMDB directly.</li>
        </ul>
      </section>

      <section id="movie-nights" className="mt-8">
        <h2 className="font-display text-2xl font-bold">6. Movie Night Sessions</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li><strong>Host responsibilities:</strong> The host creates the night, sets preferences, and manages candidates. Only the host can end the night.</li>
          <li><strong>Voting:</strong> One active vote per member at a time. Votes are tallied server-side; ties go to tiebreak. Results are final.</li>
          <li><strong>Invites:</strong> Invite tokens are single-use, expire after 7 days, and are hashed (SHA-256) at rest. Do not share publicly.</li>
          <li><strong>Blind voting:</strong> When enabled, candidates are hidden until the host reveals results. This setting cannot be changed mid-session.</li>
          <li><strong>No guarantees:</strong> Movie Night is a social coordination tool. We do not guarantee streaming availability, regional licensing, or that the winner will be watchable.</li>
        </ul>
      </section>

      <section id="disclaimers" className="mt-8">
        <h2 className="font-display text-2xl font-bold">7. Disclaimers & Limitations of Liability</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li><strong>As-is:</strong> The Service is provided "as is" and "as available" without warranties of any kind (merchantability, fitness, non-infringement, uninterrupted or error-free).</li>
          <li><strong>Third-party data:</strong> We are not responsible for accuracy, completeness, or availability of TMDB metadata, Navii avatars, or Google OAuth.</li>
          <li><strong>Hosting limits:</strong> Free-tier hosting (Render, Vercel) may sleep when idle, causing cold starts or WebSocket disconnects. Uptime is not guaranteed.</li>
          <li><strong>No streaming:</strong> We do not stream, link to, or guarantee access to any film. You are responsible for verifying legal availability in your region.</li>
          <li><strong>Liability cap:</strong> To the maximum extent permitted by law, our aggregate liability shall not exceed the amount you paid for the Service (zero).</li>
          <li><strong>Indemnification:</strong> You agree to indemnify us from claims arising from your misuse of the Service or violation of these Terms.</li>
        </ul>
      </section>

      <section id="termination" className="mt-8">
        <h2 className="font-display text-2xl font-bold">8. Termination</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          You may stop using the Service and delete your account at any time. We may suspend or terminate your access immediately,
          without notice, for material breach of these Terms or to protect the Service's security. Upon termination, your data is deleted per our retention policy.
        </p>
      </section>

      <section id="governing-law" className="mt-8">
        <h2 className="font-display text-2xl font-bold">9. Governing Law</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          These Terms are governed by the laws of Ghana (where the project originates), without regard to conflict-of-law principles.
          Disputes shall be resolved in the courts of Accra, Ghana, unless otherwise required by mandatory consumer protection laws in your jurisdiction.
        </p>
      </section>

      <section id="changes" className="mt-8">
        <h2 className="font-display text-2xl font-bold">10. Changes to Terms</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          We may modify these Terms at any time. Material changes will be announced in-app and emailed to the address on your account (if provided).
          Continued use after the effective date constitutes acceptance. If you disagree, your sole remedy is to delete your account.
        </p>
      </section>

      <section id="age-restrictions" className="mt-8">
        <h2 className="font-display text-2xl font-bold">11. Age Restrictions & Mature Content</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          <li><strong>Filtered by default:</strong> Titles classified as adult or sexually explicit are hidden by default for all users — signed out or signed in — across feeds, search, recommendations, Dice picks, title pages, and related titles. Direct links to such titles do not resolve while filtered.</li>
          <li><strong>18+ gate:</strong> You may only disable the adult-content filter (Profile → Settings → Content Filters) after completing age verification confirming you are at least 18 years old. Attempting to bypass verification violates these Terms and may lead to suspension.</li>
          <li><strong>Verification data:</strong> We store only the verification outcome (verified flag, timestamp, method). Dates of birth and any identity documents are never retained. See the Privacy Policy for details.</li>
          <li><strong>Accuracy limits:</strong> Classifications come from our metadata provider (TMDB) and may be incomplete. The filter is a safety aid, not a guarantee; parents and guardians should still supervise minors' use.</li>
          <li><strong>Your responsibility:</strong> Do not share adult titles with, or disable the filter on behalf of, anyone under 18 or anyone who has not personally completed verification.</li>
        </ul>
      </section>

      <section id="contact" className="mt-8">
        <h2 className="font-display text-2xl font-bold">12. Contact</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mr-ink-soft)" }}>
          Questions about these Terms? <Link href="/contact" className="underline font-medium">Visit our Contact page</Link> or email the address associated with your account.
        </p>
      </section>
    </article>
  );
}