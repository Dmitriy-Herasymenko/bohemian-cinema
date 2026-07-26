"use client";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  avgRating: number;
  totalVotes: number;
  description: string | null;
}

export function MovieCard({
  movie,
  onClick,
}: {
  movie: Movie;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left hover:border-amber-400/50 transition-colors w-full"
    >
      <h3 className="font-semibold text-lg">
        {movie.title}
        {movie.year && <span className="text-gray-500 ml-2">({movie.year})</span>}
      </h3>
      {movie.description && (
        <p className="text-gray-400 text-sm mt-2 line-clamp-2">{movie.description}</p>
      )}
      <div className="flex items-center gap-4 mt-3">
        {movie.avgRating > 0 ? (
          <span className="text-amber-400 font-bold text-xl">
            {movie.avgRating.toFixed(1)}
          </span>
        ) : (
          <span className="text-gray-600 text-sm">Без оцінок</span>
        )}
        <span className="text-gray-500 text-sm">
          {movie.totalVotes} {movie.totalVotes === 1 ? "голос" : "голосів"}
        </span>
      </div>
    </button>
  );
}
