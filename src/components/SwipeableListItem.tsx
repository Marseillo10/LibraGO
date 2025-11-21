import { useState, useRef, useEffect, ReactNode } from "react";
import { Button } from "./ui/button";
import { Trash2, Archive, Check, X, MoreVertical, Heart } from "lucide-react";
import { useHapticFeedback } from "../utils/hooks";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";

interface SwipeAction {
  id: string;
  icon: ReactNode;
  label: string;
  color: string;
  bgColor: string;
  action: () => void;
}

interface SwipeableListItemProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeComplete?: (actionId: string) => void;
  className?: string;
  disabled?: boolean;
}

export function SwipeableListItem({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeComplete,
  className = "",
  disabled = false
}: SwipeableListItemProps) {
  const [revealedSide, setRevealedSide] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.8, 1, 0.8]);
  const haptic = useHapticFeedback();

  const SWIPE_THRESHOLD = 60;
  const MAX_SWIPE = 150;

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    
    if (Math.abs(offset) >= SWIPE_THRESHOLD) {
      if (offset > 0 && leftActions.length > 0) {
        // Swiped right - show left actions
        x.set(MAX_SWIPE);
        setRevealedSide('left');
        haptic.medium();
      } else if (offset < 0 && rightActions.length > 0) {
        // Swiped left - show right actions
        x.set(-MAX_SWIPE);
        setRevealedSide('right');
        haptic.medium();
      } else {
        x.set(0);
        setRevealedSide(null);
      }
    } else {
      x.set(0);
      setRevealedSide(null);
    }
  };

  const handleAction = (action: SwipeAction) => {
    haptic.success();
    action.action();
    x.set(0);
    setRevealedSide(null);
    onSwipeComplete?.(action.id);
  };

  const resetSwipe = () => {
    x.set(0);
    setRevealedSide(null);
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left Actions Background */}
      {leftActions.length > 0 && (
        <div className="absolute inset-y-0 left-0 flex items-center gap-2 px-3">
          {leftActions.map((action) => (
            <Button
              key={action.id}
              size="icon"
              className={`h-10 w-10 ${action.bgColor} ${action.color} rounded-full shadow-lg shrink-0 opacity-0 transition-opacity ${
                revealedSide === 'left' ? 'opacity-100' : ''
              }`}
              onClick={() => handleAction(action)}
              aria-label={action.label}
            >
              {action.icon}
            </Button>
          ))}
        </div>
      )}

      {/* Right Actions Background */}
      {rightActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex items-center gap-2 px-3">
          {rightActions.map((action) => (
            <Button
              key={action.id}
              size="icon"
              className={`h-10 w-10 ${action.bgColor} ${action.color} rounded-full shadow-lg shrink-0 opacity-0 transition-opacity ${
                revealedSide === 'right' ? 'opacity-100' : ''
              }`}
              onClick={() => handleAction(action)}
              aria-label={action.label}
            >
              {action.icon}
            </Button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: rightActions.length > 0 ? -MAX_SWIPE : 0, right: leftActions.length > 0 ? MAX_SWIPE : 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        className="touch-pan-y bg-white dark:bg-gray-800"
      >
        {children}
      </motion.div>

      {/* Close Button when revealed */}
      {revealedSide && (
        <button
          onClick={resetSwipe}
          className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-gray-900/90 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Tutup aksi"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Preset action configurations
export const SWIPE_ACTIONS = {
  delete: (action: () => void): SwipeAction => ({
    id: 'delete',
    icon: <Trash2 className="w-5 h-5" />,
    label: 'Hapus',
    color: 'text-white',
    bgColor: 'bg-red-500 hover:bg-red-600',
    action,
  }),
  archive: (action: () => void): SwipeAction => ({
    id: 'archive',
    icon: <Archive className="w-5 h-5" />,
    label: 'Arsipkan',
    color: 'text-white',
    bgColor: 'bg-orange-500 hover:bg-orange-600',
    action,
  }),
  markRead: (action: () => void): SwipeAction => ({
    id: 'markRead',
    icon: <Check className="w-5 h-5" />,
    label: 'Tandai Sudah Dibaca',
    color: 'text-white',
    bgColor: 'bg-green-500 hover:bg-green-600',
    action,
  }),
  favorite: (action: () => void): SwipeAction => ({
    id: 'favorite',
    icon: <Heart className="w-5 h-5" />,
    label: 'Favorit',
    color: 'text-white',
    bgColor: 'bg-pink-500 hover:bg-pink-600',
    action,
  }),
  more: (action: () => void): SwipeAction => ({
    id: 'more',
    icon: <MoreVertical className="w-5 h-5" />,
    label: 'Lainnya',
    color: 'text-white',
    bgColor: 'bg-gray-500 hover:bg-gray-600',
    action,
  }),
};
