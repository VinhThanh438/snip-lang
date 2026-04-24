"use client";

import { BookOpen, Layers, Languages, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const menuItems = [
    { name: "Câu đã lưu", href: "/dashboard", icon: BookOpen },
    { name: "Chủ đề", href: "/dashboard/topics", icon: Layers },
    { name: "Từ vựng", href: "/dashboard/vocabulary", icon: Languages },
    { name: "Cài đặt", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login?logout=true";
  };

  if (!isClient)
    return (
      <aside className="w-64 border-r border-white/5 glass-panel h-screen flex-shrink-0" />
    );

  return (
    <aside className="w-64 border-r border-white/5 glass-panel flex flex-col h-screen flex-shrink-0 relative z-50">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <span className="text-xl font-bold tracking-tighter text-gradient">
          ✦ SNIP-LANG
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-primary" : ""}`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          id="sl-logout-btn"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
