"use client";

import { useState, useEffect, useRef } from "react";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  description: string | null;
  poster: string | null;
  party: { id: string; title: string } | null;
}

export default function RoulettePage() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [history, setHistory] = useState<Movie[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/parties").then((r) => r.json()).then((parties: { status: string; title: string; movies: Movie[] }[]) => {
      const upcoming = parties.find((p) => p.status === "upcoming");
      if (upcoming) {
        setAllMovies(upcoming.movies.map((m) => ({ ...m, party: { id: "upcoming", title: upcoming.title } })));
      }
    });
  }, []);

  const spin = () => {
    if (allMovies.length === 0 || spinning) return;
    setSelected(null);
    setShowConfetti(false);
    setSpinning(true);
    let count = 0;
    const totalCycles = 25 + Math.floor(Math.random() * 10);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allMovies.length);
      count++;
      if (count >= totalCycles) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const finalIndex = Math.floor(Math.random() * allMovies.length);
        setCurrentIndex(finalIndex);
        setSelected(allMovies[finalIndex]);
        setSpinning(false);
        setShowConfetti(true);
        setHistory((prev) => [allMovies[finalIndex], ...prev].slice(0, 5));
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 60 + count * 4);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const confettiColors = ["#fbbf24", "#f59e0b", "#d97706", "#ef4444", "#22c55e", "#3b82f6", "#a855f7"];

  return (
    <div className="space-y-10 animate-fade-in">
      <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
        <span className="text-amber-400">🎲</span> Рулетка вибору
      </h1>

      {allMovies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-float">🎰</div>
          <p className="text-gray-600 text-lg">Немає фільмів для вибору. Додайте фільми до наступної п&apos;янки!</p>
        </div>
      ) : (
        <>
          <div className="glass-card rounded-3xl p-10 text-center animate-slide-up relative overflow-hidden">
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 30 }, (_, i) => (
                  <div key={i} className="confetti-piece" style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: confettiColors[i % confettiColors.length],
                    animationDuration: `${2 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                    width: `${6 + Math.random() * 8}px`,
                    height: `${6 + Math.random() * 8}px`,
                  }} />
                ))}
              </div>
            )}

            <div className="min-h-[220px] flex items-center justify-center">
              {spinning ? (
                <div className="space-y-6">
                  <div className="text-6xl animate-spin-smooth">
                    {allMovies[currentIndex]?.poster ? (
                      <img src={allMovies[currentIndex].poster} alt=""
                        className="w-32 h-44 rounded-xl object-cover mx-auto shadow-2xl shadow-black/40" />
                    ) : (
                      <div className="w-32 h-44 rounded-xl bg-surface-hover flex items-center justify-center text-5xl mx-auto">🎬</div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-amber-400 animate-pulse">{allMovies[currentIndex]?.title}</div>
                </div>
              ) : selected ? (
                <div className="space-y-6 animate-fade-in-scale">
                  {selected.poster ? (
                    <img src={selected.poster} alt={selected.title}
                      className="w-48 h-64 rounded-2xl object-cover mx-auto shadow-2xl shadow-amber-400/20 poster-hover" />
                  ) : (
                    <div className="w-48 h-64 rounded-2xl bg-surface-hover flex items-center justify-center text-6xl mx-auto animate-float">🎬</div>
                  )}
                  <div>
                    <div className="text-3xl font-black gradient-text">{selected.title}</div>
                    {selected.year && <div className="text-lg text-gray-500 mt-1">({selected.year})</div>}
                    {selected.description && <p className="text-gray-400 mt-3 max-w-md mx-auto leading-relaxed">{selected.description}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-7xl animate-float">🎰</div>
                  <p className="text-gray-600">Натисни щоб обрати фільм</p>
                </div>
              )}
            </div>

            <button onClick={spin} disabled={spinning}
              className={`mt-8 px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 btn-press ${
                spinning ? "bg-surface-hover text-gray-500 cursor-wait"
                  : "bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 hover:from-amber-400 hover:to-amber-300 shadow-xl shadow-amber-400/20"
              }`}>
              {spinning ? (
                <span className="inline-flex items-center gap-3">
                  <span className="w-5 h-5 border-2 border-gray-500/30 border-t-gray-500 rounded-full animate-spin" />
                  Крутиться...
                </span>
              ) : "Крутити рулетку!"}
            </button>

            {selected && !spinning && (
              <div className="mt-8 flex justify-center gap-3 animate-slide-up">
                <button onClick={spin}
                  className="bg-surface-hover border border-border text-gray-300 px-6 py-3 rounded-xl font-bold hover:border-amber-400/30 transition-all duration-300 btn-press">
                  🔄 Ще раз
                </button>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="glass-card rounded-2xl p-6 animate-slide-up">
              <h2 className="text-lg font-bold mb-4 text-gray-400 flex items-center gap-2">
                <span>🕐</span> Історія рулетки
              </h2>
              <div className="space-y-2 stagger-children">
                {history.map((m, i) => (
                  <div key={`${m.id}-${i}`} className="flex items-center gap-4 bg-surface-hover/50 rounded-xl px-4 py-3 border border-border/50">
                    <span className="text-gray-700 font-bold w-6">{i + 1}</span>
                    {m.poster && <img src={m.poster} alt="" className="w-8 h-11 rounded-lg object-cover" />}
                    <span className="text-gray-300 font-medium">{m.title}{m.year && <span className="text-gray-600 ml-1 text-sm">({m.year})</span>}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
