"use client";

import { useState } from "react";

export function AddMovieForm({ onAdd, defaultStatus = "watched" }: { onAdd: () => void; defaultStatus?: string }) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [poster, setPoster] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(false);

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
        status: defaultStatus,
      }),
    });
    setLoading(false);
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold">
        {defaultStatus === "watched" ? "Додати переглянутий фільм" : "Додати майбутній фільм"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text" placeholder="Назва фільму *"
          value={title} onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400"
          required
        />
        <input
          type="number" placeholder="Рік"
          value={year} onChange={(e) => setYear(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400"
        />
      </div>
      <textarea
        placeholder="Опис (опціонально)"
        value={description} onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400 h-20 resize-none"
      />
      <input
        type="url" placeholder="URL картинки постера (опціонально)"
        value={poster} onChange={(e) => setPoster(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400"
      />
      <input
        type="url" placeholder="Посилання на YouTube трейлер (опціонально)"
        value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400"
      />
      {poster && (
        <img src={poster} alt="Preview" className="h-40 rounded-lg object-cover" />
      )}
      <button
        type="submit" disabled={loading || !title.trim()}
        className="bg-amber-400 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Додаю..." : "Додати фільм"}
      </button>
    </form>
  );
}
