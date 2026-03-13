"use client";

import { useRouter } from "next/navigation";
import { useStore } from "../store/useStore";

export default function Settings() {
  const { user, logout } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/connect");
  };

  if (!user) {
    return <div className="text-white p-6">Loading user settings...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 space-y-6 max-w-lg">
        <div>
          <h3 className="text-neutral-400 text-sm font-medium">Email Address</h3>
          <p className="text-lg">{user.email}</p>
        </div>
        
        <div>
          <h3 className="text-neutral-400 text-sm font-medium">User ID</h3>
          <p className="text-lg font-mono text-neutral-300">{user.id}</p>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
        >
          Logout and Clear Data
        </button>
      </div>
    </div>
  );
}