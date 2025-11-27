import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { LibraGoLogo } from "./LibraGoLogo";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import {
  Home,
  Search,
  BookOpen,
  User,
  Crown,
  LogOut,
  Bell,
  Clock,
  Target,
  Settings,
  HelpCircle,
  Download,
  Heart,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  ChevronsDown,
  LayoutDashboard,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DesktopSidebarProps {
  active: string;
  onNavigate: (page: string) => void;
  onUpgrade: () => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  isPremium: boolean;
  collapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

export function DesktopSidebar({
  active,
  onNavigate,
  onUpgrade,
  onLogout,
  userName,
  userEmail,
  isPremium,
  collapsed,
  onToggleCollapse,
}: DesktopSidebarProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true); // Always show on mount
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset indicator setiap kali component mount
    setShowScrollIndicator(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

        // Hide indicator when user scrolls more than 50px
        if (scrollTop > 50) {
          setShowScrollIndicator(false);
        }

        // Also hide if content doesn't need scrolling
        if (scrollHeight <= clientHeight + 50) {
          setShowScrollIndicator(false);
        }
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const mainNavItems = [
    { id: "home", icon: Home, label: "Beranda" },
    { id: "search", icon: Search, label: "Pencarian" },
    { id: "collection", icon: BookOpen, label: "Koleksi Saya" },
  ];

  const featureNavItems = [
    { id: "notifications", icon: Bell, label: "Notifikasi", badge: 3 },
    { id: "history", icon: Clock, label: "Riwayat & Statistik" },
    { id: "goals", icon: Target, label: "Target & Tantangan" },
    { id: "downloads", icon: Download, label: "Download" },
    { id: "community", icon: Users, label: "Komunitas" },
    { id: "publisher", icon: LayoutDashboard, label: "Publisher Dashboard" },
  ];

  const systemNavItems = [
    { id: "settings", icon: Settings, label: "Pengaturan" },
    { id: "help", icon: HelpCircle, label: "Bantuan" },
    { id: "support", icon: Heart, label: "Dukung Kami" },
  ];

  return (
    <TooltipProvider>
      <div className={`fixed left-0 top-0 bottom-0 ${collapsed ? "w-20" : "w-64"} bg-blue-50 dark:bg-gray-900/80 backdrop-blur-md border-r border-blue-100 dark:border-gray-800 flex flex-col transition-all duration-300 z-40`}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => onToggleCollapse(!collapsed)}
          className={`fixed ${collapsed ? "left-[68px]" : "left-[244px]"} top-6 z-[100] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-white dark:border-gray-900`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>

        {/* Logo */}
        <div className={`${collapsed ? "p-4" : "p-6"} border-b border-gray-200 dark:border-gray-800 flex items-center justify-center`}>
          {collapsed ? (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          ) : (
            <LibraGoLogo size="sm" showText={true} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto relative" ref={scrollContainerRef}>
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const button = (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} ${collapsed ? "px-3" : "px-4"} py-3 rounded-lg transition-colors ${isActive
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );

              return collapsed ? (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                button
              );
            })}
          </div>

          <Separator />

          {/* Feature Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-4 text-xs text-gray-500 dark:text-gray-500 mb-2">
                FITUR
              </p>
            )}
            {featureNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const button = (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} ${collapsed ? "px-3" : "px-4"} py-3 rounded-lg transition-colors relative ${isActive
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <Icon className="w-5 h-5" />
                    {collapsed && item.badge && item.badge > 0 && (
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </div>
                    )}
                  </div>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 min-w-[20px] h-5">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              );

              return collapsed ? (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                button
              );
            })}
          </div>

          <Separator />

          {/* System Navigation */}
          <div className="space-y-1">
            {systemNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const button = (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} ${collapsed ? "px-3" : "px-4"} py-3 rounded-lg transition-colors ${isActive
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );

              return collapsed ? (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                button
              );
            })}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 relative">
          {/* Scroll Indicator */}
          {showScrollIndicator && (
            <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none z-10">
              <div className="bg-gradient-to-b from-transparent via-blue-600/20 to-blue-600/40 dark:via-blue-400/20 dark:to-blue-400/40 px-4 py-2 rounded-lg shadow-lg animate-bounce">
                <div className="flex flex-col items-center gap-1">
                  <ChevronsDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {!collapsed && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">Scroll untuk lebih banyak</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => onNavigate("profile")}
                    className={`rounded-full transition-all hover:ring-4 hover:ring-blue-400 hover:shadow-lg cursor-pointer group relative ${active === "profile" ? "ring-4 ring-blue-500 shadow-lg" : ""
                      }`}
                  >
                    <Avatar className="w-10 h-10 pointer-events-none group-hover:scale-110 transition-transform">
                      <AvatarFallback className="bg-blue-600 text-white group-hover:bg-blue-700 transition-colors">
                        {userName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      <UserCircle className="w-3 h-3" />
                    </div>
                  </button>
                  <Button
                    onClick={onLogout}
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-xs">
                  <p className="font-medium">{userName}</p>
                  <p className="text-gray-500">{userEmail}</p>
                  <p className="text-blue-600 mt-1 flex items-center gap-1">
                    <UserCircle className="w-3 h-3" />
                    Klik untuk lihat profil
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <button
                onClick={() => onNavigate("profile")}
                className={`group w-full flex items-center gap-3 mb-3 p-3 rounded-lg transition-all duration-200 cursor-pointer border-2 ${active === "profile"
                  ? "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 shadow-md"
                  : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm"
                  }`}
              >
                <Avatar className="pointer-events-none group-hover:scale-110 transition-transform">
                  <AvatarFallback className="bg-blue-600 text-white pointer-events-none group-hover:bg-blue-700 transition-colors">
                    {userName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left pointer-events-none">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {userName}
                    </p>
                    {isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs px-1.5 py-0">
                        <Crown className="w-2.5 h-2.5" />
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                    {userEmail}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <UserCircle className="w-3 h-3" />
                    Lihat Profil Lengkap
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pointer-events-none" />
              </button>
              <Button
                onClick={onLogout}
                variant="outline"
                className="w-full text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}