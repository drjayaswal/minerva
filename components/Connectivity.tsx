"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  SignalLow01Icon,
  SignalMedium01Icon,
  SignalNo01Icon,
  SignalFull01Icon,
  WifiOff01Icon
} from "@hugeicons/core-free-icons";

export const Connectivity = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const checkSpeed = () => {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      if (connection) {
        const type = connection.effectiveType;

        if (connection.saveData) {
          toast.warning("Data Saver is on", {
            id: "data-saver",
            icon: <HugeiconsIcon icon={SignalLow01Icon} size={20} strokeWidth={2} />,
          });
        }

        if (type === "slow-2g" || type === "2g") {
          toast.error("Very slow connection", {
            id: "slow-internet",
            icon: <HugeiconsIcon icon={SignalLow01Icon} size={20} strokeWidth={2} />
          });
        } else if (type === "3g") {
          toast.warning("Medium connection speed", {
            id: "slow-internet",
            icon: <HugeiconsIcon icon={SignalMedium01Icon} size={20} strokeWidth={2} />,
          });
        }
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      toast.dismiss("offline-error");
      toast.success("Back online", {
        icon: <HugeiconsIcon icon={SignalFull01Icon} size={20} strokeWidth={2} />,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Internet connection lost", {
        id: "offline-error",
        duration: Infinity,
        icon: <HugeiconsIcon icon={SignalNo01Icon} size={20} strokeWidth={2} />,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", checkSpeed);
    }

    checkSpeed();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener("change", checkSpeed);
      }
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-accent text-white p-6 text-center">
        <div className="bg-white/10 p-8 rounded-full mb-6 animate-pulse">
          <HugeiconsIcon icon={WifiOff01Icon} size={64} strokeWidth={1.5} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Offline</h1>
      </div>
    );
  }

  return <>{children}</>;
};