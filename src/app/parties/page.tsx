"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Party {
  id: string;
  title: string;
  date: string;
  status: string;
  description: string | null;
  members: { user: { id: string; name: string; avatar: string | null } }[];
  movies: { id: string; title: string; votes: { rating: number }[] }[];
}

export default function PartiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchParties = () => {
    fetch("/api/parties").then((r) => r.json()).then(setParties);
  };

  useEffect(() => {
    fetchParties();
    fetch("/api/users").then((r) => r.json()).then(setAllUsers);
  }, []);

  const upcoming = parties.filter((p) => p.status === "upcoming");
  const past = parties.filter((p) => p.status === "past");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    setLoading(true);
    await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, description, memberIds: selectedMembers }),
    });
    setTitle(""); setDate(""); setDescription(""); setSelectedMembers([]);
    setShowForm(false);
    setLoading(false);
    fetchParties();
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const PartyCard = ({ party }: { party: Party }) => {
    const avgRating = party.movies.length > 0
      ? party.movies.reduce((sum, m) => {
          const avg = m.votes.length > 0 ? m.votes.reduce((s, v) => s + v.rating, 0) / m.votes.length : 0;
          return sum + avg;
        }, 0) / party.movies.length
      : 0;

    return (
      <Link href={`/parties/${party.id}`}
        className="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 poster-hover block">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">{party.title}</h3>
            <p className="text-gray-500 text-sm">
              {new Date(party.date).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            party.status === "upcoming" ? "bg-green-400/10 text-green-400" : "bg-gray-500/10 text-gray-500"
          }`}>
            {party.status === "upcoming" ? "Заплановано" : "Завершено"}
          </span>
        </div>
        {party.description && <p className="text-gray-400 text-sm mb-4">{party.description}</p>}
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {party.members.slice(0, 5).map((m) => (
              <div key={m.user.id} className="w-8 h-8 rounded-full bg-amber-400/20 border-2 border-surface flex items-center justify-center text-amber-400 text-xs font-bold">
                {m.user.avatar ? <img src={m.user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : m.user.name[0]}
              </div>
            ))}
            {party.members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-surface flex items-center justify-center text-gray-400 text-xs">
                +{party.members.length - 5}
              </div>
            )}
          </div>
          <span className="text-gray-500 text-sm">
            {party.movies.length} {party.movies.length === 1 ? "фільм" : "фільмів"}
          </span>
          {avgRating > 0 && (
            <span className="text-amber-400 font-bold">{avgRating.toFixed(1)} ★</span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <span className="text-amber-400">🍻</span> П'янки
        </h1>
        {user && (
          <button onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-5 py-2.5 rounded-xl font-bold hover:from-amber-400 hover:to-amber-300 transition-all duration-300 btn-press shadow-lg shadow-amber-400/20">
            {showForm ? "✕ Скасувати" : "+ Нова п'янка"}
          </button>
        )}
      </div>

      {showForm && user && (
        <form onSubmit={handleCreate} className="glass-card rounded-2xl p-8 space-y-5 animate-fade-in-scale">
          <input type="text" placeholder="Назва п'янки *" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors" required />
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors text-gray-300" required />
          <textarea placeholder="Опис (опціонально)" value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-input border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 transition-colors h-20 resize-none" />
          <div>
            <p className="text-gray-400 text-sm mb-2">Додати учасників:</p>
            <div className="flex flex-wrap gap-2">
              {allUsers.filter((u) => u.id !== user?.userId).map((u) => (
                <button key={u.id} type="button" onClick={() => toggleMember(u.id)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all btn-press ${
                    selectedMembers.includes(u.id)
                      ? "bg-amber-400 text-gray-900"
                      : "bg-surface-hover border border-border text-gray-400 hover:border-amber-400/30"
                  }`}>
                  {u.name}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading || !title || !date}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 py-3 rounded-xl font-bold text-lg disabled:opacity-40 transition-all duration-300 btn-press">
            {loading ? "Створюю..." : "Створити п'янку"}
          </button>
        </form>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span> Заплановані
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {upcoming.map((p) => <PartyCard key={p.id} party={p} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span> Архів
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {past.map((p) => <PartyCard key={p.id} party={p} />)}
          </div>
        </section>
      )}

      {parties.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-float">🍻</div>
          <p className="text-gray-600 text-lg">Ще немає п'янок. Створіть першу!</p>
        </div>
      )}
    </div>
  );
}
