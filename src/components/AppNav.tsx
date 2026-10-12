"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookmarkSimple,
  CaretDoubleLeft,
  CaretDoubleRight,
  Compass,
  DiceFive,
  House,
  MagnifyingGlass,
  User,
  UsersThree,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "./Avatar";
import { Logo, LogoIcon } from "./Logo";
import { Tooltip } from "./Tooltip";

interface NavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: PhosphorIcon;
}

const SECTIONS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Discover",
    items: [
      { href: "/home", label: "Home", icon: House },
      { href: "/discover", label: "Discover", icon: Compass },
      { href: "/dice", label: "Roll the Dice", shortLabel: "Dice", icon: DiceFive },
    ],
  },
  {
    heading: "Your space",
    items: [
      { href: "/movie-night", label: "Movie Night", shortLabel: "Nights", icon: UsersThree },
      { href: "/watchlist", label: "My Watchlist", shortLabel: "Watchlist", icon: BookmarkSimple },
    ],
  },
  {
    heading: "Account",
    items: [{ href: "/profile", label: "Profile & Settings", shortLabel: "Profile", icon: User }],
  },
];

const TAB_ORDER: NavItem[] = [
  { href: "/home", label: "Home", icon: House },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/movie-night", label: "Nights", icon: UsersThree },
  { href: "/profile", label: "Profile", icon: User },
];

function isActive(path: string, href: string) {
  return path === href || path.startsWith(href + "/");
}

function PIcon({ icon: Icon, active, size = 24 }: { icon: NavItem["icon"]; active: boolean; size?: number }) {
  return <Icon size={size} weight={active ? "fill" : "regular"} aria-hidden="true" />;
}

/* ---------------- Mobile bottom navigation (5 destinations) ---------------- */

export function AppTabBar() {
  const path = usePathname();
  const diceActive = isActive(path, "/dice");
  return (
    <nav aria-label="App" className="app-tabbar md:hidden">
      <div className="app-tabbar-row">
        <div className="app-tabbar-pill">
          {TAB_ORDER.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={isActive(path, t.href) ? "page" : undefined}
              aria-label={t.label}
              title={t.label}
              className={`app-tab${isActive(path, t.href) ? " app-tab-active" : ""}`}
            >
              <PIcon icon={t.icon} active={isActive(path, t.href)} />
              <span className="app-tab-dot" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <Link
          href="/dice"
          aria-current={diceActive ? "page" : undefined}
          aria-label="Roll the Dice"
          title="Roll the Dice"
          className={`app-dice-orb${diceActive ? " app-dice-orb-active" : ""}`}
        >
          <DiceFive size={28} weight={diceActive ? "fill" : "regular"} aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}

/* ------------- Desktop sidebar + tablet rail (collapsible) ------------- */

const SIDEBAR_KEY = "mr-sidebar-collapsed";

export function AppSidebar() {
  const path = usePathname();
  const { me, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      /* private mode: stay expanded */
    }
  }, []);
  // Close the account menu on Escape or outside click; return focus to the button.
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);
  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  };
  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
  };

  return (
    <nav
      aria-label="App"
      className="app-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className="app-sidebar-head">
        <Link href="/home" aria-label="MovGator home" className="app-sidebar-brand">
          <span className="app-sidebar-fullmark">
            <Logo height={26} />
          </span>
          <span className="app-sidebar-iconmark">
            <LogoIcon size={34} />
          </span>
        </Link>
        <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} position="right">
          <button
            type="button"
            id="sidebar-toggle"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="app-sidebar-toggle"
          >
            {collapsed ? (
              <CaretDoubleRight size={20} weight="regular" aria-hidden="true" />
            ) : (
              <CaretDoubleLeft size={20} weight="regular" aria-hidden="true" />
            )}
          </button>
        </Tooltip>
      </div>

      {SECTIONS.map((s) => (
        <div key={s.heading} className="app-sidebar-section">
          <p className="app-sidebar-heading" aria-hidden="true">
            {s.heading}
          </p>
          <ul>
            {s.items.map((t) => {
              const active = isActive(path, t.href);
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    aria-current={active ? "page" : undefined}
                    aria-label={t.label}
                    title={t.label}
                    className={`app-side-item${active ? " app-tab-active" : ""}`}
                  >
                    <PIcon icon={t.icon} active={active} size={23} />
                    <span className="app-side-label">{t.label}</span>
                    {active && <span className="app-side-bar" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="app-sidebar-me">
        <div className="app-user-anchor" ref={menuRef}>
          {me ? (
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={`Profile menu for ${me.display_name}`}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              title={me.display_name}
              className="app-sidebar-user"
            >
              <Avatar name={me.display_name} url={me.avatar_url} size={32} />
              <span className="app-side-label">{me.display_name}</span>
            </button>
          ) : (
            <Link href="/profile" aria-label="Sign in" title="Sign in" className="app-side-item">
              <PIcon icon={User} active={isActive(path, "/profile")} size={23} />
              <span className="app-side-label">Sign in</span>
            </Link>
          )}
          {me && menuOpen && (
            <div className="app-user-menu" role="menu" aria-label="Account menu">
              <p className="app-user-menu-name" aria-hidden="true">{me.display_name}</p>
              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="app-user-menu-item"
              >
                <User size={18} weight="regular" aria-hidden="true" />
                <span>Help &amp; Settings</span>
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="app-user-menu-item app-user-menu-danger"
              >
                <User size={18} weight="regular" aria-hidden="true" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ---------------- Desktop top search bar ---------------- */

export function AppTopbar() {
  const router = useRouter();
  const path = usePathname();
  const [q, setQ] = useState("");
  // Discover and Watchlist render their own search bars — a second global
  // one here would duplicate them, so the topbar stays hidden on those routes.
  if (path === "/discover" || path === "/watchlist") return null;
  return (
    <div className="app-topbar" role="search">
      <MagnifyingGlass size={18} weight="regular" aria-hidden="true" className="app-topbar-icon" />
      <label htmlFor="app-search" className="sr-only">
        Search movies and anime
      </label>
      <input
        id="app-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim()) router.push(`/discover?q=${encodeURIComponent(q.trim())}`);
        }}
        placeholder="Search movies and anime… (Enter)"
        autoComplete="off"
        className="app-topbar-input"
      />
    </div>
  );
}

