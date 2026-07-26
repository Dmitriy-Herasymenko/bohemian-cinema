"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Creator { id: string; name: string; avatar: string | null }
interface Party { id: string; title: string; date: string; }
interface Vote { rating: number; user: { id: string; name: string } }
interface Comment { id: string; text: string; user: { id: string; name: string; avatar: string | null }; createdAt: string }
interface Member { user: { id: string; name: string; avatar: string | null } }

interface Movie {
  id: string; title: string; slug: string | null; year: number | null; poster: string | null;
  trailerUrl: string | null; description: string | null;
  avgRating: number; totalVotes: number;
  votes: Vote[]; comments: Comment[];
  party: Party | null;
  partyMembers: Member[];
  createdBy: Creator | null;
}

export default function MoviesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch("/api/parties").then((r) => r.json()).then((parties: { id: string; title: string; date: string; status: string; members: Member[]; movies: (Omit<Movie, "party" | "partyMembers" | "avgRating" | "totalVotes"> & { votes: Vote[]; comments: Comment[]; createdBy: Creator | null })[] }[]) => {
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
            createdBy: m.createdBy || null,
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
            const href = movie.slug ? `/movies/${movie.slug}` : "#";
            return (
            <div key={movie.id} onClick={() => router.push(href)}
              className={`glass-card rounded-2xl overflow-hidden text-left transition-all duration-300 poster-hover w-full flex group cursor-pointer ${partyPast ? "ring-1 ring-amber-400/20 bg-amber-400/[0.02]" : ""}`}>
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

                {movie.createdBy && (
                  <Link href={`/profile/${movie.createdBy.id}`} onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-gray-500 text-xs hover:text-amber-400 transition-colors mt-1">
                    {movie.createdBy.avatar ? (
                      <img src={movie.createdBy.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-[8px] font-bold">{movie.createdBy.name[0]}</div>
                    )}
                    <span>{movie.createdBy.name}</span>
                  </Link>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  {movie.party && (
                    <span className="text-gray-400">
                      {new Date(movie.party.date).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}
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
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
