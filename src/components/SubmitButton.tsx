"use client";
import { useFormStatus } from "react-dom";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: string;
  children: React.ReactNode;
}

export default function SubmitButton({ pendingText, children, className = "btn btn-primary", ...rest }: Props) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} type="submit" disabled={pending || rest.disabled} className={className} aria-busy={pending}>
      {pending ? (pendingText ?? "กำลังบันทึก…") : children}
    </button>
  );
}
