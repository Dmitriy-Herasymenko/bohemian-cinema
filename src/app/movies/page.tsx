"use client";

import { useEffect, useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import { MovieDetail } from "@/components/MovieDetail";
import { AddMovieForm } from "@/components/AddMovieForm";

interface Movie {
  id: string;
  title: string;
  year: number | null;
  poster: string | null;
  description: string | null;
  status: string;
  avgRating: number;
  totalVotes: number;
  votes: { userId: string; rating: number; user: { name: string } }[];
  comments: { id: string; text: string; user: { name: string }; createdAt: string }[];
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchMovies = () => {
    fetch("/api/movies")
      .then((r) => r.json())
      .then(setMovies);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const watchedMovies = movies.filter((m) => m.status === "watched");
  const selectedMovie = movies.find((m) => m.id === selectedId);

  if (selectedMovie) {
    return (
      <MovieDetail
        movie={selectedMovie}
        onBack={() => setSelectedId(null)}
        onUpdate={fetchMovies}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Переглянуті фільми</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-400 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-amber-300 transition-colors"
        >
          {showForm ? "Скасувати" : "+ Додати фільм"}
        </button>
      </div>

      {showForm && (
        <AddMovieForm
          onAdd={() => {
            fetchMovies();
            setShowForm(false);
          }}
        />
      )}

      {watchedMovies.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          Ще немає переглянутих фільмів. Додайте перший!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => setSelectedId(movie.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
