import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import {
  Bell,
  Clock,
  Target,
  Settings,
  HelpCircle,
  Download,
  Heart,
  Users,
  Crown,
  LogOut,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

interface MobileMenuProps {
  userName: string;
  userEmail: string;
  isPremium: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (screen: string) => void;
  onUpgrade: () => void;
  onLogout: () => void;
}

export function MobileMenu({
  userName,
  userEmail,
  isPremium,
  open,
  onOpenChange,
  onNavigate,
  onUpgrade,
  onLogout,
}: MobileMenuProps) {
  const handleNavigate = (screen: string) => {
    onNavigate(screen);
    onOpenChange(false);
  };

  const menuSections = [
    {
      title: "Features",
      items: [
        { id: "notifications", icon: Bell, label: "Notifikasi", badge: 3 },
        { id: "history", icon: Clock, label: "Riwayat & Statistik" },
        { id: "goals", icon: Target, label: "Target & Tantangan" },
        { id: "downloads", icon: Download, label: "Download" },
        { id: "community", icon: Users, label: "Komunitas" },
        { id: "publisher", icon: LayoutDashboard, label: "Publisher Dashboard" },
      ],
    },
    {
      title: "System",
      items: [
        { id: "settings", icon: Settings, label: "Pengaturan" },
        { id: "help", icon: HelpCircle, label: "Bantuan" },
        { id: "support", icon: Heart, label: "Dukung Kami" },
      ],
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 z-[100] bg-white dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-left">Menu</SheetTitle>
          <SheetDescription className="text-left">
            Akses fitur, pengaturan, dan navigasi aplikasi
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {userEmail}
              </p>
            </div>
            {isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>

          {/* Upgrade Button */}
          {!isPremium && (
            <Button
              onClick={() => {
                onUpgrade();
                onOpenChange(false);
              }}
              className="w-full mt-3 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Crown className="w-4 h-4" />
              Upgrade ke Premium
            </Button>
          )}
        </div>

        <Separator />

        {/* Menu Sections */}
        <div className="px-6 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-300px)]">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Logout Button */}
        <div className="p-6">
          <Button
            variant="outline"
            onClick={() => {
              onLogout();
              onOpenChange(false);
            }}
            className="w-full gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
