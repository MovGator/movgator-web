import type { InputHTMLAttributes } from "react";

export function Input(
  props: InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string },
) {
  const { label, id, className = "", ...rest } = props;
  const fieldId = id ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={fieldId}
        {...rest}
        className="mr-card min-h-[44px] w-full px-3 py-2 text-base"
      />
    </div>
  );
}
