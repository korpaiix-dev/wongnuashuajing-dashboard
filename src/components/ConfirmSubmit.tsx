"use client";
import { useState } from "react";

export default function ConfirmSubmit({
  children,
  message,
  className,
  formAction,
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="submit"
      formAction={formAction}
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
          return;
        }
        setPending(true);
      }}
    >
      {children}
    </button>
  );
}
