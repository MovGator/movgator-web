"use client";
import { createContext, useCallback, useContext, useState } from "react";

interface Toast {
  id: number;
  message: string;
}
const Ctx = createContext<{ push: (m: string) => void }>({ push: () => {} });

let seq = 1;
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string) => {
    const id = seq++;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 md:bottom-8">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="mr-card px-4 py-2 text-sm shadow-lg">
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
