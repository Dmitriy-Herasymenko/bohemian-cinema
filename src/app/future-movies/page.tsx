"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  poster: string | null;
  trailerUrl: string | null;
  description: string | null;
  party: { id: string; title: string } | null;
}

export default function FutureMoviesPage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [poster, setPoster] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMovies = () => {
    Promise.all([
      fetch("/api/movies").then((r) => r.json()),
      fetch("/api/parties").then((r) => r.json()),
    ]).then(([standalone, parties]) => {
      const upcomingMovies: Movie[] = [];
      for (const p of parties) {
        if (p.status !== "upcoming") continue;
        for (const m of p.movies) {
          upcomingMovies.push({
            id: m.id,
            title: m.title,
            year: m.year,
            poster: m.poster,
            trailerUrl: m.trailerUrl,
            description: m.description,
            party: { id: p.id, title: p.title },
          });
        }
      }
      setMovies([...standalone, ...upcomingMovies]);
    });
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        year: year ? parseInt(year) : null,
        description: description.trim() || null,
        poster: poster.trim() || null,
        trailerUrl: trailerUrl.trim() || null,
      }),
    });
    setTitle("");
    setYear("");
    setDescription("");
    setPoster("");
    setTrailerUrl("");
    setShowForm(false);
    setLoading(false);
    fetchMovies();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити фільм?")) return;
    await fetch(`/api/movies/${id}`, { method: "DELETE" });
    fetchMovies();
  };

  const input =
    "w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-gray-600";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <span className="text-amber-400">🎬</span> Майбутні фільми
        </h1>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-5 py-2.5 rounded-xl font-bold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 btn-press shadow-lg shadow-amber-400/20"
          >
            {showForm ? "Скасувати" : "+ Додати фільм"}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 space-y-4 animate-fade-in-scale"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Назва *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={input}
              required
            />
            <input
              type="number"
              placeholder="Рік"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={input}
            />
          </div>
          <textarea
            placeholder="Опис"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${input} h-16 resize-none`}
          />
          <input
            type="url"
            placeholder="URL постера"
            value={poster}
            onChange={(e) => setPoster(e.target.value)}
            className={input}
          />
          <input
            type="url"
            placeholder="YouTube трейлер URL"
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            className={input}
          />
          {poster && (
            <img src={poster} alt="" className="h-32 rounded-lg object-cover" />
          )}
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-6 py-2.5 rounded-xl font-bold disabled:opacity-40 transition-all duration-300 btn-press"
          >
            {loading ? "Додаю..." : "Додати"}
          </button>
        </form>
      )}

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-float">🎞️</div>
          <p className="text-gray-600 text-lg">
            Ще немає майбутніх фільмів. Додайте перший!
          </p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="glass-card rounded-2xl overflow-hidden text-left transition-all duration-300 poster-hover w-full flex group"
            >
              {movie.poster ? (
                <div className="relative w-40 sm:w-52 shrink-0 overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-card/80" />
                  {movie.trailerUrl && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-amber-400 font-bold px-3 py-1 rounded-xl text-xs">
                      ▶ Трейлер
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-40 sm:w-52 shrink-0 bg-surface-hover flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-700">
                  🎬
                </div>
              )}
              <div className="flex-1 p-5 min-w-0 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg truncate">
                    {movie.title}
                    {movie.year && (
                      <span className="text-gray-600 ml-1 text-sm font-normal">
                        ({movie.year})
                      </span>
                    )}
                  </h3>
                  {movie.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {movie.description}
                    </p>
                  )}
                  {movie.party && (
                    <div className="text-gray-600 text-xs mt-2">
                      🍻 Заплановано на: {movie.party.title}
                    </div>
                  )}
                </div>
                {user && (
                  <button
                    onClick={() => handleDelete(movie.id)}
                    className="text-red-400/0 group-hover:text-red-400 text-xs transition-colors ml-4 btn-press shrink-0"
                  >
                    Видалити
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
