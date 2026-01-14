"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, Bell, Settings, LogOut } from "lucide-react";

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
  { id: "chat", label: "Chats", path: "/chat", icon: Home },
  { id: "search", label: "Explore", path: "/search", icon: Search },
  { id: "requests", label: "Requests", path: "/requests", icon: Bell },
  // settings opens the modal so path can be empty or the settings route if you have one
  { id: "settings", label: "Settings", path: "", icon: Settings },
] as const;

export function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { currentUser } = useChatStore();

  // coerce to the minimal shape our Sidebar expects
  const user = (currentUser ?? null) as UserLike | null;

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const handleNavClick = React.useCallback(
    (id: string, path: string) => {
      if (id === "settings") {
        setIsSettingsOpen(true);
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

  return (
    <>
      <motion.aside
        layout
        className="flex flex-col h-full bg-[#050505] border-r border-white/5 z-50"
        style={{ width: 72, minWidth: 72 }}
        role="navigation"
        aria-label="Primary sidebar"
      >
        <LogoSection />

        <NavMenu
          pathname={pathname}
          onNavClick={handleNavClick}
          isSettingsOpen={isSettingsOpen}
        />

        <SidebarFooter currentUser={user} onLogout={handleLogout} />
      </motion.aside>

      {/* SETTINGS MODAL: use onOpenChange (shadcn/dialog pattern) to avoid TS mismatch */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={(open) => setIsSettingsOpen(open)}
        currentUser={user}
      />
    </>
  );
}

function LogoSection() {
  return (
    <div className="flex justify-center py-4 shrink-0">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg cursor-pointer border border-white/10 hover:scale-105 transition-transform">
        <span className="text-xl font-bold text-white">V</span>
      </div>
    </div>
  );
}

interface NavMenuProps {
  pathname: string;
  onNavClick: (id: string, path: string) => void;
  isSettingsOpen: boolean;
}

function NavMenu({ pathname, onNavClick, isSettingsOpen }: NavMenuProps) {
  return (
    <div className="flex-1 flex flex-col items-center gap-3 py-4" role="menu" aria-label="Main navigation">
      <TooltipProvider delayDuration={0}>
        {NAV_ITEMS.map(({ id, path, icon: Icon, label }) => {
          const isActive = id === "settings" ? isSettingsOpen : pathname.startsWith(path);

          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
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
                      "h-10 w-10 rounded-xl transition-all duration-200",
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
                  </Button>
                </div>
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
