"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SentIcon,
  Loading03Icon,
  Copy01Icon,
  Tick02Icon,
  Mic01Icon,
  Add01Icon,
  RefreshIcon,
  Clock02Icon,
  Cancel01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useStore } from "../store/useStore";
import { getBaseUrl } from "../connect/page";
import { formatMessageTime, getAuthHeaders } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { SpeakButton } from "@/components/Speaker";
import FlowerLoader from "@/components/Flower";

export const CodeBlock = ({ inline, className, children }: any) => {
  if (inline)
    return (
      <code className="bg-accent/20 px-1.5 py-0.5 rounded text-xs font-mono text-accent-foreground">
        {children}
      </code>
    );

  const code = String(children).replace(/\n$/, "");
  const language = className?.replace("language-", "") || "text";
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden my-4 bg-[#0d0d0d]">
      <div className="flex justify-between items-center px-4 py-2 text-[10px] uppercase tracking-wider font-bold bg-white/5 text-white/60">
        <span>{language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={14} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-gray-200 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default function Minerva() {
  const {
    conversations,
    currentId,
    addMessage,
    setCurrentId,
    setConversations,
    setMessages,
    createNewConversation,
  } = useStore();
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === currentId),
    [conversations, currentId],
  );

  const messages = activeConversation?.messages || [];

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const fetchAllConversations = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${getBaseUrl()}/chat/conversations`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setConversations(
        (data.data.conversations || []).map((c: any) => ({
          ...c,
          messages: c.messages || [],
        })),
      );
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setIsRefreshing(false);
    }
  };
  const loadChat = async (id: string) => {
    if (loadingRef.current) return;

    const storeState = useStore.getState();
    const existing = storeState.conversations.find((c) => c.id === id);
    if (existing && existing.messages && existing.messages.length > 0) {
      setCurrentId(id);
      setSidebarOpen(false);
      return;
    }

    loadingRef.current = true;
    setIsLoadingMessages(true);
    setCurrentId(id);

    try {
      const res = await fetch(`${getBaseUrl()}/chat/${id}/messages`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setMessages(id, data.data.messages || []);
    } catch {
      toast.error("Failed to load chat");
    } finally {
      loadingRef.current = false;
      setIsLoadingMessages(false);
      setSidebarOpen(false);
    }
  };
  const handleCreateNew = async () => {
    if (!titleInput.trim()) return;
    setIsCreatingConversation(true);
    try {
      const res = await fetch(`${getBaseUrl()}/chat/conversations/new`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: titleInput }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      createNewConversation({
        ...data.data.conversation,
        messages: [],
      });

      setCurrentId(data.data.conversation.id);
      setTitleInput("");
      setShowTitleInput(false);
    } catch {
      toast.error("Failed to create chat");
    }
    setIsCreatingConversation(false);
  };
  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return toast.error("Browser not supported");

    const rec = new SpeechRecognition();

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => setInput(e.results[0][0].transcript);
    rec.onend = () => setIsListening(false);

    rec.start();
  };
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !currentId) {
      toast.error("Create or select a conversation first");
      return;
    }

    const userText = input;

    addMessage(currentId, { role: "user", content: userText });

    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch(`${getBaseUrl()}/chat/${currentId}`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userText }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      addMessage(currentId, {
        role: "assistant",
        content: data.data.response,
        isStreaming: true,
      });
    } catch {
      toast.error("Failed response");
    } finally {
      setIsThinking(false);
    }
  };
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      let closest = 0;
      let closestDist = Infinity;
      messageRefs.current.forEach((el, i) => {
        if (!el) return;
        const dist = Math.abs(el.getBoundingClientRect().top - containerTop);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActiveMessageIndex(closest);
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [messages]);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      setIsLoading(true);

      try {
        const res = await fetch(`${getBaseUrl()}/chat/conversations`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        const fetchedConversations = (data.data.conversations || []).map(
          (c: any) => ({
            ...c,
            messages: c.messages || [],
          }),
        );

        setConversations(fetchedConversations);

        if (fetchedConversations.length > 0) {
          const storeCurrentId = useStore.getState().currentId;
          const idToLoad =
            storeCurrentId &&
            fetchedConversations.find(
              (c: { id: string }) => c.id === storeCurrentId,
            )
              ? storeCurrentId
              : fetchedConversations[0].id;

          setCurrentId(idToLoad);

          loadingRef.current = true;
          setIsLoadingMessages(true);

          try {
            const msgRes = await fetch(
              `${getBaseUrl()}/chat/${idToLoad}/messages`,
              {
                headers: getAuthHeaders(),
              },
            );
            const msgData = await msgRes.json();
            if (!msgData.success) throw new Error(msgData.message);
            setMessages(idToLoad, msgData.data.messages || []);
          } catch {
            toast.error("Failed to load messages");
          } finally {
            loadingRef.current = false;
            setIsLoadingMessages(false);
          }
        }
      } catch {
        toast.error("Failed to load conversations");
      } finally {
        setHydrated(true);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const hasConversations = conversations.length > 0;
  const hasMessages = messages.length > 0;
  const isAppLoading = !hydrated && isLoading;
  const isChatAreaLoading = isLoading || isLoadingMessages;

  if (isAppLoading) {
    return (
      <div className="h-screen w-screen bg-accent">
        <div className="flex flex-col h-screen items-center justify-center text-white">
          <FlowerLoader
            size="w-30 h-30"
            stepMs={80}
            pauseMs={50}
            petalWidth={4}
          />
          <p className="text-3xl font-medium">Minerva</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-linear-to-b from-gray-50 to-gray-100">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-2 left-2 z-50 p-2 rounded-xl bg-accent text-white cursor-pointer md:hidden"
      >
        <HugeiconsIcon icon={Clock02Icon} size={20} strokeWidth={2} />
      </button>

      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-white/30 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed md:relative top-0 left-0 h-full w-72 bg-white sm:border-r border-0 border-r-gray-200 sm:rounded-none rounded-r-4xl flex flex-col z-50 transition-transform duration-500 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="sm:text-3xl text-2xl text-gray-700">
            Conversations
          </span>

          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 bg-accent text-white hover:shadow-md hover:scale-110 transition-all duration-200 rounded-xl cursor-pointer"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
            </button>
          )}
          <button
            onClick={() => setShowTitleInput(!showTitleInput)}
            className="p-2 bg-accent text-white hover:shadow-md hover:scale-110 transition-all duration-200 rounded-xl cursor-pointer"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
          </button>
        </div>

        {showTitleInput && (
          <div className="p-3 relative flex flex-col">
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateNew();
              }}
              placeholder="New conversation..."
              className="border rounded-4xl p-2 text-accent text-center font-bold pl-6 text-sm ring-0 outline-0"
            />

            <button
              onClick={() => {
                setShowTitleInput(false);
                setTitleInput("");
              }}
              className="p-2 text-rose-600 absolute top-1/4 right-4 hover:bg-rose-600/20 hover:text-rose-600 transition-colors duration-300 rounded-4xl cursor-pointer"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={16}
                strokeWidth={2}
                fill="white"
                fillOpacity={0.3}
              />
            </button>

            <button
              onClick={handleCreateNew}
              disabled={isCreatingConversation || !titleInput.trim()}
              className="p-2 text-accent absolute top-1/4 left-4 hover:bg-accent hover:text-white transition-colors duration-300 rounded-4xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingConversation ? (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={16}
                  strokeWidth={2}
                  className="animate-spin scale-125"
                />
              ) : (
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  size={16}
                  strokeWidth={2}
                />
              )}
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-2">
          {hasConversations ? (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => loadChat(c.id)}
                className={`w-full text-left px-4 py-3 font-bold mb-2 cursor-pointer rounded-2xl flex items-center gap-2 text-sm ${
                  currentId === c.id
                    ? "bg-accent text-white"
                    : "bg-white hover:bg-accent/15 text-accent"
                }`}
              >
                <HugeiconsIcon icon={Clock02Icon} size={14} strokeWidth={2} />
                {c.title}
              </button>
            ))
          ) : (
            <div className="w-full border-t text-left px-7 py-2 pt-4 flex items-center gap-2 text-sm text-gray-400">
              <HugeiconsIcon icon={Clock02Icon} size={14} strokeWidth={2} />
              No Conversations
            </div>
          )}
        </div>

        <div className="p-3">
          <button
            onClick={fetchAllConversations}
            className="flex items-center gap-2 text-sm text-black/50 cursor-pointer"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              strokeWidth={2}
              fill="white"
              fillOpacity={0.3}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </aside>

      <div className="flex flex-col bg-white flex-1 min-w-0 relative">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto sm:px-5 sm:py-8 p-4 space-y-4 w-full mx-auto"
        >
          {!hasConversations && !isChatAreaLoading && (
            <div className="flex flex-col h-full items-center justify-center text-gray-400">
              <svg viewBox="0 0 500 500" className="sm:w-30 w-20 h-20 sm:h-30">
                <defs>
                  <ellipse
                    id="petal16"
                    cx="340"
                    cy="250"
                    rx="90"
                    ry="28"
                    fill="none"
                    stroke="#685AFF"
                    strokeWidth="6"
                  />
                </defs>
                <g>
                  {[...Array(16)].map((_, i) => (
                    <use
                      key={i}
                      href="#petal16"
                      transform={`rotate(${i * 22.5} 250 250)`}
                    />
                  ))}
                </g>
              </svg>
              <p className="sm:text-3xl text-xl text-accent">Minerva</p>
              <p className="sm:text-xl text-sm">
                Start Your First Conversation
              </p>
            </div>
          )}

          {isChatAreaLoading && (
            <div className="flex flex-col h-full items-center justify-center text-gray-400">
              <FlowerLoader stepMs={80} pauseMs={400} petalWidth={4} />
            </div>
          )}

          {!isChatAreaLoading && hasConversations && (
            <>
              {!hasMessages && (
                <div className="flex sm:flex-row flex-col h-full items-center justify-center">
                      <svg viewBox="0 0 500 500" className="sm:w-40 w-30 h-30 sm:h-40">
                <defs>
                  <ellipse
                    id="petal16"
                    cx="340"
                    cy="250"
                    rx="90"
                    ry="28"
                    fill="none"
                    stroke="#685AFF"
                    strokeWidth="8"
                  />
                </defs>
                <g>
                  {[...Array(16)].map((_, i) => (
                    <use
                      key={i}
                      href="#petal16"
                      transform={`rotate(${i * 22.5} 250 250)`}
                    />
                  ))}
                </g>
              </svg>
                  <div className="flex flex-col items-center">
                    <p className="sm:text-7xl text-3xl text-center text-accent">
                      Minerva
                    </p>
                  </div>
                </div>
              )}

              {hasMessages && (
                <>
                  {messages.map((msg: any, i: number) => (
                    <motion.div
                      key={msg.id || i}
                      ref={(el) => {
                        messageRefs.current[i] = el;
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start ${
                        msg.role === "user"
                          ? "justify-end"
                          : "justify-start sm:flex-row flex-col"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <svg viewBox="0 0 500 500" className="w-10 h-10">
                          <defs>
                            <ellipse
                              id="petal16"
                              cx="340"
                              cy="250"
                              rx="90"
                              ry="28"
                              fill="none"
                              stroke="#685AFF"
                              strokeWidth="8"
                            />
                          </defs>
                          <g>
                            {[...Array(16)].map((_, i) => (
                              <use
                                key={i}
                                href="#petal16"
                                transform={`rotate(${i * 22.5} 250 250)`}
                              />
                            ))}
                          </g>
                        </svg>
                      )}
                      <div className="flex flex-col gap-1 w-full">
                        <div
                          className={`flex ${msg.role === "user" ? "justify-end mt-10" : "justify-start"}`}
                        >
                          <div
                            className={
                              msg.role === "user"
                                ? "rounded-2xl text-sm bg-accent/20 text-accent font-bold px-4 py-3 shadow-inner"
                                : "text-sm sm:mt-5 mt-0 sm:border-t sm:border-gray-200 text-black p-2.5 prose prose-sm max-w-full prose-headings:text-black prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-1 prose-p:text-black prose-p:my-1 prose-li:text-black prose-li:my-0 prose-ul:my-1 prose-strong:text-black prose-code:text-accent prose-table:text-black prose-th:bg-accent/10 prose-th:text-accent prose-td:border prose-td:border-gray-200 prose-th:border prose-th:border-gray-200 prose-hr:border-gray-200"
                            }
                          >
                            {msg.role === "assistant" && msg.isStreaming ? (
                              <TypewriterMessage
                                content={msg.content || ""}
                                onCharacterTyped={scrollToBottom}
                              />
                            ) : (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => (
                                    <div className="my-1">{children}</div>
                                  ),
                                  code: CodeBlock,
                                }}
                              >
                                {msg.content || ""}
                              </ReactMarkdown>
                            )}
                          </div>
                        </div>
                        {msg.role === "user" && (
                          <span
                            className={`text-[10px] py-1 text-black font-medium px-1 ${msg.role === "user" ? "text-right" : "text-left"}`}
                          >
                            {formatMessageTime(msg.created_at)}
                          </span>
                        )}
                        {msg.role === "assistant" && (
                          <div className="flex gap-1 w-full">
                            <span
                              className={`text-[10px] py-1.5 text-black font-medium px-1 ${msg.role === "user" ? "text-right" : "text-left"}`}
                            >
                              {formatMessageTime(msg.created_at)}
                            </span>
                            <CopyButton text={msg.content} />
                            <SpeakButton content={msg.content || ""} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              {isThinking && (
                <div className="flex items-center gap-2">
                  <FlowerLoader
                    stepMs={80}
                    size="w-10 h-10"
                    pauseMs={400}
                    petalWidth={8}
                    petalColor="#685AFF"
                  />
                  <div className="text-black font-bold animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {hasMessages && !isChatAreaLoading && (
          <div className="absolute left-1 top-1/2 -translate-y-1/2 flex no-scrollbar overflow-y-auto flex-col gap-1 z-10">
            {messages.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => {
                  messageRefs.current[i]?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                  setActiveMessageIndex(i);
                }}
                className={`block w-10 h-1 rounded-full transition-all cursor-pointer duration-200 ${
                  activeMessageIndex === i
                    ? "bg-accent"
                    : "bg-accent/25 hover:bg-accent/50"
                }`}
              />
            ))}
          </div>
        )}
        {conversations.length > 0 && (
          <form
            onSubmit={handleSend}
            className="p-5 bg-white border-t flex gap-2 items-center"
          >
            <button
              type="button"
              onClick={startRecording}
              className={`p-3 rounded-full cursor-pointer ${
                isListening
                  ? "bg-accent text-white shadow-md scale-105"
                  : "text-accent bg-accent/15 shadow-inner"
              }`}
            >
              <HugeiconsIcon icon={Mic01Icon} size={16} strokeWidth={2} />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"Ask Anything..."}
              className={`flex-1 border rounded-xl px-4 py-2 text-sm outline-none ring-0 placeholder:text-black/50 text-black font-bold`}
            />

            <button
              type="submit"
              disabled={!input}
              className={`p-3 rounded-[16px] ${input ? "cursor-pointer bg-accent text-white shadow-md hover:scale-105 active:scale-95" : "cursor-not-allowed text-accent"} `}
            >
              {isThinking ? (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={16}
                  strokeWidth={1}
                  className="animate-spin"
                />
              ) : (
                <HugeiconsIcon icon={SentIcon} size={16} strokeWidth={2} />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const TypewriterMessage = ({
  content,
  onCharacterTyped,
}: {
  content: string;
  onCharacterTyped: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + content[index]);
        setIndex((prev) => prev + 1);
        onCharacterTyped();
      }, 5);
      return () => clearTimeout(timeout);
    }
  }, [index, content, onCharacterTyped]);

  const memoizedMarkdown = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ code: CodeBlock }}
      >
        {displayedText}
      </ReactMarkdown>
    ),
    [displayedText],
  );

  return <>{memoizedMarkdown}</>;
};

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast({
      type: "success",
      message: "Copied!",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="p-1.5 text-gray-700 hover:text-accent hover:bg-accent/10 rounded-lg cursor-pointer"
      aria-label="Copy message"
    >
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        size={14}
        strokeWidth={2}
      />
    </button>
  );
};
