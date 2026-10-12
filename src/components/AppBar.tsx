"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { LogoIcon } from "./Logo";
import { Tooltip } from "./Tooltip";

/** Mobile-only app bar (see .appbar CSS: hidden on tablet/desktop).
 *  Tab roots show brand + title (+ one real contextual action at most);
 *  pushed screens (details, room, flows, lists) show back + title. */
export function AppBar({
  title,
  backFallback = "/home",
  showBack = true,
  brand = false,
  actions,
}: {
  title: string;
  backFallback?: string;
  showBack?: boolean;
  brand?: boolean;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="appbar">
      {showBack ? (
        <Tooltip content="Go back" position="right">
          <button
            type="button"
            id="appbar-back"
            aria-label="Go back"
            onClick={() => {
              if (window.history.length > 1) router.back();
              else router.push(backFallback);
            }}
            className="appbar-btn"
          >
            <ArrowLeft size={22} weight="regular" aria-hidden="true" />
          </button>
        </Tooltip>
      ) : (
        <span className="appbar-brand" aria-hidden="true">
          {brand ? <LogoIcon size={30} /> : null}
        </span>
      )}
      <p className="appbar-title">{title}</p>
      {actions}
    </div>
  );
}
