"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Loading03Icon, ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";

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
      const data = json_response.data;

      if (!json_response.success) throw new Error(json_response.detail);

      toast.success(json_response.message);

      document.cookie = `session=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem("user_email", data.email);
      
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[320px]">
        <div className="max-w-xl flex flex-col justify-center items-center space-y-6">
          <div className="text-8xl text-white">Minerva</div>

          <form onSubmit={handleSubmit} className="space-y-2 font-bold w-full">
            <input
              type="email"
              required
              autoFocus
              className="w-full px-4 py-3 text-white placeholder:text-white/50 focus:placeholder:text-white rounded-xl outline-none transition-all duration-300"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 text-white placeholder:text-white/50 focus:placeholder:text-white rounded-xl outline-none transition-all duration-300 pr-12"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/50 hover:text-white transition-colors"
              >
                <HugeiconsIcon icon={showPassword ? ViewOffSlashIcon : ViewIcon} size={20} />
              </button>
            </div>

            <button
              disabled={loading}
              className={`group relative overflow-hidden rounded-4xl text-white font-bold px-5 py-3
              flex items-center gap-3 mx-auto transition-all duration-500 ease-in-out
              ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "cursor-pointer hover:text-accent hover:scale-[1.02]"
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
          </form>
        </div>
      </div>
    </div>
  );
}