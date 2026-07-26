"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

interface ProfileData {
  id: string; name: string; email: string; avatar: string | null; createdAt: string;
  votes: { rating: number; movie: { id: string; title: string; year: number | null; poster: string | null; party: { id: string; title: string } | null } }[];
  parties: { party: { id: string; title: string; date: string; status: string } }[];
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, refresh } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const fetchProfile = () => {
    fetch(`/api/users/${id}`).then((r) => r.json()).then(setProfile);
  };

  useEffect(() => { fetchProfile(); }, [id]);

  if (!profile) return <div className="text-center py-20 text-gray-500 animate-pulse">Завантаження...</div>;

  const isOwn = currentUser?.userId === profile.id;
  const partiesCount = profile.parties.length;
  const avgRating = profile.votes.length > 0
    ? (profile.votes.reduce((s, v) => s + v.rating, 0) / profile.votes.length).toFixed(1)
    : "—";

  const handleSave = async () => {
    await fetch(`/api/users/${profile.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatar: avatar || null }),
    });
    setEditing(false);
    fetchProfile();
    refresh();
  };

  const startEdit = () => {
    setName(profile.name);
    setAvatar(profile.avatar || "");
    setEditing(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Файл занадто великий. Максимум 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center gap-6">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name}
              className="w-24 h-24 rounded-2xl object-cover shadow-lg shadow-amber-400/10" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-amber-400/10 flex items-center justify-center text-4xl font-black text-amber-400">
              {profile.name[0]}
            </div>
          )}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="bg-surface-input border border-border rounded-xl px-4 py-2 focus:outline-none focus:border-amber-400 transition-colors" />
                <div>
                  <label className="block cursor-pointer">
                    <div className="bg-surface-input border border-dashed border-border rounded-xl px-4 py-4 text-center hover:border-amber-400/50 transition-colors">
                      {avatar ? (
                        <img src={avatar} alt="" className="h-20 mx-auto rounded-lg object-cover mb-2" />
                      ) : (
                        <div className="text-gray-500 text-sm">📷 Натисни щоб завантажити фото</div>
                      )}
                      <div className="text-gray-600 text-xs mt-1">JPG, PNG до 2MB</div>
                    </div>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                  {avatar && (
                    <button type="button" onClick={() => setAvatar("")}
                      className="text-red-400/60 hover:text-red-400 text-xs mt-1 transition-colors">Видалити фото</button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave}
                    className="bg-amber-400 text-gray-900 px-4 py-1.5 rounded-lg text-sm font-bold btn-press">Зберегти</button>
                  <button onClick={() => setEditing(false)}
                    className="bg-surface-hover text-gray-400 px-4 py-1.5 rounded-lg text-sm btn-press">Скасувати</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black">{profile.name}</h1>
                <p className="text-gray-500">{profile.email}</p>
                {isOwn && (
                  <button onClick={startEdit}
                    className="text-amber-400 text-sm hover:text-amber-300 transition-colors mt-2">
                    ✏️ Редагувати профіль
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-3xl font-black text-amber-400">{partiesCount}</div>
          <div className="text-gray-500 text-sm mt-1">{partiesCount === 1 ? "п'янка" : "п'янок"}</div>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-3xl font-black text-amber-400">{profile.votes.length}</div>
          <div className="text-gray-500 text-sm mt-1">голосів</div>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-3xl font-black text-amber-400">{avgRating}</div>
          <div className="text-gray-500 text-sm mt-1">середня оцінка</div>
        </div>
      </div>

      {/* Parties */}
      {profile.parties.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">П&apos;янки</h2>
          <div className="space-y-2 stagger-children">
            {profile.parties.map((p) => (
              <Link key={p.party.id} href={`/parties/${p.party.id}`}
                className="flex items-center justify-between bg-surface-hover/50 rounded-xl px-4 py-3 border border-border/50 hover:border-amber-400/20 transition-colors">
                <div>
                  <span className="font-medium">{p.party.title}</span>
                  <span className="text-gray-600 text-sm ml-2">
                    {new Date(p.party.date).toLocaleDateString("uk-UA")}
                  </span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  p.party.status === "upcoming" ? "bg-green-400/10 text-green-400" : "bg-gray-500/10 text-gray-500"
                }`}>
                  {p.party.status === "upcoming" ? "Майбутня" : "Минула"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Votes */}
      {profile.votes.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Оцінені фільми</h2>
          <div className="space-y-2 stagger-children">
            {profile.votes.map((v) => (
              <div key={v.movie.id}
                className="flex items-center justify-between bg-surface-hover/50 rounded-xl px-4 py-3 border border-border/50">
                <div className="flex items-center gap-3">
                  {v.movie.poster ? (
                    <img src={v.movie.poster} alt="" className="w-10 h-14 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-surface-hover flex items-center justify-center text-sm">🎬</div>
                  )}
                  <div>
                    <span className="font-medium">{v.movie.title}</span>
                    {v.movie.year && <span className="text-gray-600 text-sm ml-1">({v.movie.year})</span>}
                    {v.movie.party && (
                      <div className="text-gray-600 text-xs mt-0.5">🍻 {v.movie.party.title}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < v.rating ? "bg-amber-400" : "bg-gray-800"}`} />
                    ))}
                  </div>
                  <span className="text-amber-400 font-bold w-6 text-right">{v.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
