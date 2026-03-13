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
CheckmarkCircle01Icon
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useStore } from "../store/useStore";
import { getBaseUrl } from "../connect/page";

const CodeBlock = ({ inline, className, children }: any) => {
  if (inline)
    return (
      <code className="bg-accent/10 px-1.5 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    );

  const code = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden my-3 shadow-sm">
      <div className="flex justify-between items-center px-4 py-2 text-xs bg-gray-100">
        <span>{className?.replace("language-", "") || "code"}</span>
        <button onClick={copy}>
          {copied ? (
            <HugeiconsIcon
              icon={Tick02Icon}
              size={14}
              strokeWidth={2}
              fill="white"
              fillOpacity={0.3}
            />
          ) : (
            <HugeiconsIcon
              icon={Copy01Icon}
              size={14}
              strokeWidth={2}
              fill="white"
              fillOpacity={0.3}
            />
          )}
        </button>
      </div>

      <pre className="p-4 overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default function Chat() {
  const {
    conversations,
    currentId,
    addMessage,
    setCurrentId,
    setConversations,
    setMessages,
    createNewConversation,
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

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
        credentials: "include",
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
    if (id === currentId && messages.length > 0) return;

    setIsLoading(true);
    setCurrentId(id);

    try {
      const res = await fetch(`${getBaseUrl()}/chat/${id}/messages`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setMessages(id, data.data.messages || []);
    } catch {
      toast.error("Failed to load chat");
    } finally {
      setIsLoading(false);
      setSidebarOpen(false);
    }
  };

  const handleCreateNew = async () => {
    if (!titleInput.trim()) return;

    try {
      const res = await fetch(`${getBaseUrl()}/chat/conversations/new`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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
    fetchAllConversations();
    setHydrated(true);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!currentId) return;
    const conv = conversations.find((c) => c.id === currentId);
    if (conv && conv.messages.length === 0 && !isLoading) {
      loadChat(currentId);
    }
  }, [conversations, currentId]);

  if (!hydrated) return null;

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
              placeholder="New conversation..."
              className="border rounded-4xl p-2 text-accent text-center font-bold pl-6 text-sm ring-0 outline-0"
            />

            <button
              onClick={() => setShowTitleInput(false)}
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
              className="p-2 text-accent absolute top-1/4 left-4 hover:bg-accent hover:text-white transition-colors duration-300 rounded-4xl cursor-pointer"
            >
  <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                size={16}
                strokeWidth={2}
              />
            </button>
          </div>
        )}

        <div className="overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => loadChat(c.id)}
                className={`w-full text-left px-3 py-2 cursor-pointer mb-1 flex items-center gap-2 text-sm ${
                  currentId === c.id
                    ? "bg-accent text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <HugeiconsIcon
                  icon={Clock02Icon}
                  size={14}
                  strokeWidth={2}
                />
                {c.title}
              </button>
            ))
          ) : (
            <div className="w-full border-t text-left px-7 py-2 pt-4 flex items-center gap-2 text-sm text-gray-400">
              <HugeiconsIcon
                icon={Clock02Icon}
                size={14}
                strokeWidth={2}
              />
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

      <div className="flex flex-col bg-white flex-1">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto sm:px-5 sm:py-8 p-4 space-y-4 w-full mx-auto"
        >
          {conversations.length <= 0 && (
            <div className="flex flex-col sm:h-150 h-100 items-center justify-center text-gray-400">
              <svg viewBox="0 0 500 500" className="w-20 h-20">
                <defs>
                  <path
                    id="petal"
                    d="M250 250 C420 200 420 300 250 350 C80 300 80 200 250 250"
                    fill="none"
                    stroke="#685AFF"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </defs>
                <g>
                  {[...Array(8)].map((_, i) => (
                    <use
                      key={i}
                      href="#petal"
                      transform={`rotate(${i * 45} 250 250)`}
                    />
                  ))}
                </g>
              </svg>
              <p className="text-xl text-accent">Minerva</p>
              <p className="mt-2 text-sm">Start or Select a conversation</p>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center gap-2 justify-center h-100 sm:h-150 mx-auto text-accent">
              <HugeiconsIcon
                icon={Loading03Icon}
                size={40}
                strokeWidth={1.5}
                className="animate-spin relative z-10"
              />
            </div>
          )}
          {!isLoading && (
            <>
            {conversations.length <= 0 ||
              <p className="sm:text-8xl text-4xl text-center text-accent">Minerva</p>}
              {messages.map((msg: any, i: number) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start sm:flex-row flex-col"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <svg
                      viewBox="0 0 500 500"
                      className="w-8 h-8 sm:w-10 sm:h-10"
                    >
                      <defs>
                        <path
                          id="petal-chat"
                          d="M250 250 C420 200 420 300 250 350 C80 300 80 200 250 250"
                          fill="none"
                          stroke="#685AFF"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </defs>
                      <g>
                        {[...Array(8)].map((_, i) => (
                          <use
                            key={i}
                            href="#petal-chat"
                            transform={`rotate(${i * 45} 250 250)`}
                          />
                        ))}
                      </g>
                    </svg>
                  )}

                  <div
                    className={`rounded-2xl text-sm w-fit ${
                      msg.role === "user"
                        ? "bg-accent text-white font-bold px-4 py-3 shadow-sm"
                        : "text-black p-2.5"
                    }`}
                  >
                    {msg.role === "assistant" &&
                    i === messages.length - 1 &&
                    msg.isStreaming ? (
                      <TypewriterMessage
                        content={msg.content || ""}
                        onCharacterTyped={scrollToBottom}
                      />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{ code: CodeBlock }}
                      >
                        {msg.content || ""}
                      </ReactMarkdown>
                    )}
                  </div>
                </motion.div>
              ))}
            </>
          )}

          {isThinking && (
            <>
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 500 500"
                  className="w-8 h-8 sm:w-10 sm:h-10 animate-spin"
                >
                  <defs>
                    <path
                      id="petal-chat"
                      d="M250 250 C420 200 420 300 250 350 C80 300 80 200 250 250"
                      fill="none"
                      stroke="#685AFF"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </defs>
                  <g>
                    {[...Array(8)].map((_, i) => (
                      <use
                        key={i}
                        href="#petal-chat"
                        transform={`rotate(${i * 45} 250 250)`}
                      />
                    ))}
                  </g>
                </svg>
                <div className="text-accent font-bold animate-pulse">
                  Thinking...
                </div>
              </div>
            </>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="sm:p-5 p-3 pb-0 bg-white border-t flex gap-2 items-center"
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

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
      {displayedText}
    </ReactMarkdown>
  );
};
