"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Copy01Icon,
    Tick02Icon,
    KeyIcon,
    BubbleChatIcon,
    MessageIcon,
    InformationCircleIcon,
    ArrowDown01Icon,
} from "@hugeicons/core-free-icons";

const MinervaLogo = ({ size = 32, color = "#685AFF" }: { size?: number; color?: string }) => (
    <svg viewBox="0 0 500 500" width={size} height={size} style={{ flexShrink: 0 }}>
        <defs>
            <ellipse id={`ml-${size}`} cx="340" cy="250" rx="90" ry="28" fill="none" stroke={color} strokeWidth="8" />
        </defs>
        <g>{[...Array(16)].map((_, i) => <use key={i} href={`#ml-${size}`} transform={`rotate(${i * 22.5} 250 250)`} />)}</g>
    </svg>
);

const METHOD_COLORS: Record<string, string> = {
    GET: "bg-emerald-500 text-white border-emerald-500",
    POST: "bg-amber-500 text-white border-amber-500",
    PATCH: "bg-blue-500 text-white border-blue-500",
    DELETE: "bg-red-500 text-white border-red-500",
};

function MethodBadge({ method }: { method: string }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${METHOD_COLORS[method] ?? "bg-gray-500/15 text-accent border-gray-500/20"}`}>
            {method}
        </span>
    );
}

function CopyButton({ text, light = false }: { text: string; light?: boolean }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={copy}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer ${light
                    ? "text-white hover:bg-white/30"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
        >
            <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={12} strokeWidth={2} />
            {copied ? "Copied" : "Copy"}
        </button>
    );
}

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
    return (
        <div className="rounded-xl overflow-hidden bg-accent/10">
            <div className="flex items-center justify-between px-4 py-2.5 bg-accent">
                <span className="text-[10px] uppercase tracking-widest text-white font-semibold">{lang}</span>
                <CopyButton text={code} light />
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono text-accent leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function ParamRow({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3 py-3">
            <div className="flex items-center gap-2 shrink-0 sm:w-40">
                <code className="text-xs text-accent font-mono bg-accent/20 px-2 py-0.5 rounded-md">{name}</code>
                {required && <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded-md bg-amber-500 uppercase tracking-wider">req</span>}
            </div>
            <span className="text-[10px] text-accent font-mono shrink-0 sm:w-20">{type}</span>
            <span className="text-xs text-accent/80 leading-relaxed">{desc}</span>
        </div>
    );
}

function ResponseBlock({ json }: { json: string }) {
    return (
        <div className="rounded-xl overflow-hidden bg-accent/10">
            <div className="flex items-center justify-between px-4 py-2.5 bg-accent">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-white font-semibold">Response</span>
                </div>
                <CopyButton text={json} light />
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono text-accent leading-relaxed">
                <code>{json}</code>
            </pre>
        </div>
    );
}

type Endpoint = {
    id: string;
    method: string;
    path: string;
    title: string;
    desc: string;
    auth: "bearer" | "api-key";
    params?: { name: string; type: string; required?: boolean; desc: string }[];
    body?: { name: string; type: string; required?: boolean; desc: string }[];
    curl: string;
    response: string;
};

type Section = {
    id: string;
    icon: any;
    title: string;
    desc: string;
    endpoints: Endpoint[];
};

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const SECTIONS: Section[] = [
    {
        id: "keys",
        icon: KeyIcon,
        title: "Management",
        desc: "Generate and manage API keys for external access. Requires Bearer token authentication from your session.",
        endpoints: [
            {
                id: "keys-create",
                method: "POST",
                path: "/api/keys",
                title: "Generate API Key",
                desc: "Creates a new named API key tied to your account. The key value is returned once — store it securely.",
                auth: "bearer",
                body: [
                    { name: "name", type: "string", required: true, desc: "A human-readable label for this key, e.g. \"Production Key\"" },
                ],
                curl: `curl -X POST "${BASE}/api/keys" \\
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{"name": "Internal Testing Key"}'`,
                response: `{
  "success": true,
  "message": "API key generated",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Internal Testing Key",
    "key": "mk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
    "created_at": "2025-04-10T08:00:00Z"
  }
}`,
            },
            {
                id: "keys-list",
                method: "GET",
                path: "/api/keys",
                title: "List API Keys",
                desc: "Returns all API keys associated with your account. Key values are masked for security.",
                auth: "bearer",
                curl: `curl -X GET "${BASE}/api/keys" \\
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
                response: `{
  "success": true,
  "data": {
    "keys": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "Internal Testing Key",
        "is_active": true,
        "created_at": "2025-04-10T08:00:00Z"
      }
    ]
  }
}`,
            },
            {
                id: "keys-block",
                method: "PATCH",
                path: "/api/keys/{id}/block",
                title: "Block / Revoke API Key",
                desc: "Immediately deactivates an API key. Any requests using this key will be rejected with 401.",
                auth: "bearer",
                params: [
                    { name: "id", type: "uuid", required: true, desc: "The UUID of the API key to block" },
                ],
                curl: `curl -X PATCH "${BASE}/api/keys/UUID_HERE/block" \\
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
                response: `{
  "success": true,
  "message": "API key blocked successfully"
}`,
            },
            {
                id: "keys-delete",
                method: "DELETE",
                path: "/api/keys/{id}",
                title: "Delete API Key",
                desc: "Permanently removes an API key from your account. This action cannot be undone.",
                auth: "bearer",
                params: [
                    { name: "id", type: "uuid", required: true, desc: "The UUID of the API key to delete" },
                ],
                curl: `curl -X DELETE "${BASE}/api/keys/UUID_HERE" \\
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
                response: `{
  "success": true,
  "message": "API key deleted"
}`,
            },
        ],
    },
    {
        id: "chat",
        icon: BubbleChatIcon,
        title: "Chat",
        desc: "Send messages to Minerva and receive AI-generated responses. Uses your API key via the X-API-Key header.",
        endpoints: [
            {
                id: "chat-v1",
                method: "POST",
                path: "/api/chat/v1",
                title: "Legacy Chat (V1)",
                desc: "Send a prompt to Minerva. Omit conversation_id to start a fresh conversation — one will be created and returned automatically.",
                auth: "api-key",
                body: [
                    { name: "prompt", type: "string", required: true, desc: "The message to send to Minerva" },
                    { name: "conversation_id", type: "uuid | null", desc: "Existing conversation to continue. Pass null to create a new one." },
                ],
                curl: `curl -X POST "${BASE}/api/chat/v1" \\
     -H "X-API-Key: YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{
       "prompt": "Hello Minerva, explain quantum physics.",
       "conversation_id": null
     }'`,
                response: `{
  "success": true,
  "data": {
    "response": "Quantum physics is the branch of physics...",
    "conversation_id": "9b1d3f22-4a87-41b2-9cde-bc345ff12abc",
    "message_id": "f1d2c3b4-1234-5678-abcd-ef0123456789"
  }
}`,
            },
            {
                id: "chat-conv",
                method: "POST",
                path: "/api/chat/{conversation_id}",
                title: "Chat via Conversation ID",
                desc: "Continue an existing conversation by its UUID. Maintains full message history for context.",
                auth: "api-key",
                params: [
                    { name: "conversation_id", type: "uuid", required: true, desc: "The UUID of the conversation to continue" },
                ],
                body: [
                    { name: "prompt", type: "string", required: true, desc: "The next message in the conversation" },
                ],
                curl: `curl -X POST "${BASE}/api/chat/CONVERSATION_UUID_HERE" \\
     -H "X-API-Key: YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{"prompt": "Tell me more about that."}'`,
                response: `{
  "success": true,
  "data": {
    "response": "Certainly! Expanding on what I said...",
    "conversation_id": "CONVERSATION_UUID_HERE",
    "message_id": "a2b3c4d5-6789-0abc-def0-123456789abc"
  }
}`,
            },
        ],
    },
    {
        id: "conversations",
        icon: MessageIcon,
        title: "Conversations",
        desc: "Create, list, retrieve, and delete conversation threads. All endpoints use your X-API-Key.",
        endpoints: [
            {
                id: "conv-new",
                method: "POST",
                path: "/api/chat/conversations/new",
                title: "Create New Conversation",
                desc: "Creates an empty conversation with a title. Returns the conversation ID to use in subsequent chat requests.",
                auth: "api-key",
                body: [
                    { name: "title", type: "string", required: true, desc: "A descriptive name for the conversation thread" },
                ],
                curl: `curl -X POST "${BASE}/api/chat/conversations/new" \\
     -H "X-API-Key: YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{"title": "Project Alpha Chat"}'`,
                response: `{
  "success": true,
  "data": {
    "conversation": {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "title": "Project Alpha Chat",
      "created_at": "2025-04-10T09:00:00Z"
    }
  }
}`,
            },
            {
                id: "conv-list",
                method: "GET",
                path: "/api/chat/conversations",
                title: "Get All Conversations",
                desc: "Returns all conversations associated with your API key, ordered by most recently created.",
                auth: "api-key",
                curl: `curl -X GET "${BASE}/api/chat/conversations" \\
     -H "X-API-Key: YOUR_API_KEY"`,
                response: `{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "title": "Project Alpha Chat",
        "created_at": "2025-04-10T09:00:00Z"
      }
    ]
  }
}`,
            },
            {
                id: "conv-messages",
                method: "GET",
                path: "/api/chat/{conversation_id}/messages",
                title: "Get Messages",
                desc: "Retrieves the full message history for a conversation, ordered chronologically.",
                auth: "api-key",
                params: [
                    { name: "conversation_id", type: "uuid", required: true, desc: "The UUID of the conversation" },
                ],
                curl: `curl -X GET "${BASE}/api/chat/CONVERSATION_UUID_HERE/messages" \\
     -H "X-API-Key: YOUR_API_KEY"`,
                response: `{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "f1d2c3b4-...",
        "role": "user",
        "content": "Hello Minerva, explain quantum physics.",
        "created_at": "2025-04-10T09:01:00Z"
      },
      {
        "id": "a2b3c4d5-...",
        "role": "assistant",
        "content": "Quantum physics is the branch of physics...",
        "created_at": "2025-04-10T09:01:02Z"
      }
    ]
  }
}`,
            },
            {
                id: "conv-delete",
                method: "POST",
                path: "/api/chat/conversations/delete",
                title: "Delete Conversation",
                desc: "Permanently deletes a conversation and all its messages. This cannot be undone.",
                auth: "api-key",
                body: [
                    { name: "id", type: "uuid", required: true, desc: "The UUID of the conversation to delete" },
                ],
                curl: `curl -X POST "${BASE}/api/chat/conversations/delete" \\
     -H "X-API-Key: YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{"id": "CONVERSATION_UUID_HERE"}'`,
                response: `{
  "success": true,
  "message": "Conversation deleted"
}`,
            },
        ],
    },
];

