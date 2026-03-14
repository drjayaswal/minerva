"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Loading03Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";

export const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function Connect() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${getBaseUrl()}/auth/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json_response = await response.json();

      if (!json_response.success)
        throw new Error(json_response.detail || "Login failed");

      const { token } = json_response.data;

      localStorage.setItem("token", token);
      document.cookie = "is_logged_in=true; path=/; max-age=86400; SameSite=Lax";

      toast.success(json_response.message);
      router.push("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex flex-col justify-center items-center space-y-8 sm:space-y-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <svg viewBox="0 0 500 500" className="w-30 scale-150 h-30">
            <defs>
              <ellipse
                id="petal16"
                cx="340"
                cy="250"
                rx="90"
                ry="28"
                fill="none"
                stroke="white"
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
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-medium tracking-tight text-white">
            Minerva
          </h1>
        </div>

          <form onSubmit={handleSubmit} className="space-y-3 font-bold w-full">
            <input
              type="email"
              required
              autoFocus
              className="w-full px-4 py-3 text-white placeholder:text-white/50 focus:placeholder:text-white rounded-xl outline-none transition-all duration-300 bg-white/5 focus:bg-white/10"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 text-white placeholder:text-white/50 focus:placeholder:text-white rounded-xl outline-none transition-all duration-300 pr-12 bg-white/5 focus:bg-white/10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                  size={20}
                />
              </button>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                disabled={loading}
                className={`group relative overflow-hidden rounded-full text-white font-bold px-8 py-3
                flex items-center gap-3 transition-all duration-500 ease-in-out
                ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer hover:text-accent hover:scale-[1.02] active:scale-95"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-white transition-all duration-500 ease-out
                  ${loading ? "w-0" : "w-0 group-hover:w-full"}`}
                />

                <span
                  className={`relative z-10 flex items-center gap-2 transition-transform duration-300
                  ${loading ? "" : "group-hover:translate-x-1"}`}
                >
                  {loading ? (
                    <>
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        size={20}
                        strokeWidth={2}
                        className="animate-spin"
                      />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={20}
                        strokeWidth={2}
                      />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}