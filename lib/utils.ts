import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`
});