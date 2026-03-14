"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  InformationCircleIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

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

const typeConfig = {
  success: {
    icon: CheckmarkCircle01Icon,
    iconColor: "text-emerald-500",
    glow: "shadow-emerald-100",
  },
  error: {
    icon: AlertCircleIcon,
    iconColor: "text-rose-500",
    glow: "shadow-rose-100",
  },
  info: {
    icon: InformationCircleIcon,
    iconColor: "text-accent",
    glow: "shadow-violet-100",
  },
};

function ToastItem({
  toast,
  index,
  onRemove,
}: {
  toast: Toast;
  index: number;
  onRemove: (id: string) => void;
}) {
  const config = typeConfig[toast.type];
  const isStacked = index > 0;

  const progress = useMotionValue(0);
  const barColor = useTransform(
    progress,
    [0, 0.5, 1],
    ["#34d399", "#facc15", "#f43f5e"],
  );
  const barWidth = useTransform(progress, (v) => `${v * 100}%`);

  useEffect(() => {
    const controls = animate(progress, 1, { duration: 5, ease: "linear" });
    return controls.stop;
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{
        opacity: isStacked ? 1 - index * 0.25 : 1,
        y: 0,
        scale: isStacked ? 1 - index * 0.03 : 1,
      }}
      exit={{
        opacity: 0,
        x: 60,
        scale: 0.92,
        transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
      }}
      transition={{
        duration: 0.32,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.015, y: -2 }}
      className="pointer-events-auto w-85 sm:w-95"
      style={{ zIndex: 200 - index }}
    >
      <div
        className={`relative flex items-start gap-3 rounded-3xl bg-white border-2 border-gray-200/30 ${config.glow} px-4 py-3 overflow-hidden`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-0.75`} />

        <div className={`shrink-0 mt-0.5 ${config.iconColor}`}>
          <HugeiconsIcon icon={config.icon} size={20} strokeWidth={2} />
        </div>

        <div className="flex-1 mb-2 min-w-0">
          <p className="text-[13px] font-semibold text-black leading-snug tracking-tight line-clamp-2">
            {toast.message}
          </p>
          {toast.actionLabel && (
            <button
              onClick={() => {
                toast.onAction?.();
                onRemove(toast.id);
              }}
              className="mt-2 text-[11px] font-bold px-3 py-1 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-200 cursor-pointer active:scale-95"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>

        <button
          onClick={() => onRemove(toast.id)}
          className="shrink-0 p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-500/20 transition-all duration-150 cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2.5} />
        </button>

        <motion.div
          className="absolute bottom-1 left-0 rounded-r-4xl h-1"
          style={{ width: barWidth, backgroundColor: barColor }}
        />
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [{ ...toast, id }, ...prev]);
    setTimeout(() => remove(id), 5000);
  };

  const remove = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-200 flex flex-col items-end pointer-events-none gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.slice(0, 4).map((toast, index) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              index={index}
              onRemove={remove}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}