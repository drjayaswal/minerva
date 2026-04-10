"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserIcon,
    MessageIcon,
    BubbleChatIcon,
    RefreshIcon,
    SearchIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Clock02Icon,
    Cancel01Icon,
    Key01Icon,
    Chat01FreeIcons,
    DashboardCircleFreeIcons,
    Message01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { getBaseUrl } from "../connect/page";
import { getAuthHeaders } from "@/lib/utils";
import FlowerLoader from "@/components/Flower";

const MinervaLogo = ({ size = 32, color = "#685AFF" }: { size?: number; color?: string }) => (
    <svg viewBox="0 0 500 500" width={size} height={size} style={{ flexShrink: 0 }}>
        <defs>
            <ellipse id={`ap-${size}`} cx="340" cy="250" rx="90" ry="28" fill="none" stroke={color} strokeWidth="8" />
        </defs>
        <g>{[...Array(16)].map((_, i) => <use key={i} href={`#ap-${size}`} transform={`rotate(${i * 22.5} 250 250)`} />)}</g>
    </svg>
);

function StatCard({ label, value, icon, delay }: { label: string; value: number; icon: any; delay: number }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(ease * value));
            if (p < 1) requestAnimationFrame(tick);
        };
        const t = setTimeout(() => requestAnimationFrame(tick), delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white px-2 py-1 flex items-center gap-2 overflow-hidden justify-center"
        >
            <div className="w-8 h-8 rounded-4xl bg-gray-100 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={icon} size={15} strokeWidth={2} className="text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
                <p className="text-md font-semibold text-gray-900 tabular-nums">
                    {display.toLocaleString()}
                </p>
                <p className="hidden lg:inline text-xs text-gray-400 font-bold uppercase">
                    {label.split(" ")[0]}
                </p>
                <p className="lg:hidden md:inline inline text-[10px] text-gray-400 font-bold uppercase">
                    {label.split(" ")[1]}
                </p>
            </div>
        </motion.div>
    );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "accent" | "muted" | "success" | "warning" }) {
    const cls = {
        default: "bg-gray-100 text-gray-600",
        accent: "bg-accent text-white",
        muted: "bg-gray-100 text-gray-400",
        success: "bg-emerald-500 text-white",
        warning: "bg-black/40 text-white",
    }[variant];
    return <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider ${cls}`}>{children}</span>;
}

function Avatar({ email }: { email: string }) {
    const initials = email.slice(0, 2).toUpperCase();
    const hue = email.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
    return (
        <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: `hsl(${hue} 60% 55%)` }}
        >
            {initials}
        </div>
    );
}

function formatDate(dt: string | Date) {
    if (!dt) return "—";
    const d = new Date(dt);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between px-1 pt-3 border-t border-gray-50">
            <span className="text-xs text-gray-400">{total} total</span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onChange(page - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && (arr[idx - 1] as number) < p - 1) acc.push("…");
                        acc.push(p);
                        return acc;
                    }, [])
                    .map((p, i) =>
                        p === "…" ? (
                            <span key={`e${i}`} className="px-1 text-gray-300 text-xs">…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onChange(p as number)}
                                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all cursor-pointer ${page === p ? "bg-accent text-white" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                                {p}
                            </button>
                        )
                    )}
                <button
                    onClick={() => onChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}

type Tab = "stats" | "users" | "conversations" | "keys";

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<Tab>("stats");
    const [userSearch, setUserSearch] = useState("");
    const [convSearch, setConvSearch] = useState("");
    const [keySearch, setKeySearch] = useState("");
    const [userPage, setUserPage] = useState(1);
    const [convPage, setConvPage] = useState(1);
    const [keyPage, setKeyPage] = useState(1);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const PER = 10;

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const res = await fetch(`${getBaseUrl()}/admin/`, { headers: getAuthHeaders() });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            setData(json.data);
        } catch {
            toast.error("Only for Admin");
            setData(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredUsers = useMemo(() => {
        if (!data) return [];
        return [...data.users]
            .filter((u: any) => u.email.toLowerCase().includes(userSearch.toLowerCase()))
            .sort((a: any, b: any) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
    }, [data, userSearch]);

    const filteredConvs = useMemo(() => {
        if (!data) return [];
        return [...data.conversations]
            .filter((c: any) =>
                c.title.toLowerCase().includes(convSearch.toLowerCase()) ||
                c.user_id?.toLowerCase().includes(convSearch.toLowerCase())
            )
            .sort((a: any, b: any) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
    }, [data, convSearch]);

    const filteredKeys = useMemo(() => {
        if (!data || !data.keys) return [];
        return [...data.keys]
            .filter((k: any) => {
                const owner = data.users.find((u: any) => u.id === k.user_id);
                return (
                    k.name.toLowerCase().includes(keySearch.toLowerCase()) ||
                    owner?.email.toLowerCase().includes(keySearch.toLowerCase())
                );
            })
            .sort((a: any, b: any) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
    }, [data, keySearch]);

    const pagedUsers = filteredUsers.slice((userPage - 1) * PER, userPage * PER);
    const pagedConvs = filteredConvs.slice((convPage - 1) * PER, convPage * PER);
    const pagedKeys = filteredKeys.slice((keyPage - 1) * PER, keyPage * PER);

    const handleBlockKey = async (id: string) => {
        toast.info("This will be blocked?", {
            action: {
                label: "Block",
                onClick: async () => {
                    try {
                        const res = await fetch(`${getBaseUrl()}/api/keys/${id}/block`, {
                            method: "PATCH",
                            headers: getAuthHeaders(),
                        });
                        const json = await res.json();
                        if (json.success) {
                            setData((prev: any) => ({
                                ...prev,
                                keys: prev.keys.map((k: any) => k.id === id ? { ...k, is_active: "blocked" } : k)
                            }));
                            toast.success("Blacklisted!");
                        } else {
                            toast.error(json.message || "Failed to block API key");
                        }
                    } catch {
                        toast.error("Failed to block API key");
                    }
                }
            },
        });
    };

    const userConvMap = useMemo(() => {
        if (!data) return {};
        const map: Record<string, any[]> = {};
        data.conversations.forEach((c: any) => {
            if (!map[c.user_id]) map[c.user_id] = [];
            map[c.user_id].push(c);
        });
        return map;
    }, [data]);

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: "stats", label: "Stats", icon: DashboardCircleFreeIcons },
        { id: "users", label: "Users", icon: UserIcon },
        { id: "conversations", label: "Convs", icon: Chat01FreeIcons },
        { id: "keys", label: "Keys", icon: Key01Icon },
    ];

    if (loading) {
        return (
            <div className="h-screen w-screen bg-accent flex flex-col items-center justify-center gap-4 text-white">
                <div className="flex flex-col h-screen items-center justify-center text-white">
                    <FlowerLoader
                        size="w-30 h-30"
                        stepMs={80}
                        pauseMs={50}
                        petalWidth={4}
                    />
                </div>
            </div>

        );
    }

    if (!data) {
        return (
            <div className="h-screen w-screen bg-accent flex flex-col items-center justify-center gap-4 text-white">
                <div className="flex flex-col h-screen items-center justify-center text-white">
                    <svg viewBox="0 0 500 500" className="w-30 scale-100 h-30">
                        <defs>
                            <ellipse id="petal16" cx="340" cy="250" rx="90" ry="28" fill="none" stroke="white" strokeWidth="8" />
                        </defs>
                        <g>
                            {[...Array(16)].map((_, i) => (
                                <use key={i} href="#petal16" transform={`rotate(${i * 22.5} 250 250)`} />
                            ))}
                        </g>
                    </svg>
                    <p className="text-3xl font-medium">Only for Admin</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <MinervaLogo size={28} />
                        <div>
                            <p className="text-sm font-semibold text-gray-800 tracking-tight leading-none">Minerva</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Admin Console</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer transition-all duration-200 disabled:opacity-50"
                        >
                            <HugeiconsIcon icon={RefreshIcon} size={13} strokeWidth={2} className={refreshing ? "animate-spin" : ""} />
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col gap-4">

                <div className="grid grid-cols-2 sm:w-400 w-60 lg:grid-cols-6 gap-3">
                    <div className="col-span-2 grid grid-cols-4 gap-2 bg-white border border-gray-100 rounded-4xl px-2 py-2 shadow-sm w-full self-start">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[20px] text-xs font-medium cursor-pointer transition-all duration-200 ${tab === t.id ? "bg-accent text-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                                    }`}
                            >
                                <HugeiconsIcon icon={t.icon} size={16} strokeWidth={2} />

                                <span className="hidden lg:inline text-[11px]">
                                    {t.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>


                <AnimatePresence mode="wait">

                    {tab === "stats" && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                        >
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800">Recent Users</p>
                                    <Badge variant={data?.stats.total_users > 0 ? "default" : "muted"}>{data?.stats.total_users}</Badge>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {(data?.users ?? []).slice(0, 3).map((u: any, i: number) => (
                                        <motion.div
                                            key={u.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                            className="flex items-center gap-3 px-5 py-3"
                                        >
                                            <Avatar email={u.email} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{u.email}</p>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <HugeiconsIcon icon={Clock02Icon} size={11} strokeWidth={2} />
                                                    {formatDate(u.created_at)}
                                                </p>
                                            </div>
                                            <Badge variant={u.conversation_count > 0 ? "default" : "muted"}>
                                                {u.conversation_count} conv
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                                {data?.stats.total_users > 2 && (
                                    <div className="px-5 py-3 border-t border-gray-200">
                                        <button onClick={() => setTab("users")} className="text-xs text-accent hover:underline cursor-pointer font-medium">
                                            View all {data?.stats.total_users} users →
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800">Recent Conversations</p>
                                    <Badge variant={data?.stats.total_conversations > 0 ? "default" : "muted"}>{data?.stats.total_conversations}</Badge>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {(data?.conversations ?? []).slice(0, 3).map((c: any, i: number) => (
                                        <motion.div
                                            key={c.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                            className="flex items-center gap-3 px-5 py-3"
                                        >
                                            <div className="w-8 h-8 rounded-4xl bg-gray-100 flex items-center justify-center shrink-0">
                                                <HugeiconsIcon icon={BubbleChatIcon} size={15} strokeWidth={2.5} className="text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <HugeiconsIcon icon={Clock02Icon} size={11} strokeWidth={2} />
                                                    {formatDate(c.created_at)}
                                                </p>
                                            </div>
                                            <Badge variant={c.message_count > 0 ? "default" : "muted"}>
                                                {c.message_count} msg
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                                {data?.stats.total_conversations > 2 && (
                                    <div className="px-5 py-3 border-t border-gray-200">
                                        <button onClick={() => setTab("conversations")} className="text-xs text-accent hover:underline cursor-pointer font-medium">
                                            View all {data?.stats.total_conversations} conversations →
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
                                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800">Recent Keys</p>
                                    <Badge variant={data?.keys_stats?.total_keys > 0 ? "default" : "muted"}>{data?.keys_stats?.total_keys}</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                                    {(data?.keys ?? []).slice(0, 4).filter((keys: any) => keys.is_active === "active").length > 0 ? (data?.keys ?? []).slice(0, 4).filter((keys: any) => keys.is_active === "active").map((k: any, i: number) => {
                                        const owner = data.users.find((u: any) => u.id === k.user_id);
                                        return (
                                            <motion.div
                                                key={k.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                                className="flex items-center gap-3 px-5 py-3"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                                    <HugeiconsIcon icon={Key01Icon} size={15} className="text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{k.name}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{owner?.email}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    }) :
                                        <>
                                            <div className="flex items-center gap-3 px-5 py-3">
                                                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                                    <HugeiconsIcon icon={Key01Icon} size={15} className="text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">No Active Keys</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{(data?.keys ?? []).length} Total Keys</p>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                                {data?.keys_stats?.total_keys > 2 && (
                                    <div className="px-5 py-3 border-t border-gray-200">
                                        <button onClick={() => setTab("keys")} className="flex items-center gap-1 text-xs text-accent cursor-pointer font-medium">
                                            View all {data?.keys_stats?.total_keys} Keys →
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
                                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800">Engagement Distribution</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-200 gap-px">
                                    <div className="contents">
                                        <div className="bg-white px-3 py-2 md:py-8 flex flex-col items-center justify-center group transition-colors">
                                            <StatCard label="Users Users" value={data?.stats.total_users ?? 0} icon={UserIcon} delay={0} />
                                        </div>
                                        <div className="bg-white px-3 py-2 md:py-8 flex flex-col items-center justify-center group transition-colors">
                                            <StatCard label="Conversations Convs" value={data?.stats.total_conversations ?? 0} icon={BubbleChatIcon} delay={80} />
                                        </div>
                                        <div className="bg-white px-3 py-2 md:py-8 flex flex-col items-center justify-center group transition-colors">
                                            <StatCard label="Messages Msgs" value={data?.stats.total_messages ?? 0} icon={MessageIcon} delay={160} />
                                        </div>
                                        <div className="bg-white px-3 py-2 md:py-8 flex flex-col items-center justify-center group transition-colors">
                                            <StatCard label="Keys Keys" value={data?.keys_stats?.total_keys ?? 0} icon={Key01Icon} delay={240} />
                                        </div>
                                    </div>
                                    {[
                                        { label: "Active Users", value: data ? data.users.filter((u: any) => u.conversation_count > 0).length : 0, icon: UserIcon },
                                        { label: "Conversations / User", value: data ? (data.stats.total_conversations / Math.max(data.stats.total_users, 1)).toFixed(1) : "0", icon: Chat01FreeIcons },
                                        { label: "Messages / Conversation", value: data ? (data.stats.total_messages / Math.max(data.stats.total_conversations, 1)).toFixed(1) : "0", icon: Message01Icon },
                                        { label: "Keys / User", value: data ? (data.keys_stats.total_keys / Math.max(data.stats.total_users, 1)).toFixed(1) : "0", icon: Key01Icon },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-white px-3 py-2 md:py-8 flex flex-col items-center justify-center group transition-all">
                                            <div className="flex flex-col items-center gap-1.5 sm:gap-2">

                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="text-lg sm:text-xl font-bold text-gray-900 tabular-nums tracking-tight flex items-center gap-2">
                                                        <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-gray-100 flex items-center justify-center transition-all">
                                                            <HugeiconsIcon icon={item.icon} size={12} strokeWidth={2.5} className="text-gray-400" />
                                                        </div>
                                                        {item.value}
                                                    </div>
                                                    <p className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                                                        {item.label}
                                                    </p>
                                                    <p className="md:hidden text-[9px] text-gray-400 font-bold uppercase tracking-tight text-center">
                                                        {item.label}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {tab === "users" && (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-x-scroll"
                        >
                            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 relative">
                                    <HugeiconsIcon icon={SearchIcon} size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={userSearch}
                                        onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                                        placeholder="Search by email…"
                                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none focus:shadow-sm focus:bg-white border border-transparent focus:border-gray-200/50  transition-all duration-200 placeholder:text-gray-400 text-gray-800"
                                    />
                                    {userSearch && (
                                        <button onClick={() => setUserSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <table className="w-full border-y border-gray-200">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                                            User
                                        </th>
                                        <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                                            Joined
                                        </th>
                                        <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                                            Conversation
                                        </th>
                                        <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-gray-400 font-bold w-10">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pagedUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-12 text-center text-sm text-gray-400 italic">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : pagedUsers.map((u: any, i: number) => (
                                        <Fragment key={u.id}>
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.03 }}
                                                className={`group hover:bg-gray-200/20 transition-colors duration-150 cursor-pointer ${expandedUser === u.id ? "bg-gray-50/80" : ""}`}
                                                onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar email={u.email} />
                                                        <span className="text-sm font-semibold text-gray-800 truncate">{u.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-[11px] text-gray-400 font-medium">
                                                        {formatDate(u.created_at)}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Badge variant={u.conversation_count > 0 ? "default" : "muted"}>
                                                        {u.conversation_count} conv
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className={`inline-block text-gray-400 transition-transform duration-200 ${expandedUser === u.id ? "rotate-90" : ""}`}>
                                                        <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2} />
                                                    </span>
                                                </td>
                                            </motion.tr>

                                            <AnimatePresence>
                                                {expandedUser === u.id && (
                                                    <tr>
                                                        <td colSpan={4} className="p-0 border-b border-gray-100 bg-gray-50">
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-5 py-6">
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">User Conversations</p>
                                                                        <Badge variant="default">{userConvMap[u.id]?.length || 0} total</Badge>
                                                                    </div>
                                                                    {(userConvMap[u.id] || []).length === 0 ? (
                                                                        <p className="text-xs text-gray-400 italic bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center">No conversations recorded for this user.</p>
                                                                    ) : (
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                            {(userConvMap[u.id] || []).map((c: any) => (
                                                                                <div key={c.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-xs text-xs">
                                                                                    <span className="text-gray-700 font-semibold truncate">{c.title}</span>
                                                                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                                                                        <Badge variant={c.message_count > 0 ? "default" : "muted"}>{c.message_count} msg</Badge>
                                                                                        <span className="text-[10px] text-gray-400 font-medium tabular-nums">{formatDate(c.created_at)}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>

                            <div className="px-5 py-4 border-t border-gray-50">
                                <Pagination page={userPage} total={filteredUsers.length} perPage={PER} onChange={setUserPage} />
                            </div>
                        </motion.div>
                    )}

                    {tab === "conversations" && (
                        <motion.div
                            key="conversations"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 relative">
                                    <HugeiconsIcon icon={SearchIcon} size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={convSearch}
                                        onChange={(e) => { setConvSearch(e.target.value); setConvPage(1); }}
                                        placeholder="Search by title or user ID…"
                                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none focus:shadow-sm focus:bg-white border border-transparent focus:border-gray-200/50  transition-all duration-200 placeholder:text-gray-400 text-gray-800"
                                    />
                                    {convSearch && (
                                        <button onClick={() => setConvSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="w-full overflow-x-auto">
                                <table className="w-full border-y border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                                                <span className="sm:inline hidden">Conversation</span>
                                                <span className="inline sm:hidden">Conv</span>
                                            </th>
                                            <th className="hidden sm:table-cell px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                                                Owner
                                            </th>
                                            <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                                                Total <span className="sm:inline hidden">Messages</span>
                                                <span className="inline sm:hidden">Msg</span>
                                            </th>
                                            <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                                                Created
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pagedConvs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-5 py-12 text-center text-sm text-gray-400 italic">
                                                    No conversations found
                                                </td>
                                            </tr>
                                        ) : (
                                            pagedConvs.map((c: any, i: number) => {
                                                const owner = data?.users.find((u: any) => u.id === c.user_id);
                                                return (
                                                    <motion.tr
                                                        key={c.id}
                                                        initial={{ opacity: 0, y: 4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.02 }}
                                                        className="group  transition-colors"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-800 truncate leading-none mb-1 flex items-center gap-2">
                                                                        <HugeiconsIcon icon={Message01Icon} size={14} strokeWidth={2} className="text-gray-400" />
                                                                        {c.title}
                                                                    </p>
                                                                    <p className="text-[11px] text-gray-400 font-mono truncate sm:hidden">
                                                                        {owner?.email || c.user_id?.slice(0, 8)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="hidden sm:table-cell px-5 py-4">
                                                            <p className="text-xs text-gray-500 truncate max-w-[160px] font-medium">
                                                                {owner?.email || <span className="opacity-50">{c.user_id?.slice(0, 8)}…</span>}
                                                            </p>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <Badge variant={c.message_count > 0 ? "default" : "muted"}>
                                                                {c.message_count}
                                                                <span className="sm:inline hidden pl-1"> messages</span>
                                                            </Badge>
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            <p className="text-[11px] text-gray-400 font-medium tabular-nums">
                                                                {formatDate(c.created_at)}
                                                            </p>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-5 py-4 border-t border-gray-50">
                                <Pagination page={convPage} total={filteredConvs.length} perPage={PER} onChange={setConvPage} />
                            </div>
                        </motion.div>
                    )}

                    {tab === "keys" && (
                        <motion.div
                            key="keys"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                        >
                            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 relative">
                                    <HugeiconsIcon icon={SearchIcon} size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={keySearch}
                                        onChange={(e) => { setKeySearch(e.target.value); setKeyPage(1); }}
                                        placeholder="Search by key name or user email…"
                                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none focus:shadow-sm focus:bg-white border border-transparent focus:border-gray-200/50  transition-all duration-200 placeholder:text-gray-400 text-gray-800"
                                    />
                                    {keySearch && (
                                        <button onClick={() => setKeySearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {pagedKeys.length === 0 ? (
                                    <div className="px-5 py-12 text-center text-sm text-gray-400">No Keys found</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-b border-gray-200">
                                            <thead className="bg-gray-50 border-y border-gray-200 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                                                <tr>
                                                    <th className="px-5 py-3">Key</th>
                                                    <th className="px-5 py-3">Owner</th>
                                                    <th className="px-5 py-3">Status</th>
                                                    <th className="px-5 py-3">Created</th>
                                                    <th className="px-5 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {pagedKeys.map((k: any, i: number) => {
                                                    const owner = data.users.find((u: any) => u.id === k.user_id);
                                                    return (
                                                        <motion.tr
                                                            key={k.id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: i * 0.03 }}
                                                            className=" transition-colors"
                                                        >
                                                            <td className="px-5 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                                        <HugeiconsIcon icon={Key01Icon} size={14} strokeWidth={2} className="text-gray-400" />
                                                                        {k.name}</span>
                                                                    <code className="text-[10px] text-gray-400 font-mono mt-0.5">{k.prefix}••••••••</code>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar email={owner?.email || ""} />
                                                                    <span className="text-xs text-gray-600 truncate max-w-[120px]">{owner?.email}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <Badge variant={k.is_active === "active" ? "success" : "warning"}>
                                                                    {k.is_active}
                                                                </Badge>
                                                                {k.last_used_at && (
                                                                    <p className="text-[9px] text-gray-400 mt-1">Used {formatDate(k.last_used_at)}</p>
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-4 text-xs text-gray-500">
                                                                {formatDate(k.created_at)}
                                                            </td>
                                                            <td className="px-5 py-4 text-right">
                                                                {k.is_active === "active" && (
                                                                    <button
                                                                        onClick={() => handleBlockKey(k.id)}
                                                                        className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                                                    >
                                                                        Block
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="px-5 py-4 border-t border-gray-50">
                                <Pagination page={keyPage} total={filteredKeys.length} perPage={PER} onChange={setKeyPage} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}