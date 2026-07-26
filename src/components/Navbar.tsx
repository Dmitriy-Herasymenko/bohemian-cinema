"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Головна", icon: "🏠" },
  { href: "/movies", label: "Фільми", icon: "🎬" },
  { href: "/upcoming", label: "Далі", icon: "📋" },
  { href: "/roulette", label: "Рулетка", icon: "🎲" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-16">
        <Link href="/" className="flex items-center gap-2 mr-8 group">
          <span className="text-2xl group-hover:animate-float">🍿</span>
          <span className="text-xl font-extrabold gradient-text tracking-tight">
            Bohemian Cinema
          </span>
        </Link>
        <div className="flex gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  transition-all duration-300 btn-press
                  ${
                    active
                      ? "bg-amber-400/10 text-amber-400 shadow-lg shadow-amber-400/10"
                      : "text-gray-500 hover:text-gray-200 hover:bg-surface-hover"
                  }
                `}
              >
                <span className="text-base">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
