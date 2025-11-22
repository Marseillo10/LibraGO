import { useState, useRef, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BookOpen, Heart, Clock, Star, MoreVertical, Trash2, BookOpenCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { PullToRefresh } from "../PullToRefresh";
import { useBooks } from "../../context/BooksContext";
import { toast } from "sonner";
import { EmptyState } from "../EmptyState";
import { ErrorState } from "../ErrorState";
import { CollectionSkeleton } from "../skeletons/CollectionSkeleton";

interface CollectionScreenProps {
  onSelectBook: (bookId: string) => void;
  darkMode?: boolean;
}

export function CollectionScreen({ onSelectBook, darkMode = false }: CollectionScreenProps) {
  const { library, removeFromLibrary, toggleFavorite } = useBooks();
  const [activeTab, setActiveTab] = useState("all");
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Enable touch scrolling for tabs
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.cursor = 'grabbing';
    };

    const handleMouseLeave = () => {
      isDown = false;
      container.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
      isDown = false;
      container.style.cursor = 'grab';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const filteredBooks = library.filter((book) => {
    if (activeTab === "all") return true;
    // Since we don't have explicit 'status' in Book interface yet, we infer:
    // reading: progress > 0 && progress < 100
    // completed: progress === 100
    // wishlist: progress === 0 (default)

    if (activeTab === "reading") return book.progress > 0 && book.progress < 100;
    if (activeTab === "completed") return book.progress === 100;
    if (activeTab === "wishlist") return book.progress === 0;
    if (activeTab === "favorites") return book.isFavorite;
    return true;
  });

  const getStatusBadge = (progress: number) => {
    if (progress === 100) {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Selesai</Badge>;
    } else if (progress > 0) {
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Sedang Dibaca</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Belum Dibaca</Badge>;
    }
  };

  const handleRemoveBook = (e: React.MouseEvent, bookId: string, title: string) => {
    e.stopPropagation();
    removeFromLibrary(bookId);
    toast.success(`"${title}" dihapus dari koleksi`);
  };

  const handleToggleFav = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    toggleFavorite(bookId);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    try {
      setError(null);
      // Simulate refresh since library is local
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Randomly simulate error for testing
      if (Math.random() > 0.9) throw new Error("Gagal memuat koleksi");
      toast.success('Koleksi diperbarui');
    } catch (err) {
      setError("Gagal memuat koleksi. Silakan coba lagi.");
      toast.error("Terjadi kesalahan");
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Gagal Memuat Koleksi"
        description={error}
        onRetry={handleRefresh}
        onHome={() => window.location.href = "/"}
      />
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className={`min-h-screen pb-20 lg:pb-8 transition-colors duration-300 ${darkMode ? "bg-transparent" : "bg-white"}`}>
      {/* Sticky Header */}
      <div className={`sticky top-0 z-30 border-b shadow-sm transition-colors duration-300 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
        <div className="px-6 py-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-gray-900 dark:text-white mb-2">
              Koleksi Saya
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {library.length} buku dalam koleksi Anda
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Sticky Tabs - Swipeable with Labels */}
          <div className={`sticky top-[120px] lg:top-[104px] z-20 pb-4 -mx-6 px-6 lg:-mx-12 lg:px-12 mb-2 transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
            <div ref={tabsContainerRef} className="max-w-6xl mx-auto overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing touch-pan-x">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="inline-flex w-auto gap-1 h-auto py-1">
                  <TabsTrigger value="all" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[70px] sm:min-w-0 h-auto">
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[10px] sm:text-sm leading-tight">Semua</span>
                  </TabsTrigger>
                  <TabsTrigger value="reading" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[70px] sm:min-w-0 h-auto">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[10px] sm:text-sm leading-tight">Dibaca</span>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[70px] sm:min-w-0 h-auto">
                    <BookOpenCheck className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[10px] sm:text-sm leading-tight">Selesai</span>
                  </TabsTrigger>
                  <TabsTrigger value="wishlist" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[70px] sm:min-w-0 h-auto">
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[10px] sm:text-sm leading-tight">Wishlist</span>
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-1.5 min-w-[70px] sm:min-w-0 h-auto">
                    <Heart className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[10px] sm:text-sm leading-tight">Favorit</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value={activeTab} className="mt-4">
              {isLoading ? (
                <CollectionSkeleton />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBooks.map((book) => (
                      <Card
                        key={book.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div
                          className="aspect-[3/4] overflow-hidden cursor-pointer relative group"
                          onClick={() => onSelectBook(book.id)}
                        >
                          <ImageWithFallback
                            src={book.image}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {book.isFavorite && (
                            <div className="absolute top-2 right-2 bg-pink-500 text-white p-2 rounded-full">
                              <Heart className="w-4 h-4 fill-current" />
                            </div>
                          )}
                          {book.progress > 0 && book.progress < 100 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${book.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3
                              className="text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1"
                              onClick={() => onSelectBook(book.id)}
                            >
                              {book.title}
                            </h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onSelectBook(book.id)}>
                                  Baca Sekarang
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e: React.MouseEvent) => handleToggleFav(e, book.id)}>
                                  {book.isFavorite ? "Hapus dari Favorit" : "Tandai Favorit"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={(e: React.MouseEvent) => handleRemoveBook(e, book.id, book.title)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus dari Koleksi
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-1">
                            {book.author}
                          </p>
                          <div className="flex items-center justify-between">
                            {getStatusBadge(book.progress)}
                            {book.rating && (
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {book.rating}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {filteredBooks.length === 0 && (
                    <EmptyState
                      icon={BookOpen}
                      title="Belum ada buku"
                      description={
                        activeTab === "all"
                          ? "Mulai tambahkan buku ke koleksi Anda dari pencarian"
                          : `Tidak ada buku dengan status "${activeTab}"`
                      }
                      actionLabel={activeTab === "all" ? "Jelajahi Buku" : undefined}
                      onAction={activeTab === "all" ? () => window.location.href = "/" : undefined}
                    />
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PullToRefresh>
  );
}
