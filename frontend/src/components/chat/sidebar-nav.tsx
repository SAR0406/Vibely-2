"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Bell, Settings, LogOut, Calendar, Shield, Flag, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/design-system/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/design-system/avatar";

import { useChatStore } from "@/store/use-chat-store";
import { SettingsModal } from "../settings/settings-modal";
import { ReportModal } from "../shared/report-modal";
import { RequestsPanel } from "./requests-panel";
import { friendsApi } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Minimal user shape used locally so this component doesn't depend on
 * your full app User type. Replace with your real User type if available.
 */
type UserLike = {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Nexus Core", path: "/dashboard", icon: Home },
  { id: "chat", label: "Sync Grid", path: "/chat", icon: Search },
  { id: "notifications", label: "Alert Matrix", path: "", icon: Bell },
  { id: "events", label: "Neural Clusters", path: "/events", icon: Calendar },
  { id: "nexus", label: "Quantum Hub", path: "/nexus", icon: Shield },
  { id: "settings", label: "Interface Settings", path: "", icon: Settings },
] as const;

export function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { currentUser } = useChatStore();

  // coerce to the minimal shape our Sidebar expects
  const user = (currentUser ?? null) as UserLike | null;

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [requestCount, setRequestCount] = React.useState(0);

  React.useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        const { data } = await friendsApi.getPendingRequests();
        setRequestCount(data.length);
      } catch (error) {
        console.error("Failed to fetch request count:", error);
      }
    };
    fetchRequestCount();
    const interval = setInterval(fetchRequestCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = React.useCallback(
    (id: string, path: string) => {
      if (id === "settings") {
        setIsSettingsOpen(true);
      } else if (id === "notifications") {
        // Handled directly in NavMenu via Dropdown
      } else if (path) {
        router.push(path);
      }
    },
    [router]
  );

  const handleLogout = React.useCallback(() => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      /* ignore localStorage errors in SSR edge cases */
    }
    router.push("/login");
  }, [router]);

  React.useEffect(() => {
    (window as any).openReportApp = () => setIsReportOpen(true);
    return () => { delete (window as any).openReportApp; };
  }, []);

  return (
    <>
      <motion.aside
        layout
        className="flex flex-col h-full bg-[#050505] border-r border-white/5 z-50 noise-texture relative"
        style={{ width: 80, minWidth: 80 }}
        role="navigation"
        aria-label="Primary sidebar"
      >
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent" />
        <LogoSection />

        <NavMenu
          pathname={pathname}
          onNavClick={handleNavClick}
          isSettingsOpen={isSettingsOpen}
          requestCount={requestCount}
        />

        <SidebarFooter currentUser={user} onLogout={handleLogout} />
      </motion.aside>

      {/* SETTINGS MODAL: use onOpenChange (shadcn/dialog pattern) to avoid TS mismatch */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={(open) => setIsSettingsOpen(open)}
        currentUser={user}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        type="app"
      />
    </>
  );
}

function LogoSection() {
  return (
    <div className="flex justify-center py-8 shrink-0">
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-500/40 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="w-12 h-12 rounded-2xl bg-[#050505] border border-white/10 flex items-center justify-center shadow-2xl cursor-pointer relative z-10 hover:border-indigo-500/50 transition-all duration-500">
          <div className="w-6 h-6 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <span className="text-xs font-black text-black">V</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavMenuProps {
  pathname: string;
  onNavClick: (id: string, path: string) => void;
  isSettingsOpen: boolean;
  requestCount: number;
}

function NavMenu({ pathname, onNavClick, isSettingsOpen, requestCount }: NavMenuProps) {
  return (
    <div className="flex-1 flex flex-col items-center gap-3 py-4" role="menu" aria-label="Main navigation">
      <TooltipProvider delayDuration={0}>
        {NAV_ITEMS.map(({ id, path, icon: Icon, label }) => {
          const isActive = id === "settings" ? isSettingsOpen : pathname.startsWith(path);

          const button = (
            <div className="relative w-full flex justify-center group">
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavClick(id, path)}
                className={cn(
                  "h-10 w-10 rounded-xl transition-all duration-200 relative",
                  isActive ? "bg-indigo-500/10 text-indigo-100" : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
                )}
                aria-pressed={isActive}
                aria-label={label}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )}
                />

                {id === "notifications" && requestCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center border-2 border-[#050505] animate-in zoom-in duration-300">
                    {requestCount}
                  </span>
                )}
              </Button>
            </div>
          );

          if (id === "notifications") {
            return (
              <DropdownMenu key={id}>
                <DropdownMenuTrigger asChild>
                  {button}
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-80 bg-[#0a0a0a] border-white/10 p-0 shadow-2xl ml-4 overflow-hidden rounded-2xl">
                  <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-sm font-bold text-white">Friend Requests</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Alert Matrix Status</p>
                  </div>
                  <div className="h-[400px]">
                    <RequestsPanel />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                {button}
              </TooltipTrigger>

              <TooltipContent side="right" className="bg-[#18181b] border-white/10 text-zinc-100 font-medium px-3 py-1.5 ml-2">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}

interface SidebarFooterProps {
  currentUser: UserLike | null;
  onLogout: () => void;
}

function SidebarFooter({ currentUser, onLogout }: SidebarFooterProps) {
  return (
    <div className="py-4 flex flex-col items-center gap-4 shrink-0">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-10 w-10 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </TooltipTrigger>

          <TooltipContent side="right" className="bg-[#18181b] border-white/10 text-red-400 font-medium ml-2">
            Logout
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window as any).openReportApp && (window as any).openReportApp()}
              className="h-10 w-10 rounded-xl text-zinc-500 hover:text-orange-400 hover:bg-orange-400/10 transition-all"
              aria-label="Report Issue"
            >
              <Flag className="h-5 w-5" />
            </Button>
          </TooltipTrigger>

          <TooltipContent side="right" className="bg-[#18181b] border-white/10 text-orange-400 font-medium ml-2">
            Report Anomaly
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="relative p-0.5 rounded-full border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={currentUser?.name ? `Open profile for ${currentUser.name}` : "Open profile"}
              onKeyDown={(e) => {
                // allow keyboard "Enter" and "Space" to open the profile tooltip focus.
                if (e.key === "Enter" || e.key === " ") {
                  e.currentTarget.click();
                }
              }}
            >
              <Avatar className="h-10 w-10 bg-zinc-900">
                <AvatarImage src={currentUser?.avatar ?? undefined} alt={currentUser?.name ?? "User avatar"} />
                <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                  {currentUser?.name?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>

              {/* small online indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#050505] rounded-full" />
            </div>
          </TooltipTrigger>

          <TooltipContent side="right" className="bg-[#18181b] border-white/10 text-zinc-100 font-medium ml-2">
            {currentUser?.name || "Profile"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
