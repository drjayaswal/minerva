"use client";
import { useStore } from "../store/useStore";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Database01Icon,
  MessageEdit01Icon,
  Loading03Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { useState, useEffect, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const iconMap = {
    success: CheckmarkCircle01Icon,
    error: AlertCircleIcon,
    info: InformationCircleIcon,
  };

  const colorMap = {
    success: "text-emerald-400",
    error: "text-rose-400",
    info: "text-blue-400",
  };

  const bgMap = {
    success: "bg-emerald-500/10 border-emerald-500/20",
    error: "bg-rose-500/10 border-rose-500/20",
    info: "bg-blue-500/10 border-blue-500/20",
  };

  const Icon = iconMap[toast.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-lg ${bgMap[toast.type]} animate-in slide-in-from-bottom-2 duration-300`}
    >
      <HugeiconsIcon icon={Icon} size={18} className={colorMap[toast.type]} />
      <span className="text-white text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/40 hover:text-white/80 transition-colors cursor-pointer"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={14} />
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl animate-pulse">
      <div className="w-8 h-8 rounded-xl bg-white/10 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-2.5 w-16 bg-white/10 rounded-full" />
        <div className="h-4 w-36 bg-white/10 rounded-full" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-5 gap-3 text-center">
      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
        <HugeiconsIcon icon={MessageEdit01Icon} size={28} className="text-white" />
      </div>
      <p className="text-white text-lg font-bold">No conversations yet</p>
    </div>
  );
}

function StorageBar({ usedKB, totalKB }: { usedKB: number; totalKB: number }) {
  const percent = Math.min((usedKB / totalKB) * 100, 100);
  const isHigh = percent > 90;
  const isMed = percent > 75;

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-[10px] text-accent/60 mb-1 font-medium">
        <span>{usedKB.toFixed(1)} KB used</span>
        <span>{totalKB} KB limit</span>
      </div>
      <div className="w-full h-1.5 bg-accent/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isHigh
              ? "bg-rose-500"
              : isMed
              ? "bg-amber-400"
              : "bg-emerald-400"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ConversationList({
  conversations,
}: {
  conversations: Array<{ id: string; title?: string; messages?: unknown[] }>;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? conversations : conversations.slice(0, 3);

  if (conversations.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-2">
      {visible.map((conv) => (
        <div
          key={conv.id}
          className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-2xl"
        >
          <div className="w-2 h-2 rounded-full bg-white shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">
              {conv.title || "Untitled Conversation"}
            </p>
            <p className="text-white/80 text-xs">
              {conv.messages?.length || 0} message
              {(conv.messages?.length || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      ))}
      {conversations.length > 3 && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-xs text-white/40 hover:text-white/70 transition-colors py-1 text-center cursor-pointer"
        >
          {expanded
            ? "Show less"
            : `+${conversations.length - 3} more conversation${
                conversations.length - 3 !== 1 ? "s" : ""
              }`}
        </button>
      )}
    </div>
  );
}

export default function Settings() {
  const { conversations } = useStore();

  const [hydrated, setHydrated] = useState(false);
  const [storageKB, setStorageKB] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showConvList, setShowConvList] = useState(false);

  const STORAGE_LIMIT_KB = 2048;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const raw = localStorage.getItem("lithium-storage") || "";
      const bytes = new Blob([raw]).size;
      setStorageKB(bytes / 1024);
    } catch {
      setStorageKB(0);
    }
  }, [hydrated, conversations]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const totalMessages = hydrated
    ? conversations.reduce(
        (acc, conv) => acc + (conv.messages?.length || 0),
        0
      )
    : 0;

  const hasConversations = hydrated && conversations.length > 0;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-[calc(100vw-48px)] max-w-xs pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>

      <div className="min-h-screen bg-accent text-white p-6 sm:p-10 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <h1 className="text-4xl font-medium mb-8">Settings</h1>

          <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-6 space-y-6">

            {!hydrated ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <div className="w-full h-14 bg-white/5 rounded-2xl animate-pulse" />
              </>
            ) : (
              <>
                <div
                  className={`flex items-center gap-4 p-4 bg-white rounded-2xl transition-all ${
                    hasConversations
                      ? "cursor-pointer hover:bg-white/90 active:scale-[0.98]"
                      : ""
                  }`}
                  onClick={() =>
                    hasConversations && setShowConvList((p) => !p)
                  }
                  role={hasConversations ? "button" : undefined}
                  aria-expanded={hasConversations ? showConvList : undefined}
                >
                  <HugeiconsIcon
                    icon={MessageEdit01Icon}
                    size={32}
                    className="text-accent shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-accent text-xs uppercase tracking-wider font-bold">
                      Activity
                    </h3>
                    {conversations.length === 0 ? (
                      <p className="text-base text-accent font-medium leading-tight opacity-50">
                        No activity yet
                      </p>
                    ) : (
                      <p className="text-lg text-accent font-medium leading-tight truncate">
                        {conversations.length} Conversation
                        {conversations.length !== 1 ? "s" : ""} •{" "}
                        {totalMessages} Message
                        {totalMessages !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  {hasConversations && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`w-4 h-4 text-accent/40 shrink-0 transition-transform duration-300 ${
                        showConvList ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </div>

                {showConvList && hasConversations && (
                  <div className="px-1">
                    <ConversationList conversations={conversations as Array<{ id: string; title?: string; messages?: unknown[] }>} />
                  </div>
                )}

                {conversations.length === 0 && (
                  <div className="px-1">
                    <EmptyState />
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl">
                  <HugeiconsIcon
                    icon={Database01Icon}
                    size={32}
                    className="text-accent shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-accent text-xs uppercase tracking-wider font-bold">
                      Storage State
                    </h3>
                    <p className="text-sm text-accent">
                      Local persistent storage is active
                    </p>
                    <StorageBar usedKB={storageKB} totalKB={STORAGE_LIMIT_KB} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}