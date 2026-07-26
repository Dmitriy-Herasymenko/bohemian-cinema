"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

interface Party { id: string; title: string; date: string; }
interface Vote { rating: number; user: { id: string; name: string } }
interface Comment { id: string; text: string; user: { id: string; name: string; avatar: string | null }; createdAt: string }
interface Member { user: { id: string; name: string; avatar: string | null } }

interface Movie {
  id: string; title: string; year: number | null; poster: string | null;
  trailerUrl: string | null; description: string | null;
  avgRating: number; totalVotes: number;
  votes: Vote[]; comments: Comment[];
  party: Party | null;
  partyMembers: Member[];
}

export default function MoviesPage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    fetch("/api/parties").then((r) => r.json()).then((parties: { id: string; title: string; date: string; status: string; members: Member[]; movies: (Omit<Movie, "party" | "partyMembers" | "avgRating" | "totalVotes"> & { votes: Vote[]; comments: Comment[] })[] }[]) => {
      const all: Movie[] = [];
      for (const p of parties) {
        if (p.status !== "past") continue;
        for (const m of p.movies) {
          all.push({
            ...m,
            avgRating: m.votes.length > 0 ? m.votes.reduce((s, v) => s + v.rating, 0) / m.votes.length : 0,
            totalVotes: m.votes.length,
            party: { id: p.id, title: p.title, date: p.date },
            partyMembers: p.members,
          });
        }
      }
      all.sort((a, b) => {
        const dateA = a.party?.date || "";
        const dateB = b.party?.date || "";
        return dateB.localeCompare(dateA);
      });
      setMovies(all);
    });
  }, []);

  if (selectedMovie) {
    return <MovieDetail movie={selectedMovie} onBack={() => setSelectedMovie(null)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
        <span className="text-amber-400">🎬</span> Архів фільмів
      </h1>

      {movies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-float">🎞️</div>
          <p className="text-gray-600 text-lg">Ще немає фільмів. Додайте до п&apos;янки!</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {movies.map((movie) => {
            const partyPast = movie.party && new Date(movie.party.date) < new Date();
            const iWasThere = partyPast && user && movie.partyMembers.some((m) => m.user.id === user.userId);
            return (
            <button key={movie.id} onClick={() => setSelectedMovie(movie)}
              className={`glass-card rounded-2xl overflow-hidden text-left transition-all duration-300 poster-hover w-full flex group ${partyPast ? "ring-1 ring-amber-400/20 bg-amber-400/[0.02]" : ""}`}>
              {movie.poster ? (
                <div className="relative w-40 sm:w-52 shrink-0 overflow-hidden">
                  <img src={movie.poster} alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-card/80" />
                  {movie.avgRating > 0 && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-amber-400 font-black px-3 py-1 rounded-xl text-sm">
                      {movie.avgRating.toFixed(1)} ★
                    </div>
                  )}
                  {partyPast && (
                    <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white font-bold px-3 py-1 rounded-xl text-xs">
                      Переглянуто
                    </div>
                  )}
                  {iWasThere && (
                    <div className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-sm text-black font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1">
                      ✓ Я був
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-40 sm:w-52 shrink-0 bg-surface-hover flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-700">🎬</div>
              )}
              <div className="flex-1 p-5 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {movie.title}
                  {movie.year && <span className="text-gray-600 ml-1 text-sm font-normal">({movie.year})</span>}
                </h3>
                {movie.description && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{movie.description}</p>}

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  {movie.party && (
                    <span className="text-gray-400">
                      🍻 {movie.party.title}
                      <span className="text-gray-600 ml-1">
                        · {new Date(movie.party.date).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </span>
                  )}
                </div>

                {movie.partyMembers.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex -space-x-2">
                      {movie.partyMembers.slice(0, 5).map((m) => (
                        <div key={m.user.id} className="w-7 h-7 rounded-full border-2 border-surface-card flex items-center justify-center text-xs font-bold overflow-hidden">
                          {m.user.avatar ? (
                            <img src={m.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-amber-400/20 flex items-center justify-center text-amber-400">{m.user.name[0]}</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="text-gray-600 text-xs">
                      {movie.partyMembers.map((m) => m.user.name).join(", ")}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3">
                  <span className="text-gray-600 text-xs">{movie.totalVotes} голосів</span>
                  <span className="text-gray-600 text-xs">{movie.comments.length} коментарів</span>
                  {movie.trailerUrl && <span className="text-amber-400 text-xs">▶ Трейлер</span>}
                </div>
              </div>
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


function MovieDetail({ movie, onBack }: { movie: Movie; onBack: () => void }) {
  const { user } = useAuth();
  const isMember = user && movie.partyMembers.some((m) => m.user.id === user.userId);
  const existingVote = movie.votes.find((v) => v.user.id === user?.userId);
  const [rating, setRating] = useState(7);
  const [commentText, setCommentText] = useState("");

  const handleVote = async () => {
    await fetch("/api/votes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId: movie.id, rating }),
    });
    onBack();
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await fetch("/api/comments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId: movie.id, text: commentText }),
    });
    setCommentText("");
    onBack();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <button onClick={onBack} className="text-amber-400 hover:text-amber-300 transition-colors">← Назад до архіву</button>

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
          {movie.description && <p className="text-gray-400 leading-relaxed text-lg">{movie.description}</p>}
          {movie.party && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span>🍻 {movie.party.title}</span>
              <span>{new Date(movie.party.date).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          )}
          {movie.partyMembers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Дивились:</span>
              {movie.partyMembers.map((m) => (
                <Link key={m.user.id} href={`/profile/${m.user.id}`}
                  className="flex items-center gap-1.5 bg-surface-hover border border-border rounded-lg px-2 py-1 hover:border-amber-400/30 transition-colors text-sm">
                  {m.user.avatar ? (
                    <img src={m.user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-[10px] font-bold">{m.user.name[0]}</div>
                  )}
                  <span className="text-gray-300">{m.user.name}</span>
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

      {isMember && !existingVote && (
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4">Оцінити фільм</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-surface-input border border-border rounded-xl px-4 py-3">
              <input type="range" min={1} max={10} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-32 accent-amber-400" />
              <span className="text-3xl font-black text-amber-400 w-10 text-center animate-fade-in-scale" key={rating}>{rating}</span>
            </div>
            <button onClick={handleVote}
              className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-8 py-3 rounded-xl font-bold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 btn-press shadow-lg shadow-amber-400/20">
              Голосувати
            </button>
          </div>
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
    </div>
  );
}
