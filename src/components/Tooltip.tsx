"use client";
import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const childRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    if (visible) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const child = React.Children.only(children);

  return (
    <div className="inline-block relative" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {React.cloneElement(child as React.ReactElement<any>, {
        ref: childRef,
        "data-ui-tooltip": "",
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
      })}
      {visible && childRef.current && (
        <div
          role="tooltip"
          className="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-[var(--mr-ink)] rounded shadow-lg pointer-events-none animate-fade-in"
          style={{
            top: position === "bottom"
              ? childRef.current.getBoundingClientRect().bottom + 8
              : undefined,
            bottom:
              position === "top"
                ? window.innerHeight - childRef.current.getBoundingClientRect().top + 8
                : undefined,
            left: childRef.current.getBoundingClientRect().left + childRef.current.offsetWidth / 2,
            transform: "translateX(-50%)",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}