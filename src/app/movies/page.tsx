"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  poster: string | null;
  avgRating: number;
  totalVotes: number;
  party: { id: string; title: string; date: string } | null;
}

export default function MoviesPage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch("/api/parties").then((r) => r.json()).then((parties: { movies: (Movie & { votes: { rating: number }[] })[] }[]) => {
      const all: Movie[] = [];
      for (const p of parties) {
        for (const m of p.movies) {
          all.push({
            ...m,
            avgRating: m.votes.length > 0 ? m.votes.reduce((s, v) => s + v.rating, 0) / m.votes.length : 0,
            totalVotes: m.votes.length,
            party: { id: "", title: "", date: "", ...m.party },
          });
        }
      }
      all.sort((a, b) => b.avgRating - a.avgRating);
      setMovies(all);
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
        <span className="text-amber-400">🎬</span> Всі фільми
      </h1>

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-float">🎞️</div>
          <p className="text-gray-600 text-lg">Ще немає фільмів. Додайте до п&apos;янки!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {movies.map((movie) => (
            <div key={movie.id} className="glass-card rounded-2xl overflow-hidden poster-hover group">
              {movie.poster ? (
                <div className="relative h-56 overflow-hidden">
                  <img src={movie.poster} alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/30 to-transparent" />
                  {movie.avgRating > 0 && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-amber-400 font-black px-3 py-1 rounded-xl">
                      {movie.avgRating.toFixed(1)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-56 bg-surface-hover flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-700">🎬</div>
              )}
              <div className="p-5">
                <h3 className="font-bold text-lg truncate">
                  {movie.title}
                  {movie.year && <span className="text-gray-600 ml-1 text-sm font-normal">({movie.year})</span>}
                </h3>
                {movie.party && (
                  <p className="text-gray-500 text-xs mt-1">🍻 {movie.party.title}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  {movie.avgRating > 0 && (
                    <span className="text-amber-400 font-bold text-xl">{movie.avgRating.toFixed(1)}</span>
                  )}
                  <span className="text-gray-600 text-sm">{movie.totalVotes} голосів</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
