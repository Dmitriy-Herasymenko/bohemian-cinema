"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(name, email, password);
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
        <h1 className="text-3xl font-black text-center mb-8 gradient-text">Реєстрація</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm animate-fade-in">
              {error}
            </div>
          )}
          <input type="text" placeholder="Ім'я" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors" required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors" required />
          <input type="password" placeholder="Пароль (мінімум 6 символів)" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors" required minLength={6} />
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 py-3 rounded-xl font-bold text-lg hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 transition-all duration-300 btn-press shadow-lg shadow-amber-400/20">
            {loading ? "Створюю..." : "Створити акаунт"}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6">
          Вже є акаунт?{" "}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
