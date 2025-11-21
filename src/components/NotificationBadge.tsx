import React from "react";
import { Bell } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface NotificationBadgeProps {
  count: number;
  onClick?: () => void;
}

export function NotificationBadge({ count, onClick }: NotificationBadgeProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
          {count > 9 ? "9+" : count}
        </Badge>
      )}
    </Button>
  );
}
