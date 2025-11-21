import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Bookmark, Download, Info, Plus, Check, X } from "lucide-react";
import { useSwipeGestures, useHapticFeedback } from "../utils/hooks";
import { toast } from "sonner@2.0.3";

interface SwipeableBookCardProps {
  bookId: string;
  cover: React.ReactNode;
  content: React.ReactNode;
  onBookClick?: () => void;
  onBookmark?: () => void;
  onDownload?: () => void;
  onInfo?: () => void;
  onAddToCollection?: () => void;
  className?: string;
}

export function SwipeableBookCard({
  bookId,
  cover,
  content,
  onBookClick,
  onBookmark,
  onDownload,
  onInfo,
  onAddToCollection,
  className = "",
}: SwipeableBookCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedSide, setRevealedSide] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const haptic = useHapticFeedback();

  const SWIPE_THRESHOLD = 60; // 60px to reveal actions
  const MAX_SWIPE = 120; // Maximum swipe distance

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      isDragging = true;
      setIsRevealing(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      currentX.current = e.touches[0].clientX;
      const diff = currentX.current - startX.current;
      
      // Limit swipe distance
      const limitedDiff = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff));
      setSwipeOffset(limitedDiff);

      // Haptic feedback at threshold
      if (Math.abs(limitedDiff) >= SWIPE_THRESHOLD && Math.abs(swipeOffset) < SWIPE_THRESHOLD) {
        haptic.light();
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      
      // If swiped enough, keep actions visible
      if (Math.abs(swipeOffset) >= SWIPE_THRESHOLD) {
        if (swipeOffset < 0) {
          // Swiped left - show right actions
          setSwipeOffset(-MAX_SWIPE);
          setRevealedSide('left');
          haptic.medium();
        } else {
          // Swiped right - show left actions
          setSwipeOffset(MAX_SWIPE);
          setRevealedSide('right');
          haptic.medium();
        }
      } else {
        // Reset if not swiped enough
        setSwipeOffset(0);
        setRevealedSide(null);
      }
      
      setIsRevealing(false);
    };

    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: true });
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, [swipeOffset]);

  const handleAction = (action: () => void, actionName: string) => {
    haptic.success();
    setSwipeOffset(0);
    setRevealedSide(null);
    action();
  };

  const resetSwipe = () => {
    setSwipeOffset(0);
    setRevealedSide(null);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background Actions - LEFT SIDE (Swipe Right to reveal) */}
      <div 
        className={`absolute inset-y-0 left-0 flex items-center gap-2 px-4 transition-opacity ${
          revealedSide === 'right' || (isRevealing && swipeOffset > 0) ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: `${Math.min(Math.abs(swipeOffset), MAX_SWIPE)}px`,
        }}
      >
        {onAddToCollection && (
          <Button
            size="icon"
            className="h-12 w-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onAddToCollection, 'Tambah ke Koleksi');
              toast.success('Ditambahkan ke koleksi');
            }}
          >
            <Plus className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Background Actions - RIGHT SIDE (Swipe Left to reveal) */}
      <div 
        className={`absolute inset-y-0 right-0 flex items-center gap-2 px-4 transition-opacity ${
          revealedSide === 'left' || (isRevealing && swipeOffset < 0) ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: `${Math.min(Math.abs(swipeOffset), MAX_SWIPE)}px`,
        }}
      >
        {onBookmark && (
          <Button
            size="icon"
            className="h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onBookmark, 'Bookmark');
              toast.success('Ditambahkan ke bookmark');
            }}
          >
            <Bookmark className="w-5 h-5" />
          </Button>
        )}
        {onDownload && (
          <Button
            size="icon"
            className="h-12 w-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onDownload, 'Download');
              toast.success('Mulai mengunduh...');
            }}
          >
            <Download className="w-5 h-5" />
          </Button>
        )}
        {onInfo && (
          <Button
            size="icon"
            className="h-12 w-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onInfo, 'Info');
            }}
          >
            <Info className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Main Card */}
      <div
        ref={cardRef}
        className="relative touch-pan-y"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isRevealing ? 'none' : 'transform 0.3s ease-out',
        }}
        onClick={() => {
          if (Math.abs(swipeOffset) > 0) {
            resetSwipe();
          } else {
            onBookClick?.();
          }
        }}
      >
        <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          {cover}
          {content}
        </Card>
      </div>

      {/* Swipe Hint (shows briefly on first render) */}
      {revealedSide && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              resetSwipe();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Swipe Tutorial Component (shows once on first visit)
export function SwipeTutorial({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
      <Card className="p-6 max-w-sm bg-white dark:bg-gray-800">
        <div className="text-center space-y-4">
          <div className="text-4xl">👆</div>
          <h3 className="text-gray-900 dark:text-white">
            Tips: Geser Kartu Buku
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                ⬅️
              </div>
              <p className="text-left">
                <span className="text-gray-900 dark:text-white">Geser ke kiri</span> untuk akses cepat
                <br />
                <span className="text-xs">(Bookmark, Download, Info)</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center shrink-0">
                ➡️
              </div>
              <p className="text-left">
                <span className="text-gray-900 dark:text-white">Geser ke kanan</span> untuk tambah ke koleksi
              </p>
            </div>
          </div>
          <Button 
            onClick={onDismiss}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Mengerti
          </Button>
        </div>
      </Card>
    </div>
  );
}
