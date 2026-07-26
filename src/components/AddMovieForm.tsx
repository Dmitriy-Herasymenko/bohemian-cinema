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

  const inputClass = "w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:shadow-lg focus:shadow-amber-400/5 transition-all duration-300 placeholder:text-gray-600";

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5 animate-fade-in-scale">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span>{defaultStatus === "watched" ? "🎥" : "📋"}</span>
        {defaultStatus === "watched" ? "Додати переглянутий фільм" : "Додати майбутній фільм"}
      </h2>
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
      {poster && (
        <div className="animate-fade-in-scale">
          <img src={poster} alt="Preview" className="h-48 rounded-xl object-cover shadow-lg shadow-black/30" />
        </div>
      )}
      <button type="submit" disabled={loading || !title.trim()}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 py-3 rounded-xl font-bold text-lg hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 btn-press shadow-lg shadow-amber-400/20">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
            Додаю...
          </span>
        ) : "Додати фільм"}
      </button>
    </form>
  );
}
