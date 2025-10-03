import clsx from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function Button({ className, children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-700",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
