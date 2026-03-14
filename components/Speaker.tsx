"use client";
import { HugeiconsIcon } from "@hugeicons/react";
import { VolumeHighIcon } from "@hugeicons/core-free-icons";
import { useToast } from "@/components/Toast";

import { useState } from "react";

export function SpeakButton({ content }: { content: string }) {
  const [speaking, setSpeaking] = useState(false);
  const { showToast } = useToast();
  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      showToast({
        type: "error",
        message: "TTS not supported",
      });
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const plain = content.replace(/[#*`_~>\-]+/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(plain);

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);

    utterance.onerror = (event: any) => {
      if (event.error === "interrupted") {
        setSpeaking(false);
        return;
      }

      setSpeaking(false);
      showToast({ type: "error", message: "Speech failed" });
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleSpeak}
      className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
        speaking
          ? "bg-accent text-white scale-105"
          : "text-gray-700 hover:text-accent hover:bg-accent/10"
      }`}
    >
      <HugeiconsIcon
        icon={VolumeHighIcon}
        size={14}
        strokeWidth={2}
      />
    </button>
  );
}
