"use client";
import type { ElementType, ReactNode } from "react";
import { useStore } from "@/lib/store";
import { roleLevels, type Role } from "@/lib/types";

interface Props {
  minRole?: Role;
  maxRole?: Role;
  onlyRole?: Role;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export default function RoleGate({ minRole, maxRole, onlyRole, as: Tag = "div", className, children }: Props) {
  const activeRole = useStore((s) => s.activeRole);
  const level = roleLevels[activeRole];
  if (onlyRole && onlyRole !== activeRole) return null;
  if (minRole && level < roleLevels[minRole]) return null;
  if (maxRole && level > roleLevels[maxRole]) return null;
  return <Tag className={className}>{children}</Tag>;
}
