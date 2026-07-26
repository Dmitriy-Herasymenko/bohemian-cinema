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
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/40 animate-fade-in-scale">
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
      className="glass-card rounded-2xl overflow-hidden text-left transition-all duration-400 poster-hover w-full group"
    >
      {movie.poster ? (
        <div className="relative h-72 overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/30 to-transparent" />
          {movie.avgRating > 0 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-amber-400 font-black text-lg px-3 py-1 rounded-xl">
              {movie.avgRating.toFixed(1)}
            </div>
          )}
        </div>
      ) : (
        <div className="h-72 bg-surface-hover flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700">
          🎬
        </div>
      )}
      <div className="p-5">
        <h3 className="font-bold text-lg truncate">
          {movie.title}
          {movie.year && <span className="text-gray-600 ml-2 text-sm font-normal">({movie.year})</span>}
        </h3>
        {movie.description && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">{movie.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4">
          {movie.avgRating > 0 ? (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => {
                const starVal = (i + 1) * 2;
                const filled = movie.avgRating >= starVal;
                const half = !filled && movie.avgRating >= starVal - 1;
                return (
                  <span key={i} className={`text-sm ${filled ? "text-amber-400" : half ? "text-amber-400/50" : "text-gray-700"}`}>
                    ★
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-gray-600 text-sm">Без оцінок</span>
          )}
          <span className="text-gray-600 text-xs">
            {movie.totalVotes} {movie.totalVotes === 1 ? "голос" : "голосів"}
          </span>
        </div>
      </div>
    </button>
  );
}
