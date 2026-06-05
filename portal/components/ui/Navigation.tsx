"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/estimator", label: "Estimator" },
  { href: "/history", label: "History" },
  { href: "/compare", label: "Compare" },
  { href: "/market", label: "Market Analysis" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold text-sm">
            H
          </div>
          <span className="text-lg font-semibold text-slate-900">
            HSBC Property Platform
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <ul className="flex gap-1">
            {links.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
