"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

interface Message {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setText("");
        textareaRef.current?.focus();
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="glass-card rounded-2xl flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <h1 className="text-lg font-bold gradient-text flex items-center gap-2">
            <span>💬</span> Чат компанії
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          )}
          {!loading && messages.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <span className="text-4xl block mb-3">💬</span>
              Поки немає повідомлень. Напиши першим!
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.user.id === user.userId;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                <Link href={`/profile/${msg.user.id}`} className="shrink-0 mt-1 hover:opacity-80 transition-opacity">
                  {msg.user.avatar ? (
                    <img src={msg.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-sm font-bold">
                      {msg.user.name[0]}
                    </div>
                  )}
                </Link>
                <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`flex items-baseline gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-semibold text-amber-400">{msg.user.name}</span>
                    <span className="text-xs text-gray-700">{formatTime(msg.createdAt)}</span>
                  </div>
                  <div className={`rounded-2xl px-4 py-2 text-sm ${
                    isMe
                      ? "bg-amber-400/20 text-gray-200 rounded-tr-sm"
                      : "bg-surface-hover border border-border text-gray-300 rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              placeholder="Написати повідомлення..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              className="flex-1 bg-surface-input border border-border rounded-xl px-5 py-3 focus:outline-none focus:border-amber-400 transition-colors resize-none max-h-32"
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="bg-gradient-to-r from-amber-500 to-amber-400 text-gray-900 px-5 py-3 rounded-xl font-bold disabled:opacity-40 transition-all duration-300 btn-press shrink-0"
            >
              {sending ? "..." : "→"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
