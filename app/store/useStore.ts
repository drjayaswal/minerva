import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatStore {
  conversations: Conversation[];
  currentId: string | null;

  setConversations: (conversations: Conversation[]) => void;
  setCurrentId: (id: string | null) => void;
  setMessages: (convId: string, messages: Message[]) => void;
  addMessage: (convId: string, message: Message) => void;
  createNewConversation: (newConv: Conversation) => void;
}

export const useStore = create<ChatStore>()(
  persist(
    (set) => ({
      conversations: [],
      currentId: null,

      setConversations: (conversations) =>
        set({
          conversations: conversations.map((c: any) => ({
            ...c,
            messages: c.messages || [],
          })),
        }),

      setCurrentId: (id) => set({ currentId: id }),

      setMessages: (convId, messages) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId ? { ...c, messages: messages || [] } : c,
          ),
        })),

      addMessage: (convId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: Array.isArray(c.messages)
                    ? [...c.messages, message]
                    : [message],
                }
              : c,
          ),
        })),

      createNewConversation: (newConv) =>
        set((state) => ({
          conversations: [
            ...state.conversations,
            {
              ...newConv,
              messages: newConv.messages || [],
            },
          ],
        })),
    }),
    { name: "lithium-storage" },
  ),
);
