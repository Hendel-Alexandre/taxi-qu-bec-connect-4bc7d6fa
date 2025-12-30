"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Route, 
  Map as MapIcon, 
  Settings, 
  LogOut, 
  Bell, 
  ChevronRight,
  Fuel,
  Package,
  Building2,
  Play,
  HelpCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MENU_ITEMS = [
  { icon: Package, label: "Courses", href: "/admin", badge: null },
  { icon: Fuel, label: "Chauffeurs", href: "/admin/chauffeurs", hasSubmenu: true },
  { icon: Route, label: "Véhicules", href: "/admin/vehicules" },
  { icon: Users, label: "Personnel", href: "/admin/personnel" },
  { icon: Building2, label: "Paramètres", href: "/admin/settings" },
];

const BOTTOM_MENU = [
  { icon: Bell, label: "Notification", href: "/admin/notifications" },
  { icon: Play, label: "Chat", href: "/admin/chat" },
  { icon: Play, label: "Tutorial videos", href: "/admin/tutorials" },
  { icon: HelpCircle, label: "Help center", href: "/admin/help" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [adminName, setAdminName] = useState("Admin");
  const supabase = createClient();

  useEffect(() => {
    async function getAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setAdminName(user.user_metadata.full_name);
      } else if (user?.email) {
        setAdminName(user.email.split('@')[0]);
      }
    }
    getAdmin();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <div className="flex h-screen bg-[#F5F5F5] overflow-hidden">
      {/* Dark Sidebar */}
      <aside className="w-[220px] bg-[#1C1C1E] text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FFD60A] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">🚕</span>
            </div>
            <span className="font-semibold text-base tracking-tight">Taxi Québec</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group text-[13px] ${
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-[18px] h-[18px]" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.hasSubmenu && (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-white/10" />

        {/* Bottom Menu */}
        <div className="py-4 px-3 space-y-1">
          {BOTTOM_MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all text-[13px]"
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{adminName}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
