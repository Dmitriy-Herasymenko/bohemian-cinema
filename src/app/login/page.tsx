"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
      <div className="glass-card rounded-3xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-8 gradient-text">Увійти</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm animate-fade-in">
              {error}
            </div>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors" required />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors" required />
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 py-3 rounded-xl font-bold text-lg hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 transition-all duration-300 btn-press shadow-lg shadow-amber-400/20">
            {loading ? "Входжу..." : "Увійти"}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6">
          Немає акаунту?{" "}
          <Link href="/register" className="text-amber-400 hover:text-amber-300 transition-colors">
            Зареєструватись
          </Link>
        </p>
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-gray-600 text-xs text-center">Тестові акаунти (пароль: password123):</p>
          <p className="text-gray-500 text-xs text-center mt-1">dmytro@test.com, andrii@test.com, oleksii@test.com, maksym@test.com</p>
        </div>
      </div>
    </div>
  );
}
