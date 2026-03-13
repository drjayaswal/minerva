"use client";

import { Logout01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const disconnect = () => {
    showToast({
      type: "info",
      message: "You will be disconnected",
      actionLabel: "Disconnect",
      onAction: () => {
        document.cookie =
          "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        showToast({
          type: "success",
          message: "Disconnected successfully",
        });
        router.push("/connect");
      },
    });
  };

  return (
    <div className="min-h-screen bg-accent text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center overflow-hidden">
      <div className="w-full max-w-4xl flex flex-col justify-center items-center space-y-8 sm:space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center">
             <svg 
              viewBox="0 0 500 500" 
              className="w-full h-full scale-125 sm:scale-150 md:scale-200"
            >
              <defs>
                <path
                  id="petal"
                  d="M250 250 C420 200 420 300 250 350 C80 300 80 200 250 250"
                  fill="none"
                  stroke="white"
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
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-medium tracking-tight text-white">
            Minerva
          </h1>
        </div>
        <div className="flex items-center justify-center font-bold w-full px-2">
          <div className="flex flex-row rounded-full overflow-hidden border-2 border-white w-auto">
            <button
              onClick={() => router.push("/chat")}
              className="group relative overflow-hidden cursor-pointer text-white px-4 sm:px-8 py-3 sm:py-4
              flex items-center justify-center transition-all duration-500 ease-in-out hover:text-accent"
            >
              <div className="absolute inset-y-0 left-0 w-0 bg-white transition-all duration-500 ease-in-out group-hover:w-full" />
              <span className="flex items-center gap-2 relative z-10 text-xs sm:text-base whitespace-nowrap">
                Get Started 
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2} />
              </span>
            </button>
            
            <div className="w-0.5 bg-white shrink-0"></div>
            
            <button
              onClick={disconnect}
              className="group relative overflow-hidden cursor-pointer text-white px-4 sm:px-8 py-3 sm:py-4
              flex items-center justify-center transition-all duration-500 ease-in-out hover:text-accent"
            >
              <div className="absolute inset-y-0 right-0 w-0 bg-white transition-all duration-500 ease-in-out group-hover:w-full" />
              <span className="flex items-center gap-2 relative z-10 text-xs sm:text-base whitespace-nowrap">
                Disconnect
                <HugeiconsIcon icon={Logout01Icon} size={18} strokeWidth={2} />
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}