"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Party {
  id: string;
  title: string;
  date: string;
  status: string;
  members: { user: { name: string } }[];
  movies: { id: string; title: string; votes: { rating: number }[] }[];
}

export default function Home() {
  const [parties, setParties] = useState<Party[]>([]);

  useEffect(() => {
    fetch("/api/parties").then((r) => r.json()).then(setParties);
  }, []);

  const upcoming = parties.filter((p) => p.status === "upcoming").slice(0, 3);
  const recent = parties.filter((p) => p.status === "past").slice(0, 3);

  return (
    <div className="space-y-16">
      <section className="text-center py-20 animate-fade-in">
        <div className="inline-block mb-6 text-7xl animate-float">🍿</div>
        <h1 className="text-6xl sm:text-7xl font-black mb-4 tracking-tight">
          <span className="gradient-text">Bohemian Cinema</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
          Оцінюйте фільми разом з друзями. Діліться враженнями,
          дивіться трейлери та обирайте наступний фільм!
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <Link href="/parties"
          className="glass-card rounded-2xl p-6 group transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover">
          <div className="text-4xl mb-3 group-hover:animate-float">🍻</div>
          <div className="text-2xl font-bold text-amber-400">{parties.length}</div>
          <div className="text-gray-500 mt-1 text-sm">зустрічей</div>
        </Link>
        <Link href="/movies"
          className="glass-card rounded-2xl p-6 group transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover">
          <div className="text-4xl mb-3 group-hover:animate-float">🎥</div>
          <div className="text-2xl font-bold text-amber-400">Фільми</div>
          <div className="text-gray-500 mt-1 text-sm">всі переглянуті</div>
        </Link>
        <Link href="/roulette"
          className="glass-card rounded-2xl p-6 group transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover">
          <div className="text-4xl mb-3 group-hover:animate-float">🎰</div>
          <div className="text-2xl font-bold text-amber-400">Рулетка</div>
          <div className="text-gray-500 mt-1 text-sm">випадковий вибір</div>
        </Link>
      </section>

      {upcoming.length > 0 && (
        <section className="animate-slide-up">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-400"></span> Наступні зустрічі
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
            {upcoming.map((p) => (
              <Link key={p.id} href={`/parties/${p.id}`}
                className="glass-card rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover">
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(p.date).toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-gray-500 text-sm">{p.members.length} учасників</span>
                  <span className="text-gray-500 text-sm">{p.movies.length} фільмів</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="animate-slide-up">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span> Останні зустрічі
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
            {recent.map((p) => {
              const avg = p.movies.length > 0
                ? p.movies.reduce((sum, m) => {
                    const mAvg = m.votes.length > 0 ? m.votes.reduce((s, v) => s + v.rating, 0) / m.votes.length : 0;
                    return sum + mAvg;
                  }, 0) / p.movies.length
                : 0;
              return (
                <Link key={p.id} href={`/parties/${p.id}`}
                  className="glass-card rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover">
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(p.date).toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-gray-500 text-sm">{p.movies.length} фільмів</span>
                    {avg > 0 && <span className="text-amber-400 font-bold text-sm">{avg.toFixed(1)} ★</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
