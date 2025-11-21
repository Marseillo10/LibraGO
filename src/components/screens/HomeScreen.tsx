import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Crown, Bell, Star, BookOpen, ChevronRight, Sparkles, TrendingUp, Flame, Info, ChevronsDown } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { SwipeableBookCard, SwipeTutorial } from "../SwipeableBookCard";
import { PullToRefresh } from "../PullToRefresh";
import { DashboardStats } from "../DashboardStats";
import { toast } from "sonner@2.0.3";

interface HomeScreenProps {
  onSelectBook: (bookId: string) => void;
  onUpgrade: () => void;
  onNavigate?: (page: string) => void;
}

export function HomeScreen({ onSelectBook, onUpgrade, onNavigate }: HomeScreenProps) {
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true); // Always show on mount

  useEffect(() => {
    // Reset indicator setiap kali component mount (user masuk ke beranda)
    setShowScrollIndicator(true);
    
    // Reset scroll position ke top saat masuk beranda
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Hide indicator when user scrolls more than 200px
      if (scrollY > 200) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Show tutorial every time user enters HomeScreen
    // Show tutorial after 2 seconds
    const timer = setTimeout(() => {
      setShowSwipeTutorial(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismissTutorial = () => {
    setShowSwipeTutorial(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Beranda diperbarui!');
    setIsRefreshing(false);
  };

  const continueReading = {
    id: "1",
    title: "Structure and Interpretation of Computer Programs",
    authors: "Harold Abelson, Gerald Jay Sussman",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop",
    progress: 67,
    currentPage: 234,
    totalPages: 350,
  };

  const recommendations = [
    {
      id: "2",
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      author: "Erich Gamma",
      image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop",
      rating: 4.8,
    },
    {
      id: "3",
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop",
      rating: 4.7,
    },
    {
      id: "4",
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt, David Thomas",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop",
      rating: 4.9,
    },
  ];

  const trendingBooks = [
    {
      id: "5",
      title: "Atomic Habits: An Easy & Proven Way to Build Good Habits",
      author: "James Clear",
      image: "https://images.unsplash.com/photo-1619646286047-c6681c24a695?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWxmJTIwaGVscCUyMG1vdGl2YXRpb258ZW58MXx8fHwxNzYxNzU0Njk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.9,
      readers: "2.5K",
      trending: 1,
    },
    {
      id: "6",
      title: "The Psychology of Money: Timeless Lessons on Wealth",
      author: "Morgan Housel",
      image: "https://images.unsplash.com/photo-1645246913005-bef6f2f2121f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHN1Y2Nlc3MlMjBib29rfGVufDF8fHx8MTc2MTc1NDY5NXww&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.8,
      readers: "1.8K",
      trending: 2,
    },
    {
      id: "7",
      title: "Deep Work: Rules for Focused Success",
      author: "Cal Newport",
      image: "https://images.unsplash.com/photo-1732304720116-4195b021d8d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwdGVjaG5vbG9neSUyMGJvb2t8ZW58MXx8fHwxNzYxNzU0Njk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.7,
      readers: "1.5K",
      trending: 3,
    },
    {
      id: "8",
      title: "The Midnight Library",
      author: "Matt Haig",
      image: "https://images.unsplash.com/photo-1759766199518-dbb5c6467707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3B1bGFyJTIwbm92ZWwlMjBmaWN0aW9ufGVufDF8fHx8MTc2MTc1NDY5NXww&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.6,
      readers: "1.3K",
      trending: 4,
    },
  ];

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen relative">
      {/* Scroll Indicator - Fixed at bottom center */}
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
      {/* Hero Section with Library Background Image */}
      <div className="relative text-white px-6 pt-8 pb-12 lg:px-12 lg:pt-12 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544132998-ae26c2655274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3MlMjBzaGVsdmVzfGVufDF8fHx8MTc2MTczODQyNnww&ixlib=rb-4.1.0&q=80&w=1080')`
          }}
        >
          {/* Dark overlay untuk readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-purple-900/90"></div>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
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

          {/* Premium Banner */}
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

      {/* Continue Reading Section - WHITE BACKGROUND */}
      <div className="bg-white dark:bg-gray-800 px-6 py-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-gray-900 dark:text-white mb-6">
            Lanjutkan Membaca
          </h2>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex gap-4">
                {/* Book Cover */}
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

                {/* Book Info */}
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
                        {continueReading.authors}
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

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Halaman {continueReading.currentPage} dari {continueReading.totalPages}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {continueReading.progress}%
                      </span>
                    </div>
                    <Progress value={continueReading.progress} className="h-2" />
                  </div>

                  {/* Continue Button */}
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

      {/* Dashboard Stats Section */}
      <div className="bg-white dark:bg-gray-800 px-6 py-8 lg:px-12">
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
            booksRead={25}
            readingStreak={14}
            monthlyGoal={10}
            monthlyProgress={7}
            totalPages={5420}
            achievements={12}
          />
        </div>
      </div>

      {/* Trending Books Section */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 px-6 py-8 lg:px-12">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingBooks.map((book, index) => {
              // Use SwipeableBookCard for mobile, regular Card for desktop
              const bookCover = (
                <div className="aspect-[3/4] overflow-hidden relative group">
                  <ImageWithFallback
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Trending Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      #{book.trending}
                    </Badge>
                  </div>
                  {/* Readers Count */}
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    {book.readers} pembaca
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
                      {book.rating}
                    </span>
                  </div>
                </div>
              );

              return (
                <div key={book.id} className="lg:hidden">
                  <SwipeableBookCard
                    bookId={book.id}
                    cover={bookCover}
                    content={bookContent}
                    onBookClick={() => onSelectBook(book.id)}
                    onBookmark={() => toast.success(`${book.title} ditambahkan ke bookmark`)}
                    onDownload={() => toast.success(`Mengunduh ${book.title}...`)}
                    onInfo={() => onSelectBook(book.id)}
                    onAddToCollection={() => toast.success(`${book.title} ditambahkan ke koleksi`)}
                  />
                </div>
              );
            })}
            
            {/* Desktop version without swipe */}
            {trendingBooks.map((book) => (
              <Card
                key={`desktop-${book.id}`}
                className="hidden lg:block overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                onClick={() => onSelectBook(book.id)}
              >
                <div className="aspect-[3/4] overflow-hidden relative group">
                  <ImageWithFallback
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      #{book.trending}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    {book.readers} pembaca
                  </div>
                </div>
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
                      {book.rating}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Section - ALSO WHITE BACKGROUND */}
      <div className="bg-white dark:bg-gray-800 px-6 py-8 lg:px-12">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((book) => {
              const bookCover = (
                <div className="aspect-[3/4] overflow-hidden">
                  <ImageWithFallback
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
                      {book.rating}
                    </span>
                  </div>
                </div>
              );

              return (
                <>
                  {/* Mobile with swipe */}
                  <div key={book.id} className="lg:hidden">
                    <SwipeableBookCard
                      bookId={book.id}
                      cover={bookCover}
                      content={bookContent}
                      onBookClick={() => onSelectBook(book.id)}
                      onBookmark={() => toast.success(`${book.title} ditambahkan ke bookmark`)}
                      onDownload={() => toast.success(`Mengunduh ${book.title}...`)}
                      onInfo={() => onSelectBook(book.id)}
                      onAddToCollection={() => toast.success(`${book.title} ditambahkan ke koleksi`)}
                    />
                  </div>
                  
                  {/* Desktop without swipe */}
                  <Card
                    key={`desktop-${book.id}`}
                    className="hidden lg:block overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    onClick={() => onSelectBook(book.id)}
                  >
                    {bookCover}
                    {bookContent}
                  </Card>
                </>
              );
            })}
          </div>
        </div>
      </div>

      {/* Swipe Tutorial Modal */}
      {showSwipeTutorial && <SwipeTutorial onDismiss={handleDismissTutorial} />}
      </div>
    </PullToRefresh>
  );
}