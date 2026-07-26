"use client";

import { useEffect, useState } from "react";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  description: string | null;
  poster: string | null;
  trailerUrl: string | null;
  status: string;
}

export default function UpcomingPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [poster, setPoster] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMovies = () => {
    fetch("/api/movies").then((r) => r.json()).then((all: Movie[]) =>
      setMovies(all.filter((m) => m.status === "upcoming"))
    );
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(), year: year ? parseInt(year) : null,
        description: description.trim() || null, poster: poster.trim() || null,
        trailerUrl: trailerUrl.trim() || null, status: "upcoming",
      }),
    });
    setTitle(""); setYear(""); setDescription(""); setPoster(""); setTrailerUrl("");
    setShowForm(false);
    setLoading(false);
    fetchMovies();
  };

  const handleRemove = async (id: string) => {
    await fetch(`/api/movies/${id}`, { method: "DELETE" });
    fetchMovies();
  };

  const moveToWatched = async (movie: Movie) => {
    await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: movie.title, year: movie.year, description: movie.description,
        poster: movie.poster, trailerUrl: movie.trailerUrl, status: "watched",
      }),
    });
    await fetch(`/api/movies/${movie.id}`, { method: "DELETE" });
    fetchMovies();
  };

  const inputClass = "w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:shadow-lg focus:shadow-amber-400/5 transition-all duration-300 placeholder:text-gray-600";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <span className="text-amber-400">📋</span> Дивитись далі
        </h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-5 py-2.5 rounded-xl font-bold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 btn-press shadow-lg shadow-amber-400/20">
          {showForm ? "✕ Скасувати" : "+ Додати"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="glass-card rounded-2xl p-8 space-y-5 animate-fade-in-scale">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Назва фільму *" value={title} onChange={(e) => setTitle(e.target.value)}
              className={inputClass} required />
            <input type="number" placeholder="Рік" value={year} onChange={(e) => setYear(e.target.value)}
              className={inputClass} />
          </div>
          <textarea placeholder="Опис (опціонально)" value={description} onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} h-24 resize-none`} />
          <input type="url" placeholder="URL картинки постера (опціонально)" value={poster} onChange={(e) => setPoster(e.target.value)}
            className={inputClass} />
          <input type="url" placeholder="Посилання на YouTube трейлер (опціонально)" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)}
            className={inputClass} />
          {poster && <img src={poster} alt="Preview" className="h-48 rounded-xl object-cover shadow-lg shadow-black/30 animate-fade-in-scale" />}
          <button type="submit" disabled={loading || !title.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 py-3 rounded-xl font-bold text-lg disabled:opacity-40 transition-all duration-300 btn-press">
            {loading ? "Додаю..." : "Додати"}
          </button>
        </form>
      )}

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-float">🍿</div>
          <p className="text-gray-600 text-lg">Список порожній. Додайте фільм!</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {movies.map((movie) => (
            <div key={movie.id} className="glass-card flex items-center gap-5 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover group">
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title}
                  className="w-20 h-28 rounded-xl object-cover shadow-lg shadow-black/30 group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-20 h-28 rounded-xl bg-surface-hover flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">🎬</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg truncate">
                  {movie.title}
                  {movie.year && <span className="text-gray-600 ml-2 text-sm font-normal">({movie.year})</span>}
                </div>
                {movie.description && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{movie.description}</p>}
                {movie.trailerUrl && (
                  <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer"
                    className="text-amber-400 text-sm hover:text-amber-300 mt-2 inline-flex items-center gap-1 transition-colors">
                    ▶ Дивитись трейлер
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => moveToWatched(movie)}
                  className="text-green-400 hover:text-green-300 text-sm font-medium btn-press px-3 py-2 rounded-xl hover:bg-green-400/10 transition-all">
                  ✅ Подивились
                </button>
                <button onClick={() => handleRemove(movie.id)}
                  className="text-red-400/50 hover:text-red-400 text-sm btn-press px-3 py-2 rounded-xl hover:bg-red-400/10 transition-all">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
