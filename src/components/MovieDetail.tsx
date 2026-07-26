"use client";

import { useState, useEffect } from "react";
import { YouTubeEmbed } from "./MovieCard";

interface User { id: string; name: string; }
interface Vote { userId: string; rating: number; user: { name: string }; }
interface Comment { id: string; text: string; user: { name: string }; createdAt: string; }

interface Movie {
  id: string;
  title: string;
  year: number | null;
  poster: string | null;
  trailerUrl: string | null;
  description: string | null;
  avgRating: number;
  votes: Vote[];
  comments: Comment[];
}

export function MovieDetail({ movie, onBack, onUpdate }: { movie: Movie; onBack: () => void; onUpdate: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [rating, setRating] = useState<number>(7);
  const [commentText, setCommentText] = useState("");
  const [voteAnimation, setVoteAnimation] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) setCurrentUser(saved);
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);

  const handleVote = async () => {
    if (!currentUser) return;
    setVoteAnimation(true);
    await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser, movieId: movie.id, rating }),
    });
    setTimeout(() => setVoteAnimation(false), 500);
    onUpdate();
  };

  const handleComment = async () => {
    if (!currentUser || !commentText.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser, movieId: movie.id, text: commentText }),
    });
    setCommentText("");
    onUpdate();
  };

  const handleDelete = async () => {
    if (!confirm("Видалити фільм?")) return;
    await fetch(`/api/movies/${movie.id}`, { method: "DELETE" });
    onBack();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <button onClick={onBack} className="text-amber-400 hover:text-amber-300 transition-colors btn-press flex items-center gap-2">
        <span className="text-lg">←</span> Назад до списку
      </button>

      {/* Hero section */}
      <div className="flex flex-col lg:flex-row gap-8 animate-slide-up">
        {movie.poster && (
          <div className="w-full lg:w-80 shrink-0">
            <img src={movie.poster} alt={movie.title}
              className="w-full rounded-2xl shadow-2xl shadow-black/40 poster-hover" />
          </div>
        )}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              {movie.title}
              {movie.year && <span className="text-gray-600 ml-3 text-2xl font-normal">({movie.year})</span>}
            </h1>
            {movie.description && <p className="text-gray-400 mt-3 leading-relaxed text-lg">{movie.description}</p>}
          </div>
          {movie.trailerUrl && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="text-amber-400">▶</span> Трейлер
              </h2>
              <YouTubeEmbed url={movie.trailerUrl} />
            </div>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="glass-card rounded-2xl p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-xl font-bold mb-6">Середня оцінка</h2>
        <div className="flex items-end gap-4 mb-6">
          <span className={`text-6xl font-black gradient-text ${voteAnimation ? "animate-number-pop" : ""}`}>
            {movie.avgRating > 0 ? movie.avgRating.toFixed(1) : "—"}
          </span>
          <span className="text-gray-600 text-lg mb-1">
            / 10
          </span>
        </div>
        <div className="text-gray-500 mb-6">
          {movie.votes.length} {movie.votes.length === 1 ? "голос" : "голосів"}
        </div>
        {movie.votes.length > 0 && (
          <div className="space-y-3">
            {movie.votes.map((v) => (
              <div key={v.userId} className="flex items-center gap-4">
                <span className="text-gray-400 w-24 font-medium">{v.user.name}</span>
                <div className="flex gap-1 flex-1 max-w-xs">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i}
                      className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                        i < v.rating
                          ? "bg-gradient-to-r from-amber-500 to-amber-300 rating-bar"
                          : "bg-surface-hover"
                      }`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>
                <span className="text-amber-400 font-bold text-lg w-8 text-right">{v.rating}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vote form */}
      <div className="glass-card rounded-2xl p-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-xl font-bold mb-4">Оцінити фільм</h2>
        <div className="flex flex-wrap items-center gap-4">
          <select value={currentUser}
            onChange={(e) => { setCurrentUser(e.target.value); localStorage.setItem("currentUser", e.target.value); }}
            className="bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors">
            <option value="">Обери себе...</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <div className="flex items-center gap-3 bg-surface-input border border-border rounded-xl px-4 py-3">
            <input type="range" min={1} max={10} value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-32 accent-amber-400" />
            <span className="text-3xl font-black text-amber-400 w-10 text-center animate-fade-in-scale" key={rating}>
              {rating}
            </span>
          </div>
          <button onClick={handleVote} disabled={!currentUser}
            className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-8 py-3 rounded-xl font-bold hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 btn-press shadow-lg shadow-amber-400/20">
            Голосувати
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="glass-card rounded-2xl p-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>💬</span> Коментарі
          <span className="text-gray-600 text-base font-normal">({movie.comments.length})</span>
        </h2>
        <div className="space-y-4 mb-6 stagger-children">
          {movie.comments.length === 0 && (
            <p className="text-gray-600 text-center py-8">Ще немає коментарів. Будь першим!</p>
          )}
          {movie.comments.map((c) => (
            <div key={c.id} className="bg-surface-hover/50 rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 text-sm font-bold">
                  {c.user.name[0]}
                </div>
                <span className="font-semibold text-amber-400 text-sm">{c.user.name}</span>
                <span className="text-gray-700 text-xs">
                  {new Date(c.createdAt).toLocaleDateString("uk-UA")}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input type="text" placeholder="Додати коментар..."
            value={commentText} onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            className="flex-1 bg-surface-input border border-border rounded-xl px-5 py-3 focus:outline-none focus:border-amber-400 transition-colors" />
          <button onClick={handleComment} disabled={!currentUser || !commentText.trim()}
            className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 btn-press">
            Надіслати
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleDelete}
          className="text-red-400/60 hover:text-red-400 text-sm transition-colors btn-press">
          Видалити фільм
        </button>
      </div>
    </div>
  );
}
