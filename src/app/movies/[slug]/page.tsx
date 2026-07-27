"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { ConfirmModal } from "@/components/ConfirmModal";

interface Creator { id: string; name: string; avatar: string | null }
interface Party { id: string; title: string; date: string }
interface Vote { rating: number; user: { id: string; name: string } }
interface Comment { id: string; text: string; user: { id: string; name: string; avatar: string | null }; createdAt: string }
interface Member { id: string; name: string; avatar: string | null }

interface Movie {
  id: string; title: string; year: number | null; poster: string | null;
  trailerUrl: string | null; description: string | null;
  avgRating: number; totalVotes: number;
  votes: Vote[]; comments: Comment[];
  party: Party | null;
  partyMembers: Member[];
  createdBy: Creator | null;
}

export default function MovieSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(7);
  const [commentText, setCommentText] = useState("");
  const [voteError, setVoteError] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  const fetchMovie = async () => {
    const res = await fetch(`/api/movies/slug/${slug}`);
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setMovie({
      ...data,
      avgRating: data.votes.length > 0 ? data.votes.reduce((s: number, v: Vote) => s + v.rating, 0) / data.votes.length : 0,
      totalVotes: data.votes.length,
    });
    setLoading(false);
  };

  useEffect(() => { fetchMovie(); }, [slug]);

  const isMember = user && movie && movie.partyMembers.some((m) => m.id === user.userId);
  const existingVote = movie?.votes.find((v) => v.user.id === user?.userId);
  const partyIsPast = movie?.party && new Date(movie.party.date) < new Date();
  const canVote = isMember && !existingVote && partyIsPast;
  const isCreator = user && movie && movie.createdBy?.id === user.userId;

  const handleDelete = async () => {
    if (!movie) return;
    await fetch(`/api/movies/${movie.id}`, { method: "DELETE" });
    setShowDelete(false);
    router.push(movie.party ? "/movies" : "/future-movies");
  };

  const handleVote = async () => {
    if (!movie) return;
    setVoteError("");
    const res = await fetch("/api/votes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId: movie.id, rating }),
    });
    if (res.ok) { setRating(7); await fetchMovie(); }
    else { const d = await res.json(); setVoteError(d.error || "Помилка"); }
  };

  const handleComment = async () => {
    if (!movie || !commentText.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId: movie.id, text: commentText }),
    });
    if (res.ok) { setCommentText(""); await fetchMovie(); }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Завантаження...</div>;
  if (!movie) return <div className="text-center py-20 text-gray-500">Фільм не знайдено</div>;

  const backHref = movie.party ? "/movies" : "/future-movies";

  return (
    <div className="space-y-8 animate-fade-in">
      <Link href={backHref} className="text-amber-400 hover:text-amber-300 transition-colors">← Назад</Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {movie.poster && (
          <div className="w-full lg:w-80 shrink-0">
            <img src={movie.poster} alt={movie.title} className="w-full rounded-2xl shadow-2xl shadow-black/40 poster-hover" />
          </div>
        )}
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-black tracking-tight">
            {movie.title}
            {movie.year && <span className="text-gray-600 ml-3 text-2xl font-normal">({movie.year})</span>}
          </h1>
          {movie.createdBy && (
            <Link href={`/profile/${movie.createdBy.id}`}
              className="flex items-center gap-2 text-gray-500 hover:text-amber-400 transition-colors text-sm">
              {movie.createdBy.avatar ? (
                <img src={movie.createdBy.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-[10px] font-bold">{movie.createdBy.name[0]}</div>
              )}
              <span>Додав(-ла) <strong>{movie.createdBy.name}</strong></span>
            </Link>
          )}
          {movie.description && <p className="text-gray-400 leading-relaxed text-lg">{movie.description}</p>}
          {movie.party && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span>🍻 {movie.party.title}</span>
              <span>{new Date(movie.party.date).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}</span>
              {partyIsPast && <span className="text-green-400/70">✓ Переглянуто</span>}
            </div>
          )}
          {movie.partyMembers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Дивились:</span>
              {movie.partyMembers.map((m) => (
                <Link key={m.id} href={`/profile/${m.id}`}
                  className="flex items-center gap-1.5 bg-surface-hover border border-border rounded-lg px-2 py-1 hover:border-amber-400/30 transition-colors text-sm">
                  {m.avatar ? (
                    <img src={m.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-[10px] font-bold">{m.name[0]}</div>
                  )}
                  <span className="text-gray-300">{m.name}</span>
                </Link>
              ))}
            </div>
          )}
          {movie.trailerUrl && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><span className="text-amber-400">▶</span> Трейлер</h2>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                <iframe src={`https://www.youtube.com/embed/${movie.trailerUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)?.[1] || ""}`}
                  title="Trailer" className="absolute inset-0 w-full h-full" allowFullScreen />
              </div>
            </div>
          )}
        </div>
      </div>

      {canVote && (
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4">Оцінити фільм</h2>
          {voteError && <p className="text-red-400 text-sm mb-3">{voteError}</p>}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-surface-input border border-border rounded-xl px-4 py-3">
              <input type="range" min={1} max={10} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-32 accent-amber-400" />
              <span className="text-3xl font-black text-amber-400 w-10 text-center" key={rating}>{rating}</span>
            </div>
            <button onClick={handleVote}
              className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-8 py-3 rounded-xl font-bold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 btn-press shadow-lg shadow-amber-400/20">
              Голосувати
            </button>
          </div>
        </div>
      )}
      {isMember && existingVote && (
        <div className="glass-card rounded-2xl p-6 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <span className="text-gray-400">Ви вже оцінили цей фільм на <strong className="text-amber-400">{existingVote.rating}</strong></span>
        </div>
      )}

      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-4">Оцінки ({movie.votes.length})</h2>
        {movie.votes.length === 0 ? (
          <p className="text-gray-600">Ще немає оцінок</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-end gap-4 mb-4">
              <span className="text-5xl font-black gradient-text">{movie.avgRating.toFixed(1)}</span>
              <span className="text-gray-600 text-lg mb-1">/ 10</span>
            </div>
            {movie.votes.map((v, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-gray-400 w-24 font-medium">{v.user.name}</span>
                <div className="flex gap-1 flex-1 max-w-xs">
                  {Array.from({ length: 10 }, (_, j) => (
                    <div key={j} className={`h-3 flex-1 rounded-full transition-all duration-300 ${j < v.rating ? "bg-gradient-to-r from-amber-500 to-amber-300 rating-bar" : "bg-surface-hover"}`} style={{ animationDelay: `${j * 0.05}s` }} />
                  ))}
                </div>
                <span className="text-amber-400 font-bold text-lg w-8 text-right">{v.rating}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-4">Коментарі ({movie.comments.length})</h2>
        <div className="space-y-3 mb-6">
          {movie.comments.length === 0 && <p className="text-gray-600">Ще немає коментарів</p>}
          {movie.comments.map((c) => (
            <div key={c.id} className="bg-surface-hover/50 rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/profile/${c.user.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {c.user.avatar ? (
                    <img src={c.user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold">{c.user.name[0]}</div>
                  )}
                  <span className="font-semibold text-amber-400 text-sm">{c.user.name}</span>
                </Link>
                <span className="text-gray-700 text-xs">{new Date(c.createdAt).toLocaleDateString("uk-UA")}</span>
              </div>
              <p className="text-gray-300">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input type="text" placeholder="Коментар..." value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            className="flex-1 bg-surface-input border border-border rounded-xl px-5 py-3 focus:outline-none focus:border-amber-400 transition-colors" />
          <button onClick={handleComment} disabled={!commentText.trim()}
            className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-6 py-3 rounded-xl font-bold disabled:opacity-40 transition-all duration-300 btn-press">
            Надіслати
          </button>
        </div>
      </div>

      {isCreator && (
        <div className="flex justify-end">
          <button onClick={() => setShowDelete(true)}
            className="text-red-400/60 hover:text-red-400 text-sm transition-colors btn-press">
            Видалити фільм
          </button>
        </div>
      )}

      <ConfirmModal
        open={showDelete}
        title="Видалити фільм?"
        message="Це дію неможливо скасувати."
        confirmLabel="Видалити"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
