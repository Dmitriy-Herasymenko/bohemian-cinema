"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { YouTubeEmbed } from "@/components/MovieCard";

interface User { id: string; name: string; avatar: string | null; email: string; }
interface Vote { userId: string; rating: number; user: { name: string }; }
interface Comment { id: string; text: string; user: { name: string }; createdAt: string; }
interface Movie {
  id: string; title: string; year: number | null; poster: string | null;
  trailerUrl: string | null; description: string | null;
  avgRating: number; votes: Vote[]; comments: Comment[];
}
interface Party {
  id: string; title: string; date: string; status: string; description: string | null;
  members: { user: User }[];
  movies: Movie[];
}

export default function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [party, setParty] = useState<Party | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const fetchParty = async () => {
    const res = await fetch(`/api/parties/${id}`);
    if (res.ok) setParty(await res.json());
  };

  useEffect(() => {
    fetchParty();
    fetch("/api/users").then((r) => r.json()).then(setAllUsers);
  }, [id]);

  if (!party) return <div className="text-center py-20 text-gray-500 animate-pulse">Завантаження...</div>;

  const isMember = user && party.members.some((m) => m.user.id === user.userId);
  const isPast = party.status === "past";
  const isUpcoming = party.status === "upcoming";
  const selectedMovie = party.movies.find((m) => m.id === selectedMovieId);

  if (selectedMovie) {
    return <MovieInParty movie={selectedMovie} isMember={!!isMember} user={user}
      onBack={() => setSelectedMovieId(null)} onUpdate={fetchParty} />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <Link href="/parties" className="text-amber-400 hover:text-amber-300 transition-colors">← Назад</Link>

      {isUpcoming && isMember ? (
        <EditPartyHeader party={party} allUsers={allUsers} onUpdate={fetchParty} />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="text-amber-400">🍻</span> {party.title}
            </h1>
            <p className="text-gray-500 mt-1">
              {new Date(party.date).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            {party.description && <p className="text-gray-400 mt-2">{party.description}</p>}
          </div>
          {isPast && <span className="bg-gray-500/10 text-gray-500 px-4 py-2 rounded-xl text-sm font-medium">Завершено</span>}
        </div>
      )}

      {/* Members */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>👥</span> Учасники ({party.members.length})
        </h2>
        <div className="flex flex-wrap gap-3">
          {party.members.map((m) => (
            <Link key={m.user.id} href={`/profile/${m.user.id}`}
              className="flex items-center gap-2 bg-surface-hover border border-border rounded-xl px-4 py-2 hover:border-amber-400/30 transition-colors group">
              {m.user.avatar ? (
                <img src={m.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-sm font-bold">{m.user.name[0]}</div>
              )}
              <span className="text-gray-300">{m.user.name}</span>
              {isUpcoming && isMember && (
                <button onClick={(e) => { e.preventDefault(); removeMember(m.user.id); }}
                  className="text-red-400/0 group-hover:text-red-400 text-xs transition-colors ml-1">✕</button>
              )}
            </Link>
          ))}
        </div>
        {isUpcoming && isMember && (
          <AddMemberSection partyId={party.id} allUsers={allUsers} currentMembers={party.members.map((m) => m.user.id)} onUpdate={fetchParty} />
        )}
      </div>

      {/* Movies */}
      {isUpcoming && isMember && <AddMovieToParty partyId={party.id} onAdded={fetchParty} />}

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>🎬</span> Фільми ({party.movies.length})
        </h2>
        {party.movies.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3 animate-float">🎞️</div>
            <p className="text-gray-600">Ще немає фільмів. Додайте перший!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {party.movies.map((movie) => {
              const avg = movie.votes.length > 0 ? movie.votes.reduce((s, v) => s + v.rating, 0) / movie.votes.length : 0;
              return (
                <div key={movie.id} className="glass-card rounded-2xl overflow-hidden poster-hover group relative">
                  <button onClick={() => setSelectedMovieId(movie.id)} className="text-left w-full">
                    {movie.poster ? (
                      <div className="relative h-56 overflow-hidden">
                        <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/30 to-transparent" />
                        {avg > 0 && <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-amber-400 font-black px-3 py-1 rounded-xl">{avg.toFixed(1)}</div>}
                      </div>
                    ) : (
                      <div className="h-56 bg-surface-hover flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-700">🎬</div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold truncate">{movie.title}{movie.year && <span className="text-gray-600 ml-1 text-sm font-normal">({movie.year})</span>}</h3>
                      <p className="text-gray-500 text-sm mt-1">{movie.votes.length} голосів</p>
                    </div>
                  </button>
                  {isUpcoming && isMember && (
                    <button onClick={() => deleteMovie(movie.id)}
                      className="absolute top-3 left-3 bg-red-500/80 hover:bg-red-500 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all btn-press">
                      Видалити
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  function removeMember(userId: string) {
    if (!confirm("Видалити учасника?") || !party) return;
    fetch(`/api/parties/${party.id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then(() => fetchParty());
  }

  function deleteMovie(movieId: string) {
    if (!confirm("Видалити фільм?")) return;
    fetch(`/api/movies/${movieId}`, { method: "DELETE" }).then(() => fetchParty());
  }
}


function EditPartyHeader({ party, allUsers, onUpdate }: { party: Party; allUsers: User[]; onUpdate: () => void }) {
  const [title, setTitle] = useState(party.title);
  const [date, setDate] = useState(new Date(party.date).toISOString().slice(0, 16));
  const [description, setDescription] = useState(party.description || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/parties/${party.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, description: description || null }),
    });
    setSaving(false);
    onUpdate();
  };

  const markPast = async () => {
    if (!confirm("Позначити п'янку як завершену?")) return;
    await fetch(`/api/parties/${party.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "past" }),
    });
    onUpdate();
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 animate-fade-in-scale">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><span className="text-amber-400">✏️</span> Редагувати п&apos;янку</h1>
        <button onClick={markPast} className="text-gray-500 hover:text-amber-400 text-sm transition-colors">Позначити як завершену</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Назва"
          className="bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors" />
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors text-gray-300" />
      </div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Опис"
        className="w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors h-16 resize-none" />
      <button onClick={handleSave} disabled={saving || !title.trim()}
        className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-6 py-2.5 rounded-xl font-bold disabled:opacity-40 transition-all duration-300 btn-press">
        {saving ? "Зберігаю..." : "Зберегти зміни"}
      </button>
    </div>
  );
}


function AddMemberSection({ partyId, allUsers, currentMembers, onUpdate }: {
  partyId: string; allUsers: User[]; currentMembers: string[]; onUpdate: () => void;
}) {
  const [show, setShow] = useState(false);
  const available = allUsers.filter((u) => !currentMembers.includes(u.id));

  const addMember = async (userId: string) => {
    await fetch(`/api/parties/${partyId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    onUpdate();
  };

  if (available.length === 0) return null;

  return (
    <div className="mt-4">
      {!show ? (
        <button onClick={() => setShow(true)}
          className="text-amber-400 text-sm hover:text-amber-300 transition-colors">+ Додати учасника</button>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2 animate-fade-in">
          {available.map((u) => (
            <button key={u.id} onClick={() => addMember(u.id)}
              className="flex items-center gap-2 bg-surface-hover border border-border rounded-xl px-3 py-2 hover:border-green-400/30 transition-colors text-sm btn-press">
              <span className="text-green-400">+</span>
              <span className="text-gray-300">{u.name}</span>
            </button>
          ))}
          <button onClick={() => setShow(false)} className="text-gray-600 text-sm hover:text-gray-400">Скасувати</button>
        </div>
      )}
    </div>
  );
}


function AddMovieToParty({ partyId, onAdded }: { partyId: string; onAdded: () => void }) {
  const [show, setShow] = useState(false);
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
    await fetch(`/api/parties/${partyId}/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), year: year || null, description: description.trim() || null, poster: poster.trim() || null, trailerUrl: trailerUrl.trim() || null }),
    });
    setTitle(""); setYear(""); setDescription(""); setPoster(""); setTrailerUrl("");
    setShow(false); setLoading(false); onAdded();
  };

  const input = "w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-gray-600";

  return (
    <div className="mb-6">
      {!show ? (
        <button onClick={() => setShow(true)}
          className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-5 py-2.5 rounded-xl font-bold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 btn-press shadow-lg shadow-amber-400/20">
          + Додати фільм
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4 animate-fade-in-scale">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Додати фільм</h3>
            <button type="button" onClick={() => setShow(false)} className="text-gray-500 hover:text-gray-300">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Назва *" value={title} onChange={(e) => setTitle(e.target.value)} className={input} required />
            <input type="number" placeholder="Рік" value={year} onChange={(e) => setYear(e.target.value)} className={input} />
          </div>
          <textarea placeholder="Опис" value={description} onChange={(e) => setDescription(e.target.value)} className={`${input} h-16 resize-none`} />
          <input type="url" placeholder="URL постера" value={poster} onChange={(e) => setPoster(e.target.value)} className={input} />
          <input type="url" placeholder="YouTube трейлер URL" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} className={input} />
          {poster && <img src={poster} alt="" className="h-32 rounded-lg object-cover" />}
          <button type="submit" disabled={loading || !title.trim()}
            className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-6 py-2.5 rounded-xl font-bold disabled:opacity-40 transition-all duration-300 btn-press">
            {loading ? "Додаю..." : "Додати"}
          </button>
        </form>
      )}
    </div>
  );
}


function MovieInParty({ movie, isMember, user, onBack, onUpdate }: {
  movie: Movie; isMember: boolean; user: { userId: string } | null; onBack: () => void; onUpdate: () => void;
}) {
  const [rating, setRating] = useState(7);
  const [commentText, setCommentText] = useState("");

  const handleVote = async () => {
    if (!user) return;
    await fetch("/api/votes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ movieId: movie.id, rating }) });
    onUpdate();
  };

  const handleComment = async () => {
    if (!user || !commentText.trim()) return;
    await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ movieId: movie.id, text: commentText }) });
    setCommentText(""); onUpdate();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <button onClick={onBack} className="text-amber-400 hover:text-amber-300 transition-colors">← Назад</button>

      <div className="flex flex-col lg:flex-row gap-8">
        {movie.poster && <div className="w-full lg:w-80 shrink-0"><img src={movie.poster} alt={movie.title} className="w-full rounded-2xl shadow-2xl shadow-black/40 poster-hover" /></div>}
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-black tracking-tight">{movie.title}{movie.year && <span className="text-gray-600 ml-3 text-2xl font-normal">({movie.year})</span>}</h1>
          {movie.description && <p className="text-gray-400 leading-relaxed text-lg">{movie.description}</p>}
          {movie.trailerUrl && <div><h2 className="text-lg font-bold mb-3 flex items-center gap-2"><span className="text-amber-400">▶</span> Трейлер</h2><YouTubeEmbed url={movie.trailerUrl} /></div>}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-4">Середня оцінка</h2>
        <div className="flex items-end gap-4 mb-6">
          <span className="text-6xl font-black gradient-text">{movie.votes.length > 0 ? (movie.votes.reduce((s, v) => s + v.rating, 0) / movie.votes.length).toFixed(1) : "—"}</span>
          <span className="text-gray-600 text-lg mb-1">/ 10</span>
          <span className="text-gray-500 mb-1">({movie.votes.length} голосів)</span>
        </div>
        {movie.votes.length > 0 && (
          <div className="space-y-2">
            {movie.votes.map((v) => (
              <div key={v.userId} className="flex items-center gap-4">
                <span className="text-gray-400 w-24 font-medium">{v.user.name}</span>
                <div className="flex gap-1 flex-1 max-w-xs">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className={`h-3 flex-1 rounded-full transition-all duration-300 ${i < v.rating ? "bg-gradient-to-r from-amber-500 to-amber-300 rating-bar" : "bg-surface-hover"}`} style={{ animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>
                <span className="text-amber-400 font-bold text-lg w-8 text-right">{v.rating}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isMember && user && (
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4">Оцінити фільм</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-surface-input border border-border rounded-xl px-4 py-3">
              <input type="range" min={1} max={10} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-32 accent-amber-400" />
              <span className="text-3xl font-black text-amber-400 w-10 text-center animate-fade-in-scale" key={rating}>{rating}</span>
            </div>
            <button onClick={handleVote} className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-8 py-3 rounded-xl font-bold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 btn-press shadow-lg shadow-amber-400/20">
              Голосувати
            </button>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-4">Коментарі ({movie.comments.length})</h2>
        <div className="space-y-3 mb-6">
          {movie.comments.length === 0 && <p className="text-gray-600">Ще немає коментарів</p>}
          {movie.comments.map((c) => (
            <div key={c.id} className="bg-surface-hover/50 rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-amber-400 text-sm">{c.user.name}</span>
                <span className="text-gray-700 text-xs">{new Date(c.createdAt).toLocaleDateString("uk-UA")}</span>
              </div>
              <p className="text-gray-300">{c.text}</p>
            </div>
          ))}
        </div>
        {user && (
          <div className="flex gap-3">
            <input type="text" placeholder="Коментар..." value={commentText} onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              className="flex-1 bg-surface-input border border-border rounded-xl px-5 py-3 focus:outline-none focus:border-amber-400 transition-colors" />
            <button onClick={handleComment} disabled={!commentText.trim()}
              className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-6 py-3 rounded-xl font-bold disabled:opacity-40 transition-all duration-300 btn-press">
              Надіслати
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
