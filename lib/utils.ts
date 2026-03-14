import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`
});
export const formatMessageTime = (date: string | number | undefined) => {
  const d = typeof date === 'string' ? new Date(date + 'Z') : new Date(date || Date.now());
  
  if (isNaN(d.getTime())) return "--:--";

  const now = new Date();
  
  const isToday = 
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate();

  if (isToday) {
    return d.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else {
    return d.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
};