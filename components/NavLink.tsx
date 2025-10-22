"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`btn-ghost ${isActive ? 'border-l-2 border-[var(--accent)] bg-[var(--hover)] font-medium' : ''}`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
