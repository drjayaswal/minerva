"use client";

import { useRouter, usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home04Icon,
  Settings01Icon,
  Menu01Icon,
  Cancel01Icon,
  Brain01Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isHome = pathname === "/";

  const navItems = [
    { name: "Home", icon: Home04Icon, path: "/" },
    { name: "Settings", icon: Settings01Icon, path: "/settings" },
    { name: "Minerva", icon: Brain01Icon, path: "/minerva" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed top-2 right-2 z-50 p-2 rounded-xl transition cursor-pointer ${
          isHome ? "bg-white text-accent" : "bg-accent text-white"
        }`}
      >
        <HugeiconsIcon icon={Menu01Icon} size={22} strokeWidth={2} />
      </button>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-white/30 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 h-screen w-[260px] z-50 rounded-l-4xl
        transition-transform duration-500 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}
        bg-white text-accent shadow-2xl`}
      >
        <div className="flex items-center justify-between pl-8 pb-4 pr-6 pt-6">
          <div className="text-3xl text-accent">Menu</div>
          <button className="p-1 cursor-pointer" onClick={() => setOpen(false)}>
            <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2} className="hover:text-red-600"/>
          </button>
        </div>
        <div className="flex flex-col gap-2 px-4 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 px-4 cursor-pointer py-3 rounded-xl font-semibold transition-all duration-300
                ${
                  isActive
                    ? isHome
                      ? "bg-accent text-white"
                      : "bg-accent text-white"
                    : "hover:scale-[1.03] hover:bg-accent/15"
                }`}
              >
                <HugeiconsIcon icon={item.icon} size={20} strokeWidth={2} />
                {item.name}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