function EndpointCard({ ep, defaultOpen = false }: { ep: Endpoint; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <motion.div
            layout
            className={`rounded-2xl overflow-hidden transition-all duration-200 ${open ? "border-0 bg-white" : "border-0 bg-white hover:bg-gray-50"}`}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer group"
            >
                <MethodBadge method={ep.method} />
                <code className="text-sm font-mono text-accent font-bold flex-1 truncate transition-colors duration-150">
                    {ep.path}
                </code>
                <span className="hidden sm:block text-sm text-accent truncate max-w-[200px]">{ep.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${ep.auth === "bearer" ? "bg-lime-500" : "bg-fuchsia-500"}`}>
                        {ep.auth === "bearer" ? "Bearer" : "API Key"}
                    </span>
                    <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        size={16}
                        strokeWidth={2}
                        className={`text-accent transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    />
                </div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-accent/5 px-5 py-6 flex flex-col gap-6">
                            <div>
                                <p className="text-sm text-accent leading-relaxed font-medium">{ep.desc}</p>
                            </div>

                            {ep.params && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-3">Path Parameters</p>
                                    <div className="bg-accent/3 rounded-xl px-4">
                                        {ep.params.map(p => <ParamRow key={p.name} {...p} />)}
                                    </div>
                                </div>
                            )}

                            {ep.body && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-3">Request Body</p>
                                    <div className="bg-accent/5 rounded-xl px-4">
                                        {ep.body.map(p => <ParamRow key={p.name} {...p} />)}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-3">cURL Example</p>
                                    <CodeBlock code={ep.curl} lang="bash" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-3">Response</p>
                                    <ResponseBlock json={ep.response} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function NavItem({ section, active, onClick }: { section: Section; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 text-left ${active ? "bg-white text-accent shadow-sm" : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
        >
            <HugeiconsIcon icon={section.icon} size={14} strokeWidth={2} />
            {section.title}
        </button>
    );
}

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const scrollTo = (id: string) => {
        setActiveSection(id);
        setMobileNavOpen(false);
        sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
            },
            { rootMargin: "-30% 0px -60% 0px" }
        );
        Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-accent text-white flex flex-col">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col lg:flex-row gap-0 flex-1">
                <div className="flex-1 min-w-0 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3">
                            <MinervaLogo size={44} color="white" />
                            <div>
                                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">Documentation</h1>
                                <p className="text-white/50 text-base mt-0.5 font-medium">Interact with Minerva by command line</p>
                            </div>
                        </div>

                        <div className="p-6 pt-0 flex flex-col gap-4">
                            <p className="text-[10px] uppercase tracking-widest text-accent font-bold">Base URL</p>
                            <div className="border border-white/30 flex items-center gap-3 px-4 py-3 rounded-2xl">
                                <code className="text-sm font-mono text-white flex-1">{BASE}</code>
                                <CopyButton text={BASE} light />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-lime-500" />
                                        <p className="sm:text-xs text-[12px] font-bold text-gray-500 uppercase tracking-wider">Bearer Token</p>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed font-medium mb-3">Used for key management. Obtain from your login session.</p>
                                    <code className="sm:text-xs text-[10px] font-mono font-bold text-gray-500 px-2 py-1 rounded-lg block">
                                        Authorization: Bearer YOUR_ACCESS_TOKEN
                                    </code>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">X-API-Key</p>
                                    </div>
                                    <p className="sm:text-xs text-[12px] text-gray-400 leading-relaxed font-medium mb-3">Used for all chat and conversation endpoints.</p>
                                    <code className="sm:text-xs text-[10px] font-mono font-bold text-gray-500 px-2 py-1 rounded-lg block">
                                        X-API-Key: YOUR_API_KEY
                                    </code>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 bg-amber-500 rounded-2xl px-4 py-3">
                                <HugeiconsIcon icon={InformationCircleIcon} size={15} strokeWidth={2} className="text-white shrink-0 mt-0.5" />
                                <p className="sm:text-xs text-[10px] text-white leading-relaxed font-bold">
                                    Generate your API key first using the <code className="border border-white mx-1 px-1 bg-white sm:px-2 sm:py-1 py-px sm:rounded-md rounded text-amber-500 font-extrabold font-mono">POST</code> request on /api/keys endpoint with your Bearer token. The key is shown only once, save it immediately.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-10">
                        {SECTIONS.map((section, si) => (
                            <motion.div
                                key={section.id}
                                id={section.id}
                                ref={el => { sectionRefs.current[section.id] = el; }}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: si * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <HugeiconsIcon icon={section.icon} size={16} strokeWidth={2} className="text-white" />
                                    </div>
                                    <h2 className="sm:text-2xl text-xl font-bold tracking-tight text-white">{section.title}</h2>
                                </div>
                                <p className="sm:text-sm text-xs text-white/50 font-medium leading-relaxed mb-4 pl-11">{section.desc}</p>

                                <div className="flex flex-col gap-3">
                                    {section.endpoints.map((ep, ei) => (
                                        <EndpointCard key={ep.id} ep={ep}/>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}