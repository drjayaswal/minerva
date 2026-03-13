"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { 
  CheckmarkCircle01Icon, 
  AlertCircleIcon, 
  InformationCircleIcon, 
  Cancel01Icon 
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const remove = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success": return CheckmarkCircle01Icon;
      case "error": return AlertCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  const getColorClass = (type: ToastType) => {
    switch (type) {
      case "success": return "text-green-600";
      case "error": return "text-red-600";
      default: return "text-accent";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-0 sm:bottom-6 left-0 right-0 sm:left-auto sm:right-6 flex flex-col gap-3 z-100 p-2 sm:p-0 w-full sm:w-[380px] pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-4 rounded-2xl bg-white/95 backdrop-blur-md text-accent border border-border shadow-2xl p-4 sm:p-5
            animate-in slide-in-from-bottom sm:slide-in-from-right fade-in duration-300"
          >
            <div className={`mt-0.5 shrink-0 ${getColorClass(toast.type)}`}>
              <HugeiconsIcon icon={getIcon(toast.type)} size={22} strokeWidth={2} />
            </div>
            <div className="flex flex-col flex-1 gap-3 overflow-hidden">
              <p className="text-sm font-semibold leading-relaxed wrap-break-word text-slate-800">
                {toast.message}
              </p>

              {toast.actionLabel && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    remove(toast.id);
                  }}
                  className="self-start text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer
                  bg-accent text-white hover:opacity-90 transition-all active:scale-95 shadow-sm"
                >
                  {toast.actionLabel}
                </button>
              )}
            </div>
            <button
              onClick={() => remove(toast.id)}
              className="shrink-0 p-1 -mt-1 -mr-1 opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-slate-500"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}