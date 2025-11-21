import { Home, Search, BookOpen, User, Menu, Clock, Star, Heart } from "lucide-react";
import { Badge } from "./ui/badge";

interface BottomNavProps {
  active: string;
  onNavigate: (page: string) => void;
  onMenuOpen?: () => void;
  notificationCount?: number;
}

export function BottomNav({ active, onNavigate, onMenuOpen, notificationCount = 0 }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Beranda", description: "Jelajahi buku baru dan lanjutkan bacaan Anda" },
    { id: "search", icon: Search, label: "Cari", description: "Temukan buku berdasarkan judul, penulis, atau genre" },
    { id: "collection", icon: Star, label: "Koleksi", description: "Kelola dan atur buku favorit Anda" },
    { id: "profile", icon: User, label: "Profile", description: "Kelola akun, statistik bacaan, dan pengaturan profil" },
  ];

  const menuDescription = "Akses pengaturan, notifikasi, dan fitur lainnya";
  
  // Get active item description
  const activeItem = active === "menu" 
    ? { description: menuDescription }
    : navItems.find(item => item.id === active) || navItems[0];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 z-50 shadow-lg pb-safe">
      <div className="max-w-md mx-auto">
        {/* Dynamic Description - Shows ABOVE icons */}
        <div className="px-6 pt-2 pb-1 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs text-center text-gray-600 dark:text-gray-400 leading-relaxed min-h-[32px] flex items-center justify-center">
            {activeItem.description}
          </p>
        </div>

        <div className="grid grid-cols-5">
          {/* Menu Button */}
          <button
            onClick={onMenuOpen}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 px-2 transition-all relative active:scale-95 ${
              active === "menu"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
            aria-label="Menu utama"
          >
            {/* Active indicator for menu */}
            {active === "menu" && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}

            <div className="relative">
              <Menu className={`w-6 h-6 transition-transform ${active === "menu" ? 'scale-110' : ''}`} />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-xs flex items-center justify-center p-0"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </div>
            <span className={`text-[10px] leading-tight transition-all ${
              active === "menu" ? 'font-semibold' : 'font-normal'
            }`}>
              Menu
            </span>
          </button>

          {/* Main Navigation */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-2 transition-all relative group active:scale-95 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
                aria-label={item.description}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
                
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] leading-tight transition-all ${
                  isActive ? 'font-semibold' : 'font-normal'
                }`}>
                  {item.label}
                </span>

                {/* Tooltip on long press (desktop hover) */}
                <div className="hidden lg:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipe hint - shows on first time */}
      <style>{`
        @supports (padding: max(0px)) {
          .pb-safe {
            padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
}
