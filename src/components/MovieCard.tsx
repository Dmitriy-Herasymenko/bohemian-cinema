"use client";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  poster: string | null;
  avgRating: number;
  totalVotes: number;
  description: string | null;
}

export function YouTubeEmbed({ url }: { url: string }) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
  if (!match) return null;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${match[1]}`}
        title="YouTube trailer"
        className="absolute inset-0 w-full h-full"
        allowFullScreen
      />
    </div>
  );
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
      className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden text-left hover:border-amber-400/50 transition-colors w-full"
    >
      {movie.poster ? (
        <div className="relative h-64 overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-64 bg-gray-800 flex items-center justify-center text-4xl">
          🎬
        </div>
      )}
      <div className="p-5">
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
      </div>
    </button>
  );
}
