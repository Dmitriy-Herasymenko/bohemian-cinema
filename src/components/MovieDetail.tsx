"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
}

interface Vote {
  userId: string;
  rating: number;
  user: { name: string };
}

interface Comment {
  id: string;
  text: string;
  user: { name: string };
  createdAt: string;
}

interface Movie {
  id: string;
  title: string;
  year: number | null;
  description: string | null;
  avgRating: number;
  votes: Vote[];
  comments: Comment[];
}

export function MovieDetail({
  movie,
  onBack,
  onUpdate,
}: {
  movie: Movie;
  onBack: () => void;
  onUpdate: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [rating, setRating] = useState<number>(7);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) setCurrentUser(saved);
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  const handleVote = async () => {
    if (!currentUser) return;
    await fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser, movieId: movie.id, rating }),
    });
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
    <div className="space-y-8">
      <button onClick={onBack} className="text-amber-400 hover:text-amber-300">
        ← Назад до списку
      </button>

      <div>
        <h1 className="text-3xl font-bold">
          {movie.title}
          {movie.year && <span className="text-gray-500 ml-3">({movie.year})</span>}
        </h1>
        {movie.description && (
          <p className="text-gray-400 mt-2">{movie.description}</p>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Середня оцінка</h2>
        <div className="text-5xl font-bold text-amber-400">
          {movie.avgRating > 0 ? movie.avgRating.toFixed(1) : "—"}
        </div>
        <div className="text-gray-500 mt-1">
          {movie.votes.length} {movie.votes.length === 1 ? "голос" : "голосів"}
        </div>
        {movie.votes.length > 0 && (
          <div className="mt-4 space-y-2">
            {movie.votes.map((v) => (
              <div key={v.userId} className="flex items-center gap-3">
                <span className="text-gray-400 w-24">{v.user.name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${
                        i < v.rating ? "bg-amber-400" : "bg-gray-800"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-amber-400 font-medium">{v.rating}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Оцінити фільм</h2>
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={currentUser}
            onChange={(e) => {
              setCurrentUser(e.target.value);
              localStorage.setItem("currentUser", e.target.value);
            }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="">Обери себе...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-40 accent-amber-400"
            />
            <span className="text-2xl font-bold text-amber-400 w-8">{rating}</span>
          </div>
          <button
            onClick={handleVote}
            disabled={!currentUser}
            className="bg-amber-400 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Голосувати
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">
          Коментарі ({movie.comments.length})
        </h2>
        <div className="space-y-4 mb-6">
          {movie.comments.length === 0 && (
            <p className="text-gray-500">Ще немає коментарів</p>
          )}
          {movie.comments.map((c) => (
            <div key={c.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-amber-400">{c.user.name}</span>
                <span className="text-gray-600 text-xs">
                  {new Date(c.createdAt).toLocaleDateString("uk-UA")}
                </span>
              </div>
              <p className="text-gray-300">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Додати коментар..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleComment}
            disabled={!currentUser || !commentText.trim()}
            className="bg-amber-400 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Надіслати
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleDelete}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          Видалити фільм
        </button>
      </div>
    </div>
  );
}
