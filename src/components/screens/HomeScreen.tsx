import { useState, useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Crown, Bell, Star, BookOpen, ChevronRight, Sparkles, TrendingUp, Flame, Info, ChevronsDown, Loader2 } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { SwipeableBookCard, SwipeTutorial } from "../SwipeableBookCard";
import { PullToRefresh } from "../PullToRefresh";
import { DashboardStats } from "../DashboardStats";
import { BookCardSkeleton } from "../skeletons/BookCardSkeleton";
import { toast } from "sonner";
import { useBooks } from "../../context/BooksContext";
import { Book } from "../../utils/collections";
import { api } from "../../services/api";

interface HomeScreenProps {
  onSelectBook: (bookId: string) => void;
  onUpgrade: () => void;
  onNavigate?: (page: string) => void;
  darkMode?: boolean;
}

export function HomeScreen({ onSelectBook, onUpgrade, onNavigate, darkMode = false }: HomeScreenProps) {
  const {
    trendingBooks,
    recommendations,
    isLoadingHome,
    refreshHomeData,
    library,
    addToLibrary,
    dashboardScroll,
    setDashboardScroll
  } = useBooks();

  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Get the most recently read book
  const continueReading = library.length > 0
    ? [...library].sort((a: Book, b: Book) => {
      const timeA = a.lastReadDate ? new Date(a.lastReadDate).getTime() : 0;
      const timeB = b.lastReadDate ? new Date(b.lastReadDate).getTime() : 0;
      return timeB - timeA;
    })[0]
    : null;

  const scrollRef = useRef(0);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
      if (window.scrollY > 200) {
        setShowScrollIndicator(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll on mount and save on unmount
  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    setShowScrollIndicator(true);

    // Try immediate scroll
    if (dashboardScroll > 0) {
      window.scrollTo(0, dashboardScroll);

      // Double check after a small delay in case of layout shifts
      setTimeout(() => {
        if (Math.abs(window.scrollY - dashboardScroll) > 50) {
          window.scrollTo(0, dashboardScroll);
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      // Use the ref value which tracks the last known scroll position
      // This avoids issues where window.scrollY might be 0 during unmount
      setDashboardScroll(scrollRef.current);
    };
  }, []);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenSwipeTutorial');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setShowSwipeTutorial(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissTutorial = () => {
    setShowSwipeTutorial(false);
    localStorage.setItem('hasSeenSwipeTutorial', 'true');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshHomeData();
    toast.success('Beranda diperbarui!');
    setIsRefreshing(false);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen relative">
      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-gradient-to-t from-blue-600/90 to-blue-600/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl animate-bounce">
            <div className="flex flex-col items-center gap-1">
              <ChevronsDown className="w-6 h-6 text-white" />
              <span className="text-xs text-white hidden sm:block">Scroll ke bawah untuk lebih banyak</span>
            </div>
          </div>
        </div>
      )}

      <div className="pb-20 lg:pb-8">
        {/* Hero Section */}
        <div className="relative text-white px-6 pt-8 pb-12 lg:px-12 lg:pt-12 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544132998-ae26c2655274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3MlMjBzaGVsdmVzfGVufDF8fHx8MTc2MTczODQyNnww&ixlib=rb-4.1.0&q=80&w=1080')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-purple-900/90"></div>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-blue-100 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Selamat Malam
                </p>
                <h1 className="flex items-center gap-2 text-white drop-shadow-lg">
                  Dr. Alisa! 👋
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate?.('notifications')}
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Bell className="w-5 h-5" />
              </Button>
            </div>

            <Card className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 border-0 p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="mb-1">
                      Akses Tanpa Batas ke 10,000+ Buku & Jurnal
                    </h3>
                    <p className="text-white/90 text-sm">
                      Upgrade ke Premium dan nikmati semua fitur eksklusif!
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onUpgrade}
                  className="bg-white text-orange-600 hover:bg-white/90 shrink-0"
                >
                  Upgrade
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Continue Reading Section */}
        {continueReading && (
          <div className={`px-6 py-8 lg:px-12 transition-colors duration-300 ${darkMode ? "bg-transparent" : "bg-white"}`}>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-gray-900 dark:text-white mb-6">
                Lanjutkan Membaca
              </h2>

              <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="p-6">
                  <div className="flex gap-4">
                    <div
                      className="w-24 h-32 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                      onClick={() => onSelectBook(continueReading.id)}
                    >
                      <ImageWithFallback
                        src={continueReading.image}
                        alt={continueReading.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                            onClick={() => onSelectBook(continueReading.id)}
                          >
                            {continueReading.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">
                            {continueReading.author}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950"
                        >
                          <BookOpen className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Halaman {continueReading.currentPage} dari {continueReading.pageCount}
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {continueReading.progress}%
                          </span>
                        </div>
                        <Progress value={continueReading.progress} className="h-2" />
                      </div>

                      <Button
                        onClick={() => onSelectBook(continueReading.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Lanjutkan
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Featured Demo Books Section */}
        <div className={`px-6 py-8 lg:px-12 transition-colors duration-300 ${darkMode ? "bg-transparent" : "bg-blue-50"}`}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-gray-900 dark:text-white font-bold">
                  Buku Demo Unggulan
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nikmati pengalaman membaca penuh dengan buku-buku klasik ini
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {api.getDemoBooks().map((book) => (
                <Card
                  key={book.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900"
                  onClick={() => onSelectBook(book.id)}
                >
                  <div className="flex h-full">
                    <div className="w-24 shrink-0">
                      <ImageWithFallback
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                            {book.title}
                          </h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shrink-0">
                            Demo
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {book.author}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mb-3">
                          {book.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onSelectBook(book.id);
                          }}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Baca Sekarang
                        </Button>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{book.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Stats Section */}
        <div className={`px-6 py-8 lg:px-12 transition-colors duration-300 ${darkMode ? "bg-transparent" : "bg-white"}`}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-gray-900 dark:text-white mb-2">
                Statistik Membaca Anda
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pantau progress dan pencapaian Anda
              </p>
            </div>
            <DashboardStats
              booksRead={library.filter(b => b.progress === 100).length}
              readingStreak={14}
              monthlyGoal={10}
              monthlyProgress={library.filter(b => b.lastReadDate && new Date(b.lastReadDate).getMonth() === new Date().getMonth()).length}
              totalPages={library.reduce((acc, b) => acc + (b.currentPage || 0), 0)}
              achievements={12}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Trending Books Section */}
        <div className={`px-6 py-8 lg:px-12 transition-colors duration-300 ${darkMode ? "bg-transparent" : "bg-gradient-to-br from-orange-50 to-yellow-50"}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-gray-900 dark:text-white">
                  Sedang Trending
                </h2>
              </div>
              <Button
                variant="ghost"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                Lihat Semua
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Swipe Hint for Mobile */}
            {showSwipeHint && (
              <div className="lg:hidden mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Tips:</strong> Geser kartu buku ke kiri untuk aksi cepat (Bookmark, Download, Info)
                  </p>
                </div>
                <button
                  onClick={() => setShowSwipeHint(false)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {isLoadingHome ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <BookCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingBooks.map((book: Book, index: number) => {
                  const bookCover = (
                    <div className="aspect-[3/4] overflow-hidden relative group bg-gray-100 dark:bg-gray-800 p-2 flex items-center justify-center">
                      <ImageWithFallback
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-contain shadow-sm group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 flex items-center gap-1 shadow-md">
                          <TrendingUp className="w-3 h-3" />
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  );

                  const bookContent = (
                    <div className="p-4">
                      <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-1">
                        {book.author}
                      </p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {book.rating || 4.5}
                        </span>
                      </div>
                    </div>
                  );

                  return (
                    <div key={book.id}>
                      <div className="lg:hidden">
                        <SwipeableBookCard
                          bookId={book.id}
                          cover={bookCover}
                          content={bookContent}
                          onBookClick={() => onSelectBook(book.id)}
                          onBookmark={() => addToLibrary(book)}
                          onDownload={() => toast.success(`Mengunduh ${book.title}...`)}
                          onInfo={() => onSelectBook(book.id)}
                          onAddToCollection={() => addToLibrary(book)}
                        />
                      </div>

                      <Card
                        className="hidden lg:block overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:ring-2 hover:ring-blue-500/20 dark:hover:ring-blue-400/20 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        onClick={() => onSelectBook(book.id)}
                      >
                        {bookCover}
                        {bookContent}
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className={`px-6 py-8 lg:px-12 transition-colors duration-300 ${darkMode ? "bg-transparent" : "bg-white"}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-white">
                Rekomendasi Untuk Anda
              </h2>
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Lihat Semua
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {isLoadingHome ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <BookCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((book: Book) => {
                  const bookCover = (
                    <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800 p-2 flex items-center justify-center relative group">
                      <ImageWithFallback
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-contain shadow-sm group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  );

                  const bookContent = (
                    <div className="p-4">
                      <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-1">
                        {book.author}
                      </p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {book.rating || 4.5}
                        </span>
                      </div>
                    </div>
                  );

                  return (
                    <div key={book.id}>
                      <div className="lg:hidden">
                        <SwipeableBookCard
                          bookId={book.id}
                          cover={bookCover}
                          content={bookContent}
                          onBookClick={() => onSelectBook(book.id)}
                          onBookmark={() => addToLibrary(book)}
                          onDownload={() => toast.success(`Mengunduh ${book.title}...`)}
                          onInfo={() => onSelectBook(book.id)}
                          onAddToCollection={() => addToLibrary(book)}
                        />
                      </div>

                      <Card
                        className="hidden lg:block overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:ring-2 hover:ring-blue-500/20 dark:hover:ring-blue-400/20 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        onClick={() => onSelectBook(book.id)}
                      >
                        {bookCover}
                        {bookContent}
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {showSwipeTutorial && <SwipeTutorial onDismiss={handleDismissTutorial} />}
      </div>
    </PullToRefresh>
  );
}