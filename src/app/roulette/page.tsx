"use client";

import { useState, useEffect, useRef } from "react";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  description: string | null;
}

export default function RoulettePage() {
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/movies")
      .then((r) => r.json())
      .then((movies: (Movie & { status: string })[]) => {
        setUpcoming(movies.filter((m) => m.status === "upcoming"));
      });
  }, []);

  const spin = () => {
    if (upcoming.length === 0 || spinning) return;

    setSelected(null);
    setSpinning(true);
    let count = 0;
    const totalCycles = 20 + Math.floor(Math.random() * 10);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % upcoming.length);
      count++;

      if (count >= totalCycles) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const finalIndex = Math.floor(Math.random() * upcoming.length);
        setCurrentIndex(finalIndex);
        setSelected(upcoming[finalIndex]);
        setSpinning(false);
        setHistory((prev) => [upcoming[finalIndex], ...prev].slice(0, 5));
      }
    }, 80 + count * 5);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const removeFromList = async (id: string) => {
    await fetch(`/api/movies/${id}`, { method: "DELETE" });
    setUpcoming((prev) => prev.filter((m) => m.id !== id));
    setSelected(null);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">🎲 Рулетка вибору</h1>

      {upcoming.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          Немає фільмів для вибору. Додайте фільми у список &quot;Дивитись далі&quot;!
        </div>
      ) : (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <div className="mb-8">
              <div
                className={`inline-block transition-all duration-100 ${
                  spinning
                    ? "scale-110 text-amber-400"
                    : selected
                      ? "scale-100"
                      : "text-gray-500"
                }`}
              >
                {spinning ? (
                  <div className="text-4xl font-bold animate-pulse">
                    {upcoming[currentIndex]?.title}
                  </div>
                ) : selected ? (
                  <div>
                    <div className="text-4xl font-bold text-amber-400 mb-2">
                      {selected.title}
                    </div>
                    {selected.year && (
                      <div className="text-xl text-gray-400">({selected.year})</div>
                    )}
                    {selected.description && (
                      <p className="text-gray-400 mt-4 max-w-md mx-auto">
                        {selected.description}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-4xl">🎬</div>
                )}
              </div>
            </div>

            <button
              onClick={spin}
              disabled={spinning}
              className="bg-amber-400 text-gray-900 px-8 py-3 rounded-xl text-lg font-bold hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {spinning ? "Крутиться..." : "Крутити рулетку!"}
            </button>

            {selected && !spinning && (
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => removeFromList(selected.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
                >
                  ✅ Подивились!
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Ще раз
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-3 text-gray-400">
              Усього у списку: {upcoming.length}
            </h2>
            <div className="flex flex-wrap gap-2">
              {upcoming.map((m) => (
                <span
                  key={m.id}
                  className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                >
                  {m.title}
                </span>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-3 text-gray-400">Історія рулетки</h2>
              <div className="space-y-2">
                {history.map((m, i) => (
                  <div key={`${m.id}-${i}`} className="flex items-center gap-3">
                    <span className="text-gray-600 w-6">{i + 1}.</span>
                    <span className="text-gray-300">
                      {m.title}
                      {m.year && (
                        <span className="text-gray-500 ml-1">({m.year})</span>
                      )}
                    </span>
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
