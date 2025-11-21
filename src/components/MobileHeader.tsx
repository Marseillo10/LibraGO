import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Moon, Sun, Menu } from "lucide-react";
import { LibraGoLogo } from "./LibraGoLogo";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showLogo?: boolean;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  showDarkModeToggle?: boolean;
  rightElement?: React.ReactNode;
  notificationCount?: number;
}

export function MobileHeader({
  title,
  showBack = false,
  onBack,
  showLogo = false,
  darkMode = false,
  onToggleDarkMode,
  showDarkModeToggle = false,
  rightElement,
  notificationCount = 0,
}: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1">
          {showBack && onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {showLogo ? (
            <LibraGoLogo size="sm" showText={true} />
          ) : title ? (
            <h1 className="text-lg text-gray-900 dark:text-white">{title}</h1>
          ) : null}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {showDarkModeToggle && onToggleDarkMode && (
            <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </Button>
          )}
          {rightElement}
        </div>
      </div>
    </div>
  );
}
