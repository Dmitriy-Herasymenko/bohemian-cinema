"use client";

import { useEffect, useState } from "react";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  description: string | null;
}

export default function UpcomingPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMovies = () => {
    fetch("/api/movies")
      .then((r) => r.json())
      .then((all: Movie[]) =>
        setMovies(all.filter((m) => (m as Movie & { status: string }).status === "upcoming"))
      );
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
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
        status: "upcoming",
      }),
    });
    setTitle("");
    setYear("");
    setDescription("");
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
        title: movie.title,
        year: movie.year,
        description: movie.description,
        status: "watched",
      }),
    });
    await fetch(`/api/movies/${movie.id}`, { method: "DELETE" });
    fetchMovies();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Дивитись далі</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-400 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-amber-300 transition-colors"
        >
          {showForm ? "Скасувати" : "+ Додати фільм"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Назва фільму *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400"
              required
            />
            <input
              type="number"
              placeholder="Рік"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>
          <textarea
            placeholder="Опис (опціонально)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400 h-20 resize-none"
          />
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-amber-400 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-amber-300 disabled:opacity-50 transition-colors"
          >
            {loading ? "Додаю..." : "Додати"}
          </button>
        </form>
      )}

      {movies.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          Список порожній. Додайте фільм, який хочете подивитись!
        </div>
      ) : (
        <div className="space-y-3">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <span className="text-2xl">🎬</span>
              <div className="flex-1">
                <div className="font-medium">
                  {movie.title}
                  {movie.year && (
                    <span className="text-gray-500 ml-2">({movie.year})</span>
                  )}
                </div>
                {movie.description && (
                  <p className="text-gray-400 text-sm mt-1">{movie.description}</p>
                )}
              </div>
              <button
                onClick={() => moveToWatched(movie)}
                className="text-green-400 hover:text-green-300 text-sm font-medium"
              >
                ✅ Подивились
              </button>
              <button
                onClick={() => handleRemove(movie.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Видалити
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
