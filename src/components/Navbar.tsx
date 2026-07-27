"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { PushEnableButton } from "@/components/PushManager";

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-float">🍿</span>
            <span className="text-xl font-extrabold gradient-text tracking-tight">Bohemian Cinema</span>
          </Link>
          <div className="flex gap-1 ml-4">
            {[
              { href: "/parties", label: "П'янки", icon: "🍻" },
              ...(user ? [
                { href: "/future-movies", label: "Майбутні", icon: "🔮" },
                { href: "/movies", label: "Архів", icon: "🎬" },
                { href: "/chat", label: "Чат", icon: "💬" },
              ] : []),
            ].map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 btn-press ${
                    active ? "bg-amber-400/10 text-amber-400 shadow-lg shadow-amber-400/10" : "text-gray-500 hover:text-gray-200 hover:bg-surface-hover"
                  }`}>
                  <span className="text-base">{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <PushEnableButton />
                <Link href={`/profile/${user.userId}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-hover transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-sm font-bold">
                      {user.name[0]}
                    </div>
                  )}
                  <span className="text-sm text-gray-300 hidden sm:inline">{user.name}</span>
                </Link>
                <button onClick={logout}
                  className="text-gray-600 hover:text-gray-400 text-sm transition-colors btn-press">
                  Вийти
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-surface-hover transition-all">
                  Увійти
                </Link>
                <Link href="/register"
                  className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-4 py-2 rounded-xl text-sm font-bold hover:from-amber-400 hover:to-amber-300 transition-all btn-press">
                  Реєстрація
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
