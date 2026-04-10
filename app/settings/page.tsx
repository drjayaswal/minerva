"use client";
import { useStore } from "../store/useStore";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Database01Icon,
  MessageEdit01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  Cancel01Icon,
  ArrowLeft01Icon,
  UserAccountIcon,
  Key01Icon,
  Delete02Icon,
  Copy01Icon,
  UnavailableIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { getAuthHeaders } from "@/lib/utils";
import { getBaseUrl } from "../connect/page";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface APIKey {
  id: string;
  name: string;
  prefix: string;
  is_active: string;
  created_at: string;
  last_used_at: string | null;
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
          className={`h-full rounded-full transition-all duration-700 ${isHigh
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
            : `+${conversations.length - 3} more conversation${conversations.length - 3 !== 1 ? "s" : ""
            }`}
        </button>
      )}
    </div>
  );
}

export function APIKeyList({
  keys,
  onDelete,
  onBlock,
}: {
  keys: APIKey[];
  onDelete: (id: string) => void;
  onBlock: (id: string) => void;
}) {
  if (keys.length === 0) {
    return (
      <div className="py-20 text-center border border-white/5 rounded-3xl">
        <p className="text-accent text-sm font-medium tracking-wide">
          No API keys found
        </p>
      </div>
    );
  }

  return (
    <div className="w-fit border border-white/5 rounded-2xl overflow-hidde">
      <table className="w-full text-left border-collapse">
        <tbody className="divide-y divide-white/5">
          {keys.map((key) => (
            <tr
              key={key.id}
              className="group hover:bg-accent/5 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-accent">
                    {key.name}
                  </span>
                  <code className="text-[11px] text-accent/40 font-mono">
                    {key.prefix}••••••••••••••••
                  </code>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${key.is_active === "active" ? "bg-emerald-400" : "bg-accent/20"
                    }`} />
                  <span className={`text-[11px] font-bold uppercase tracking-tight ${key.is_active === "active" ? "text-emerald-400/90" : "text-accent/30"
                    }`}>
                    {key.is_active}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {key.is_active === "active" && (
                    <button
                      onClick={() => onBlock(key.id)}
                      className="p-2 text-accent hover:text-amber-500 hover:bg-amber-600/10 rounded-lg transition-all cursor-pointer"
                      title="Deactivate"
                    >
                      <HugeiconsIcon icon={UnavailableIcon} size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(key.id)}
                    className="p-2 text-accent hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                    title="Delete"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Settings() {
  const { conversations } = useStore();
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const disconnect = () => {
    toast.info("Want to Disconnect?", {
      action: {
        label: "Disconnect",
        onClick: () => {
          localStorage.removeItem("token");
          document.cookie = "is_logged_in=; path=/; max-age=0; SameSite=Lax";
          toast.success("Disconnected successfully");
          router.push("/connect");
        }
      },
    });
  };

  const [hydrated, setHydrated] = useState(false);
  const [storageKB, setStorageKB] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showConvList, setShowConvList] = useState(false);

  const STORAGE_LIMIT_KB = 512;

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/admin/verify`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        setIsAdmin(data.data);
      } catch (err) {
        console.error("Failed to verify admin status", err);
      }
    }
    checkAdmin();
    fetchApiKeys();
    setHydrated(true);
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/keys`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch API keys", err);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/keys`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedKey(data.data.key);
        setNewKeyName("");
        const newKeyEntry: APIKey = {
          id: data.data.id,
          name: data.data.name,
          prefix: data.data.prefix,
          is_active: data.data.is_active,
          created_at: data.data.created_at,
          last_used_at: null
        };
        setApiKeys(prev => [newKeyEntry, ...prev]);
        toast.success("API Key generated successfully");
      } else {
        toast.error(data.detail || "Failed to generate API key");
      }
    } catch (err) {
      toast.error("An error occurred while generating the API key");
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    toast.info("This will delete the API Key?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await fetch(`${getBaseUrl()}/api/keys/${id}`, {
              method: "DELETE",
              headers: getAuthHeaders(),
            });
            const data = await res.json();
            if (data.success) {
              setApiKeys(prev => prev.filter(k => k.id !== id));
              toast.success("API Key deleted successfully");
            }
          } catch (err) {
            toast.error("Failed to delete API key");
          }
        }
      },
    });
  };

  const handleBlockKey = async (id: string) => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/keys/${id}/block`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: "blocked" } : k));
        toast.success("API Key blocked successfully");
      }
    } catch (err) {
      toast.error("Failed to block API key");
    }
  };

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

  const totalMessages = hydrated
    ? conversations.reduce(
      (acc, conv) => acc + (conv.messages?.length || 0),
      0
    )
    : 0;

  const hasConversations = hydrated && conversations.length > 0;

  return (
    <>
      {generatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={32} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-accent">API Key Generated</h2>
                <p className="text-accent/60 text-sm mt-1">
                  Please copy this key now
                </p>
              </div>

              <div className="w-full mt-4 flex items-center gap-2 p-4">
                <code className="flex-1 text-xs font-mono text-accent break-all text-left">
                  {generatedKey}
                </code>
              </div>

              <div className="flex items-center w-full gap-2 justify-between">
                <button
                  onClick={() => setGeneratedKey(null)}
                  className="w-fit px-6 py-4 bg-rose-600 text-white font-bold rounded-4xl hover:bg-rose-700 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    toast.success("Key copied to clipboard");
                  }}
                  className="w-fit px-6 py-4 flex items-center gap-2 bg-accent text-white font-bold rounded-4xl hover:bg-accent/90 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={20} />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-accent text-white p-6 sm:p-10 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
            </button>
            <h1 className="text-4xl font-medium">Settings</h1>
          </div>

          <div className="p-1 space-y-6">

            {!hydrated ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {/* Activity Card */}
                <div
                  className={`flex items-center gap-4 p-4 bg-white rounded-2xl transition-all shadow-lg ${hasConversations
                    ? "cursor-pointer active:scale-[0.98]"
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
                      className={`w-4 h-4 text-accent shrink-0 transition-transform duration-300 ${showConvList ? "rotate-180" : ""
                        }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </div>

                {showConvList && hasConversations && (
                  <div className="px-1 animate-in slide-in-from-top-2 duration-300">
                    <ConversationList conversations={conversations as Array<{ id: string; title?: string; messages?: unknown[] }>} />
                  </div>
                )}

                <div
                  className={`flex flex-col gap-4 p-4 bg-white rounded-2xl transition-all shadow-lg overflow-hidden ${showApiKeys ? "" : "active:scale-[0.98] cursor-pointer"}`}
                  onClick={() => setShowApiKeys((prev) => !prev)}
                >
                  <div className="flex items-center gap-4">
                    <HugeiconsIcon
                      icon={Key01Icon}
                      size={32}
                      className="text-accent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-accent text-xs uppercase tracking-wider font-bold">
                        API Access
                      </h3>
                      <p className="text-sm text-accent font-medium">
                        {apiKeys.length} active key{apiKeys.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowApiKeys(p => !p);
                      }}
                      className="p-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`w-4 h-4 text-accent transition-transform duration-300 ${showApiKeys ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>

                  {showApiKeys && (
                    <div
                      className="mt-2 space-y-4 animate-in fade-in duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <form onSubmit={handleCreateKey} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Key name (e.g. My Website)"
                          className="flex-1 px-4 py-2 rounded-xl text-accent focus:outline-none text-sm"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          disabled={isCreatingKey}
                        />
                        <button
                          type="submit"
                          disabled={isCreatingKey || !newKeyName.trim()}
                          className="p-2 bg-accent text-white rounded-4xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <HugeiconsIcon icon={Add01Icon} size={20} />
                        </button>
                      </form>

                      <APIKeyList
                        keys={apiKeys}
                        onDelete={handleDeleteKey}
                        onBlock={handleBlockKey}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-lg">
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

                {/* Admin/Disconnect Buttons */}
                <div className="flex items-center justify-center font-bold w-full pt-4">
                  <div className="flex flex-row rounded-full overflow-hidden border-2 border-white w-auto shadow-xl">
                    {isAdmin &&
                      <button
                        onClick={() => router.push("/admin")}
                        className="group relative overflow-hidden cursor-pointer text-white px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center transition-all duration-500 ease-in-out hover:text-accent"
                      >
                        <div className="absolute inset-y-0 left-0 w-0 bg-white transition-all duration-500 ease-in-out group-hover:w-full" />
                        <span className="flex items-center gap-2 relative z-10 text-xs sm:text-base whitespace-nowrap">
                          <HugeiconsIcon icon={UserAccountIcon} size={18} strokeWidth={2} />
                          Admin
                        </span>
                      </button>
                    }
                    {isAdmin && <div className="w-0.5 bg-white shrink-0" />}
                    <button
                      onClick={disconnect}
                      className="group relative overflow-hidden cursor-pointer text-white px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center transition-all duration-500 ease-in-out hover:text-accent"
                    >
                      <div className="absolute inset-y-0 right-0 w-0 bg-white transition-all duration-500 ease-in-out group-hover:w-full" />
                      <span className="flex items-center gap-2 relative z-10 text-xs sm:text-base whitespace-nowrap">
                        Disconnect
                        <HugeiconsIcon icon={Logout01Icon} size={18} strokeWidth={2} />
                      </span>
                    </button>
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