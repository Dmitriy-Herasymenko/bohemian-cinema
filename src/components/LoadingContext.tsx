"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const isLoading = count > 0;

  const startLoading = useCallback(() => setCount((c) => c + 1), []);
  const stopLoading = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  useEffect(() => {
    const origFetch = window.fetch;
    const pending = new Set<string>();

    window.fetch = async function (...args: Parameters<typeof origFetch>) {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
      if (url.startsWith("/api/")) {
        const id = url + String(Date.now());
        pending.add(id);
        startLoading();
        try {
          const res = await origFetch.apply(this, args);
          return res;
        } finally {
          pending.delete(id);
          stopLoading();
        }
      }
      return origFetch.apply(this, args);
    };

    return () => { window.fetch = origFetch; };
  }, [startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1">
          <div className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 animate-loading-bar" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}
