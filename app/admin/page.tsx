"use client";

import { useEffect, useState, useMemo } from "react";
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
    FilterIcon,
    Cancel01Icon,
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
            className="bg-white border border-gray-100 rounded-4xl p-2 flex items-center gap-4 shadow-sm overflow-hidden"
        >
            <div className="w-11 h-11 rounded-4xl bg-accent flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={icon} size={20} strokeWidth={2} className="text-white" />
            </div>
            <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold text-gray-900 tabular-nums tracking-tight">
                    {display.toLocaleString()}
                </p>
                <p className="hidden lg:inline text-xs text-gray-400 font-medium uppercase tracking-widest">
                    {label}
                </p>
                <p className="hidden md:inline lg:hidden text-xs text-gray-400 font-medium uppercase tracking-widest">
                    {label.slice(0, 4).concat("...")}
                </p>
            </div>
        </motion.div>
    );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "accent" | "muted" }) {
    const cls = {
        default: "bg-gray-100 text-gray-600",
        accent: "bg-accent/10 text-accent",
        muted: "bg-gray-50 text-gray-400",
    }[variant];
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${cls}`}>{children}</span>;
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

type Tab = "overview" | "users" | "conversations";

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<Tab>("overview");
    const [userSearch, setUserSearch] = useState("");
    const [convSearch, setConvSearch] = useState("");
    const [userPage, setUserPage] = useState(1);
    const [convPage, setConvPage] = useState(1);
    const [userSort, setUserSort] = useState<"email" | "conversations" | "created">("created");
    const [convSort, setConvSort] = useState<"title" | "messages" | "created">("created");
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
                if (userSort === "email") return a.email.localeCompare(b.email);
                if (userSort === "conversations") return b.conversation_count - a.conversation_count;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
    }, [data, userSearch, userSort]);

    const filteredConvs = useMemo(() => {
        if (!data) return [];
        return [...data.conversations]
            .filter((c: any) =>
                c.title.toLowerCase().includes(convSearch.toLowerCase()) ||
                c.user_id?.toLowerCase().includes(convSearch.toLowerCase())
            )
            .sort((a: any, b: any) => {
                if (convSort === "title") return a.title.localeCompare(b.title);
                if (convSort === "messages") return b.message_count - a.message_count;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
    }, [data, convSearch, convSort]);

    const pagedUsers = filteredUsers.slice((userPage - 1) * PER, userPage * PER);
    const pagedConvs = filteredConvs.slice((convPage - 1) * PER, convPage * PER);

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
        { id: "overview", label: "Overview", icon: FilterIcon },
        { id: "users", label: "Users", icon: UserIcon },
        { id: "conversations", label: "Conversations", icon: BubbleChatIcon },
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

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    <StatCard label="Total Users" value={data?.stats.total_users ?? 0} icon={UserIcon} delay={0} />
                    <StatCard label="Conversations" value={data?.stats.total_conversations ?? 0} icon={BubbleChatIcon} delay={80} />
                    <StatCard label="Messages" value={data?.stats.total_messages ?? 0} icon={MessageIcon} delay={160} />
                    <div className="col-span-3 sm:col-span-2 grid grid-cols-3 gap-2 bg-white border border-gray-100 rounded-4xl px-2 py-2 shadow-sm w-full sm:w-auto self-start">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[20px] text-sm font-medium cursor-pointer transition-all duration-200 ${tab === t.id ? "bg-accent text-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                                    }`}
                            >
                                <HugeiconsIcon icon={t.icon} size={20} strokeWidth={2} />
                                <span className="hidden lg:inline">
                                    {t.label}
                                </span>
                                <span className="hidden md:inline lg:hidden">
                                    {t.label.slice(0, 4)}...
                                </span>
                            </button>
                        ))}
                    </div>
                </div>


                <AnimatePresence mode="wait">

                    {tab === "overview" && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                        >
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800">Recent Users</p>
                                    <Badge variant="accent">{data?.stats.total_users}</Badge>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {(data?.users ?? []).slice(0, 6).map((u: any, i: number) => (
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
                                            <Badge variant={u.conversation_count > 0 ? "accent" : "muted"}>
                                                {u.conversation_count} conv
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                                {data?.stats.total_users > 6 && (
                                    <div className="px-5 py-3 border-t border-gray-50">
                                        <button onClick={() => setTab("users")} className="text-xs text-accent hover:underline cursor-pointer font-medium">
                                            View all {data?.stats.total_users} users →
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800">Recent Conversations</p>
                                    <Badge variant="accent">{data?.stats.total_conversations}</Badge>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {(data?.conversations ?? []).slice(0, 6).map((c: any, i: number) => (
                                        <motion.div
                                            key={c.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                            className="flex items-center gap-3 px-5 py-3"
                                        >
                                            <div className="w-8 h-8 rounded-4xl bg-accent flex items-center justify-center shrink-0">
                                                <HugeiconsIcon icon={BubbleChatIcon} size={15} strokeWidth={2.5} className="text-white" />
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
                                {data?.stats.total_conversations > 6 && (
                                    <div className="px-5 py-3 border-t border-gray-50">
                                        <button onClick={() => setTab("conversations")} className="text-xs text-accent hover:underline cursor-pointer font-medium">
                                            View all {data?.stats.total_conversations} conversations →
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 lg:col-span-2">
                                <p className="text-sm font-semibold text-gray-800 mb-4">Engagement Distribution</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: "Avg. conversations / user", value: data ? (data.stats.total_conversations / Math.max(data.stats.total_users, 1)).toFixed(1) : "0" },
                                        { label: "Avg. messages / conversation", value: data ? (data.stats.total_messages / Math.max(data.stats.total_conversations, 1)).toFixed(1) : "0" },
                                        { label: "Users with conversations", value: data ? data.users.filter((u: any) => u.conversation_count > 0).length : 0 },
                                        { label: "Empty conversations", value: data ? data.conversations.filter((c: any) => c.message_count === 0).length : 0 },
                                    ].map((item) => (
                                        <div key={item.label} className="p-4 flex items-center gap-2 flex-wrap">
                                            <p className="text-xl font-semibold text-black tabular-nums">{item.value}</p>
                                            <p className="text-[11px] text-black/50 mt-1 leading-tight">{item.label}</p>
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
                            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center gap-3">
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
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 whitespace-nowrap">Sort by</span>
                                    <select
                                        value={userSort}
                                        onChange={(e) => setUserSort(e.target.value as any)}
                                        className="text-xs border border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-accent/40 text-gray-600 cursor-pointer bg-white"
                                    >
                                        <option value="created">Date joined</option>
                                        <option value="email">Email</option>
                                        <option value="conversations">Conversations</option>
                                    </select>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                <AnimatePresence>
                                    {pagedUsers.length === 0 ? (
                                        <div className="px-5 py-12 text-center text-sm text-gray-400">No users found</div>
                                    ) : pagedUsers.map((u: any, i: number) => (
                                        <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                            <button
                                                onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                                                className={`w-full flex items-center gap-3 px-5 py-3.5 ${expandedUser == null ? "hover:bg-gray-200/20 opacity-100" : expandedUser !== u.id ? "opacity-20 blur-[1px]" : ""} transition-colors duration-150 text-left cursor-pointer`}
                                            >
                                                <Avatar email={u.email} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{u.email}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                        <HugeiconsIcon icon={Clock02Icon} size={11} strokeWidth={2} />
                                                        Joined {formatDate(u.created_at)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Badge variant={u.conversation_count > 0 ? "accent" : "muted"}>
                                                        {u.conversation_count} conv
                                                    </Badge>
                                                    <span className={`text-gray-400 transition-transform duration-200 ${expandedUser === u.id ? "rotate-90" : ""}`}>
                                                        <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2} />
                                                    </span>
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {expandedUser === u.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="bg-white px-5 py-4">
                                                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">Conversations</p>
                                                            {(userConvMap[u.id] || []).length === 0 ? (
                                                                <p className="text-xs text-gray-400 italic">No conversations yet</p>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    {(userConvMap[u.id] || []).map((c: any) => (
                                                                        <div key={c.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-gray-200/50 text-xs">
                                                                            <span className="text-gray-700 font-medium truncate">{c.title}</span>
                                                                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                                                                <Badge variant="default">{c.message_count} msg</Badge>
                                                                                <span className="text-gray-400">{formatDate(c.created_at)}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

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
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 whitespace-nowrap">Sort by</span>
                                    <select
                                        value={convSort}
                                        onChange={(e) => setConvSort(e.target.value as any)}
                                        className="text-xs border border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-accent/40 text-gray-600 cursor-pointer bg-white"
                                    >
                                        <option value="created">Date created</option>
                                        <option value="title">Title</option>
                                        <option value="messages">Message count</option>
                                    </select>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {pagedConvs.length === 0 ? (
                                    <div className="px-5 py-12 text-center text-sm text-gray-400">No conversations found</div>
                                ) : pagedConvs.map((c: any, i: number) => {
                                    const owner = data?.users.find((u: any) => u.id === c.user_id);
                                    return (
                                        <motion.div
                                            key={c.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4 items-start sm:items-center px-5 py-3.5 gap-1.5"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-7 h-7 rounded-4xl bg-accent flex items-center justify-center shrink-0">
                                                    <HugeiconsIcon icon={BubbleChatIcon} size={16} strokeWidth={2.5} className="text-white" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                                                    <p className="text-[11px] text-gray-400 font-mono truncate sm:hidden">
                                                        {owner?.email || c.user_id?.slice(0, 8) + "…"}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="hidden sm:block text-xs text-gray-500 truncate max-w-[140px]">
                                                {owner?.email || <span className="font-mono text-gray-400">{c.user_id?.slice(0, 8)}…</span>}
                                            </p>
                                            <Badge variant={c.message_count > 5 ? "accent" : c.message_count > 0 ? "default" : "muted"}>
                                                {c.message_count} msg
                                            </Badge>
                                            <p className="text-[11px] text-gray-400 whitespace-nowrap">{formatDate(c.created_at)}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="px-5 py-4 border-t border-gray-50">
                                <Pagination page={convPage} total={filteredConvs.length} perPage={PER} onChange={setConvPage} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}