"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  poster: string | null;
  avgRating: number;
  totalVotes: number;
}

export default function Home() {
  const [topMovies, setTopMovies] = useState<Movie[]>([]);
  const [stats, setStats] = useState({ totalMovies: 0 });

  useEffect(() => {
    fetch("/api/movies")
      .then((r) => r.json())
      .then((movies: Movie[]) => {
        const watched = movies.filter((m) => m.avgRating > 0);
        setTopMovies(watched.sort((a, b) => b.avgRating - a.avgRating).slice(0, 5));
        setStats({ totalMovies: movies.length });
      });
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-20 animate-fade-in">
        <div className="inline-block mb-6 text-7xl animate-float">🎬</div>
        <h1 className="text-6xl sm:text-7xl font-black mb-4 tracking-tight">
          <span className="gradient-text">Bohemian Cinema</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
          Оцінюйте фільми разом з друзями. Діліться враженнями,
          дивіться трейлери та обирайте наступний фільм!
        </p>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <Link
          href="/movies"
          className="glass-card rounded-2xl p-6 group transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover"
        >
          <div className="text-4xl mb-3 group-hover:animate-float">🎥</div>
          <div className="text-2xl font-bold text-amber-400">{stats.totalMovies}</div>
          <div className="text-gray-500 mt-1 text-sm">фільмів переглянуто</div>
        </Link>
        <Link
          href="/upcoming"
          className="glass-card rounded-2xl p-6 group transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover"
        >
          <div className="text-4xl mb-3 group-hover:animate-float">🍿</div>
          <div className="text-2xl font-bold text-amber-400">Майбутнє</div>
          <div className="text-gray-500 mt-1 text-sm">що будемо дивитись</div>
        </Link>
        <Link
          href="/roulette"
          className="glass-card rounded-2xl p-6 group transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover"
        >
          <div className="text-4xl mb-3 group-hover:animate-float">🎰</div>
          <div className="text-2xl font-bold text-amber-400">Рулетка</div>
          <div className="text-gray-500 mt-1 text-sm">випадковий вибір</div>
        </Link>
      </section>

      {/* Top movies */}
      {topMovies.length > 0 && (
        <section className="animate-slide-up">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-amber-400">🏆</span> Топ фільмів
          </h2>
          <div className="space-y-3 stagger-children">
            {topMovies.map((movie, i) => (
              <Link
                key={movie.id}
                href={`/movies?id=${movie.id}`}
                className="glass-card flex items-center gap-5 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover group"
              >
                <span className="text-3xl font-black text-gray-700 w-10 text-center group-hover:text-amber-400/60 transition-colors">
                  {i + 1}
                </span>
                {movie.poster ? (
                  <img src={movie.poster} alt="" className="w-12 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-16 rounded-lg bg-surface-hover flex items-center justify-center text-xl">🎬</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {movie.title}
                    {movie.year && <span className="text-gray-600 ml-2 text-sm">({movie.year})</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-black text-xl">
                    {movie.avgRating.toFixed(1)}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {movie.totalVotes} голосів
                  </span>
                </div>
                <div className="w-24 h-2 bg-surface-hover rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full rating-bar"
                    style={{ width: `${(movie.avgRating / 10) * 100}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
