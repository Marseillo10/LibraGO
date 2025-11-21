import { useState, useEffect, useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  Home,
  Search,
  BookOpen,
  User,
  Bell,
  History,
  Target,
  Settings,
  HelpCircle,
  Download,
  Heart,
  Users,
  Crown,
  Moon,
  Sun,
  LogOut,
  Book,
  TrendingUp,
  Star,
  MessageSquare,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (screen: string) => void;
  onToggleDarkMode: () => void;
  darkMode: boolean;
  currentScreen: string;
}

interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
  keywords?: string[];
}

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onToggleDarkMode,
  darkMode,
  currentScreen,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const commands: Command[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-home",
        label: "Beranda",
        icon: Home,
        action: () => {
          onNavigate("home");
          onOpenChange(false);
        },
        category: "Navigasi",
        keywords: ["home", "beranda", "utama"],
      },
      {
        id: "nav-search",
        label: "Cari Buku",
        icon: Search,
        action: () => {
          onNavigate("search");
          onOpenChange(false);
        },
        category: "Navigasi",
        keywords: ["search", "cari", "find"],
      },
      {
        id: "nav-collection",
        label: "Koleksi Saya",
        icon: BookOpen,
        action: () => {
          onNavigate("collection");
          onOpenChange(false);
        },
        category: "Navigasi",
        keywords: ["collection", "koleksi", "library"],
      },
      {
        id: "nav-profile",
        label: "Profil",
        icon: User,
        action: () => {
          onNavigate("profile");
          onOpenChange(false);
        },
        category: "Navigasi",
        keywords: ["profile", "profil", "account"],
      },
      {
        id: "nav-notifications",
        label: "Notifikasi",
        icon: Bell,
        action: () => {
          onNavigate("notifications");
          onOpenChange(false);
        },
        category: "Navigasi",
        keywords: ["notifications", "notifikasi"],
      },
      {
        id: "nav-history",
        label: "Riwayat Membaca",
        icon: History,
        action: () => {
          onNavigate("history");
          onOpenChange(false);
        },
        category: "Navigasi",
        keywords: ["history", "riwayat"],
      },
      {
        id: "nav-goals",
        label: "Target Membaca",
        icon: Target,
        action: () => {
          onNavigate("goals");
          onOpenChange(false);
        },
        category: "Navigasi",
        keywords: ["goals", "target", "tantangan"],
      },
      {
        id: "nav-community",
        label: "Komunitas",
        icon: Users,
        action: () => {
          onNavigate("community");
          onOpenChange(false);
        },
        category: "Navigasi",
        keywords: ["community", "komunitas", "social"],
      },
      {
        id: "nav-downloads",
        label: "Unduhan",
        icon: Download,
        action: () => {
          onNavigate("downloads");
          onOpenChange(false);
        },
        category: "Navigasi",
        keywords: ["downloads", "unduhan", "offline"],
      },

      // Quick Actions
      {
        id: "action-dark-mode",
        label: darkMode ? "Mode Terang" : "Mode Gelap",
        icon: darkMode ? Sun : Moon,
        action: () => {
          onToggleDarkMode();
          onOpenChange(false);
        },
        category: "Aksi Cepat",
        keywords: ["dark", "light", "theme", "gelap", "terang"],
      },
      {
        id: "action-upgrade",
        label: "Upgrade ke Premium",
        icon: Crown,
        action: () => {
          onNavigate("subscription");
          onOpenChange(false);
        },
        category: "Aksi Cepat",
        keywords: ["premium", "upgrade", "subscription"],
      },

      // Settings & Help
      {
        id: "settings",
        label: "Pengaturan",
        icon: Settings,
        action: () => {
          onNavigate("settings");
          onOpenChange(false);
        },
        category: "Sistem",
        keywords: ["settings", "pengaturan", "preferences"],
      },
      {
        id: "help",
        label: "Bantuan & Dukungan",
        icon: HelpCircle,
        action: () => {
          onNavigate("help");
          onOpenChange(false);
        },
        category: "Sistem",
        keywords: ["help", "bantuan", "support"],
      },

      // Recent Books (Mock)
      {
        id: "book-1",
        label: "Lanjutkan: Atomic Habits",
        icon: Book,
        action: () => {
          onNavigate("reader");
          onOpenChange(false);
        },
        category: "Buku Terakhir",
        keywords: ["atomic", "habits"],
      },
      {
        id: "book-2",
        label: "Lanjutkan: Clean Code",
        icon: Book,
        action: () => {
          onNavigate("reader");
          onOpenChange(false);
        },
        category: "Buku Terakhir",
        keywords: ["clean", "code"],
      },
      {
        id: "book-3",
        label: "Lanjutkan: The Pragmatic Programmer",
        icon: Book,
        action: () => {
          onNavigate("reader");
          onOpenChange(false);
        },
        category: "Buku Terakhir",
        keywords: ["pragmatic", "programmer"],
      },

      // Quick Filters
      {
        id: "filter-trending",
        label: "Lihat Buku Trending",
        icon: TrendingUp,
        action: () => {
          onNavigate("search");
          onOpenChange(false);
        },
        category: "Filter Cepat",
        keywords: ["trending", "popular"],
      },
      {
        id: "filter-favorites",
        label: "Lihat Favorit",
        icon: Star,
        action: () => {
          onNavigate("collection");
          onOpenChange(false);
        },
        category: "Filter Cepat",
        keywords: ["favorites", "favorit", "liked"],
      },
    ],
    [darkMode, onNavigate, onToggleDarkMode, onOpenChange]
  );

  const filteredCommands = useMemo(() => {
    if (!search) return commands;

    return commands.filter((command) => {
      const searchLower = search.toLowerCase();
      const labelMatch = command.label.toLowerCase().includes(searchLower);
      const keywordsMatch = command.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(searchLower)
      );
      return labelMatch || keywordsMatch;
    });
  }, [search, commands]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((command) => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });
    return groups;
  }, [filteredCommands]);

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Cari dan navigasi cepat ke berbagai fitur LibraGO"
    >
      <CommandInput
        placeholder="Ketik perintah atau cari..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>

        {Object.entries(groupedCommands).map(([category, items], index) => (
          <div key={category}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={category}>
              {items.map((command) => {
                const Icon = command.icon;
                return (
                  <CommandItem
                    key={command.id}
                    onSelect={command.action}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{command.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>

      <div className="border-t p-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              ⌘K
            </kbd>{" "}
            untuk membuka
          </span>
          <span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              ESC
            </kbd>{" "}
            untuk tutup
          </span>
        </div>
        <span className="text-[10px]">{filteredCommands.length} perintah</span>
      </div>
    </CommandDialog>
  );
}
