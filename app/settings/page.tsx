"use client";

import { useRouter } from "next/navigation";
import { useStore } from "../store/useStore";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Database01Icon, 
  MessageEdit01Icon, 
  Delete02Icon, 
} from "@hugeicons/core-free-icons";

export default function Settings() {
  const { conversations, setCurrentId } = useStore();
  const handleClearData = () => {
    localStorage.removeItem("lithium-storage");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-accent text-white p-6 sm:p-10 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl font-medium mb-8">Settings</h1>
        
        <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl">
            <HugeiconsIcon icon={MessageEdit01Icon} size={32} className="text-accent" />
            <div>
              <h3 className="text-accent text-xs uppercase tracking-wider font-bold">Total Conversations</h3>
              <p className="text-lg text-accent font-medium">{conversations.length} saved</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl">
            <HugeiconsIcon icon={Database01Icon} size={32} className="text-accent" />
            <div>
              <h3 className="text-accent text-xs uppercase tracking-wider font-bold">Storage State</h3>
              <p className="text-sm text-accent">Local persistent storage is active</p>
            </div>
          </div>

          <button 
            onClick={handleClearData}
            className="w-full py-4 text-white rounded-2xl font-bold transition-all hover:bg-rose-600/80 hover:text-white cursor-pointer flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={Delete02Icon} size={20} />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}