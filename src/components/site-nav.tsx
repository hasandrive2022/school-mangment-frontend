"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { label: string; href: string };

export function SiteNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuItems = items.filter((i) => i.href !== "/" && i.href !== "/student");
  const all: NavItem[] = [
    { label: "হোম", href: "/" },
    ...menuItems,
    { label: "শিক্ষার্থী লগইন", href: "/student" },
  ];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <nav className="navbar" aria-label="প্রধান মেনু">
      <div className="container">
        <ul className="nav-list">
          {all.map((item) => (
            <li key={item.href + item.label} className={isActive(item.href) ? "active" : undefined}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <button
          className="hamburger"
          aria-label="মেনু খুলুন"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg className="icon" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      <div className={open ? "drawer open" : "drawer"}>
        <ul>
          {all.map((item) => (
            <li key={item.href + item.label} className={isActive(item.href) ? "active" : undefined}>
              <Link href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
