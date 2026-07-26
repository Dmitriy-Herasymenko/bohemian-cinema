"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  avgRating: number;
  totalVotes: number;
}

export default function Home() {
  const [topMovies, setTopMovies] = useState<Movie[]>([]);
  const [stats, setStats] = useState({ totalMovies: 0, totalUsers: 0 });

  useEffect(() => {
    fetch("/api/movies")
      .then((r) => r.json())
      .then((movies: Movie[]) => {
        const watched = movies.filter((m) => m.avgRating > 0);
        setTopMovies(watched.sort((a, b) => b.avgRating - a.avgRating).slice(0, 5));
        setStats({ totalMovies: movies.length, totalUsers: 4 });
      });
  }, []);

  return (
    <div className="space-y-12">
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-amber-400">MoviesDrunk</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Оцінюйте фільми разом з друзями. Діліться враженнями та обирайте наступний фільм!
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/movies"
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-amber-400/50 transition-colors"
        >
          <div className="text-3xl font-bold text-amber-400">{stats.totalMovies}</div>
          <div className="text-gray-400 mt-1">Фільмів переглянуто</div>
        </Link>
        <Link
          href="/upcoming"
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-amber-400/50 transition-colors"
        >
          <div className="text-3xl font-bold text-amber-400">🎬</div>
          <div className="text-gray-400 mt-1">Дивитись далі</div>
        </Link>
        <Link
          href="/roulette"
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-amber-400/50 transition-colors"
        >
          <div className="text-3xl font-bold text-amber-400">🎲</div>
          <div className="text-gray-400 mt-1">Рулетка вибору</div>
        </Link>
      </section>

      {topMovies.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">🏆 Топ фільмів</h2>
          <div className="space-y-3">
            {topMovies.map((movie, i) => (
              <Link
                key={movie.id}
                href={`/movies?id=${movie.id}`}
                className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-amber-400/50 transition-colors"
              >
                <span className="text-2xl font-bold text-gray-600 w-8">{i + 1}</span>
                <div className="flex-1">
                  <div className="font-medium">
                    {movie.title}
                    {movie.year && <span className="text-gray-500 ml-2">({movie.year})</span>}
                  </div>
                </div>
                <div className="text-amber-400 font-bold text-lg">
                  {movie.avgRating.toFixed(1)}
                </div>
                <div className="text-gray-500 text-sm">
                  {movie.totalVotes} голосів
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
