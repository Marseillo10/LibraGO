import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ArrowLeft,
  Star,
  BookOpen,
  BookOpenText,
  Heart,
  Share2,
  Download,
  Clock,
  FileText,
  Loader2,
  Moon,
  Sun,
  ExternalLink,
  Bookmark,
  CheckCircle,
  Copy,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";
import { useBooks } from "../../context/BooksContext";
import { OpenLibraryReader } from "./OpenLibraryReader";
import { cleanDescription } from "../../utils/textUtils";
import { generateCitation, downloadRIS } from "../../utils/citation";

interface BookDetailScreenProps {
  onBack: () => void;
  onRead: () => void;
  onUpgrade: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function BookDetailScreen({ onBack, onRead, onUpgrade, darkMode, onToggleDarkMode }: BookDetailScreenProps) {
  const { currentBook, addToLibrary, removeFromLibrary, toggleFavorite, library, startDownload, fetchBookDetails } = useBooks();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [displayBook, setDisplayBook] = useState<typeof currentBook | null>(null);

  useEffect(() => {
    const loadBookFromUrl = async () => {
      if (!currentBook) {
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get("id");
        if (bookId) {
          await fetchBookDetails(bookId);
        }
      }
    };
    loadBookFromUrl();
  }, [currentBook, fetchBookDetails]);

  useEffect(() => {
    if (currentBook) {
      setIsFavorite(currentBook.isFavorite);

      // If the book is different, or if displayBook is not set, set it to the new currentBook
      if (!displayBook || displayBook.id !== currentBook.id) {
        setDisplayBook(currentBook);
      } 
      // If it's the same book, check if progress or page count needs syncing
      else if (
        displayBook.progress !== currentBook.progress ||
        displayBook.pageCount !== currentBook.pageCount ||
        displayBook.currentPage !== currentBook.currentPage
      ) {
        // Sync progress, currentPage and pageCount if it's the same book
        setDisplayBook(prev => prev ? ({
          ...prev,
          progress: currentBook.progress,
          currentPage: currentBook.currentPage,
          pageCount: currentBook.pageCount
        }) : null);
      }
    } else {
      setDisplayBook(null);
    }
  }, [currentBook]);

  const handleEditionClick = (edition: any) => {
    if (!displayBook) return;

    setDisplayBook({
      ...displayBook,
      title: edition.title,
      publisher: edition.publisher,
      publishedDate: edition.publishDate,
      language: edition.language,
      isbn: edition.isbn,
      image: edition.cover || displayBook.image,
      // Keep other fields from the main work
    });
    toast.success(`Menampilkan edisi: ${edition.title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!displayBook) {
    return (
      <div className="min-h-screen bg-white dark:bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleToggleFavorite = () => {
    if (!displayBook) return;
    toggleFavorite(displayBook.id, displayBook);
    setIsFavorite(!isFavorite);
    toast.success(!isFavorite ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
  };

  const handleShare = () => {
    if (!displayBook) return;
    navigator.clipboard.writeText(`${window.location.origin}/book/${displayBook.id}`);
    toast.success("Link buku berhasil disalin!");
  };

  const handleDownload = () => {
    if (!displayBook) return;
    startDownload(displayBook);
  };

  const handleAddToLibrary = () => {
    if (!displayBook) return;
    addToLibrary(displayBook);
  };

  const isInLibrary = displayBook ? library.some(b => b.id === displayBook.id) : false;

  const handleStartReading = () => {
    if (!displayBook) return;

    if (!isInLibrary) {
      addToLibrary(displayBook);
    }

    if (displayBook.iaId || displayBook.id.startsWith('demo_')) {
      // Prefer internal reader (which now handles fallback)
      onRead();
    } else if (displayBook.readLink) {
      window.open(displayBook.readLink, '_blank');
    } else if (displayBook.previewLink) {
      window.open(displayBook.previewLink, '_blank');
    } else {
      // Fallback if no link available, still try to open reader (might show demo content)
      onRead();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-transparent" : "bg-white"}`}>
      {showReader && displayBook.iaId && (
        <OpenLibraryReader
          bookId={displayBook.iaId}
          onClose={() => setShowReader(false)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-gray-900 dark:text-white flex-1 line-clamp-1">{displayBook.title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            className={isFavorite ? "text-pink-500" : ""}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
          {onToggleDarkMode && (
            <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 py-8 lg:px-12 pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Book Info */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Cover */}
            <div className="lg:col-span-1">
              <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg mb-4 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <ImageWithFallback
                  src={displayBook.image}
                  alt={displayBook.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleStartReading}
                  className="w-full h-12 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 shadow-blue-600/20"
                  size="lg"
                >
                  {displayBook.iaId || displayBook.id.startsWith('demo_') ? (
                    <>
                      <BookOpenText className="w-5 h-5 mr-2" />
                      {displayBook.id.startsWith('demo_')
                        ? (displayBook.progress > 0 ? "Lanjutkan Membaca Demo" : "Baca Demo di Aplikasi")
                        : (displayBook.progress > 0 ? "Lanjutkan Membaca" : "Baca di Aplikasi")
                      }
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Baca di Open Library
                    </>
                  )}
                </Button>

                {(displayBook.iaId || displayBook.openLibraryId) && (
                  <Button
                    onClick={() => window.open(`https://openlibrary.org/works/${displayBook.openLibraryId || displayBook.id}`, '_blank')}
                    variant="outline"
                    className="w-full h-11 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Lihat di Open Library
                  </Button>
                )}

                <div className={`grid gap-3 ${!isInLibrary ? "grid-cols-2" : "grid-cols-1"}`}>
                  {!isInLibrary && (
                    <Button
                      onClick={handleAddToLibrary}
                      variant="outline"
                      className="w-full h-11 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Wishlist
                    </Button>
                  )}

                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full h-11 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Unduh
                  </Button>
                </div>
              </div>

              {/* Reading Progress */}
              {(displayBook.progress > 0 || displayBook.id.startsWith('demo_')) && (
                <Card className="p-4 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Progress Baca
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Halaman {displayBook.currentPage} dari {displayBook.pageCount}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {displayBook.progress}%
                      </span>
                    </div>
                    <Progress value={displayBook.progress} className="h-2" />
                  </div>
                </Card>
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-2">
              <h1 className="text-gray-900 dark:text-white mb-3 text-2xl lg:text-4xl font-bold">
                {displayBook.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                {displayBook.author}
              </p>

              {displayBook.firstSentence && (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-800/50 py-2 pr-2 rounded-r">
                  "{displayBook.firstSentence}"
                </blockquote>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {displayBook.rating || 4.5}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {displayBook.ratingsCount
                    ? `• ${displayBook.ratingsCount.toLocaleString()} ratings (from Open Library)`
                    : "(Rating from Open Library)"}
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {displayBook.genre.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="description" className="w-full">
                <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
                  <TabsList className="inline-flex w-auto min-w-full md:w-full">
                    <TabsTrigger value="description" className="flex-shrink-0">Deskripsi</TabsTrigger>
                    <TabsTrigger value="details" className="flex-shrink-0">Detail</TabsTrigger>
                    <TabsTrigger value="editions" className="flex-shrink-0">Edisi</TabsTrigger>
                    <TabsTrigger value="reviews" className="flex-shrink-0">Ulasan</TabsTrigger>
                    <TabsTrigger value="citation" className="flex-shrink-0">Sitasi</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="description" className="mt-4">
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none whitespace-pre-line text-justify hyphens-auto">
                    {cleanDescription(displayBook.description || "Tidak ada deskripsi tersedia.")}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Penulis</span>
                      <span className="text-gray-900 dark:text-white text-right">{displayBook.author}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Penerbit</span>
                      <span className="text-gray-900 dark:text-white text-right">{displayBook.publisher || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Tanggal Terbit</span>
                      <span className="text-gray-900 dark:text-white text-right">{displayBook.publishedDate || "-"}</span>
                    </div>
                    {/* Jumlah Halaman */}
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Jumlah Halaman</span>
                      <span className="text-gray-900 dark:text-white text-right">{displayBook.pageCount}</span>
                    </div>
                    {/* ISBN */}
                    {displayBook.isbn && (
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">ISBN</span>
                        <span className="text-gray-900 dark:text-white text-right font-mono">{displayBook.isbn}</span>
                      </div>
                    )}
                    {/* Bahasa */}
                    {displayBook.language && (
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Bahasa</span>
                        <span className="text-gray-900 dark:text-white text-right capitalize">{displayBook.language}</span>
                      </div>
                    )}
                    {/* Links */}
                    {displayBook.links && displayBook.links.length > 0 && (
                      <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 block mb-1">Tautan Eksternal</span>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {displayBook.links.slice(0, 3).map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors truncate max-w-full"
                            >
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Excerpts */}
                    {displayBook.excerpts && displayBook.excerpts.length > 0 && (
                      <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 block mb-1">Cuplikan</span>
                        <div className="space-y-2">
                          {displayBook.excerpts.slice(0, 2).map((excerpt, idx) => (
                            <blockquote key={idx} className="text-sm italic text-white/70 border-l-2 border-blue-500 pl-3 py-1 bg-white/5 rounded-r">
                              "{excerpt.length > 150 ? excerpt.substring(0, 150) + "..." : excerpt}"
                            </blockquote>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* People */}
                    {displayBook.subjectPeople && displayBook.subjectPeople.length > 0 && (
                      <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 block mb-1">Tokoh</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {displayBook.subjectPeople.slice(0, 5).map((person, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                              {person}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Places */}
                    {displayBook.subjectPlaces && displayBook.subjectPlaces.length > 0 && (
                      <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 block mb-1">Lokasi</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {displayBook.subjectPlaces.slice(0, 5).map((place, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                              {place}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Times */}
                    {displayBook.subjectTimes && displayBook.subjectTimes.length > 0 && (
                      <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 block mb-1">Waktu</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {displayBook.subjectTimes.slice(0, 5).map((time, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="editions" className="mt-4">
                  <div className="space-y-4">
                    {displayBook.editions && displayBook.editions.length > 0 ? (
                      displayBook.editions.map((edition) => (
                        <div
                          key={edition.key}
                          onClick={() => handleEditionClick(edition)}
                          className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-16 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden shadow-sm">
                            <ImageWithFallback
                              src={edition.cover || "https://placehold.co/128x192?text=No+Cover"}
                              alt={edition.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">{edition.title}</h4>
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <p>{edition.publisher || "Unknown Publisher"} • {edition.publishDate || "n.d."}</p>
                              {edition.language && <p className="capitalize">Language: {edition.language}</p>}
                              {edition.isbn && <p className="font-mono text-[10px] text-gray-500">ISBN: {edition.isbn}</p>}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Tidak ada data edisi tersedia.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 dark:text-white">{displayBook.rating || 0}</div>
                        <div className="flex text-yellow-400 justify-center my-1">
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                        <div className="text-xs text-gray-500">{displayBook.ratingsCount || 0} ratings</div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star, i) => {
                          const count = displayBook.ratingCounts?.[star] || displayBook.ratingCounts?.[star.toString()] || 0;
                          const total = Object.values(displayBook.ratingCounts || {}).reduce((a, b) => a + b, 0);
                          const percent = total > 0 ? (count / total) * 100 : 0;

                          // Color logic
                          // Color logic
                          let barColor = "bg-gray-400";
                          if (star === 5) barColor = "bg-amber-500";
                          if (star === 4) barColor = "bg-blue-500";
                          if (star === 3) barColor = "bg-green-500";
                          if (star === 2) barColor = "bg-orange-500";
                          if (star === 1) barColor = "bg-red-500";

                          return (
                            <div key={star} className="flex items-center gap-3 text-xs animate-in slide-in-from-right-4 fade-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                              <div className="flex items-center gap-1 w-8">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{star}</span>
                                <Star className="w-3 h-3 text-gray-400 fill-gray-400/20" />
                              </div>

                              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`}
                                  style={{ width: `${count > 0 ? Math.max(percent, 2) : 0}%` }}
                                />
                              </div>

                              <span className="w-8 text-right text-gray-500 font-medium">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>



                    {displayBook.communityReviews && displayBook.communityReviews.length > 0 && (
                      <div className="space-y-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          Ulasan Komunitas
                          <Badge variant="outline" className="text-[10px] font-normal py-0 h-5">
                            Beta
                          </Badge>
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {displayBook.communityReviews.map((review, idx) => (
                            <Card key={idx} className="p-0 overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white relative group">
                              {/* Background Pattern */}
                              <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />

                              <div className="p-5 relative z-10">
                                <div className="flex justify-between items-center mb-6">
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-slate-200/50 dark:bg-white/10 rounded-lg">
                                      <BookOpenText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h4 className="font-bold text-lg tracking-tight">{review.category}</h4>
                                  </div>
                                  <Badge variant="secondary" className="bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/20 text-slate-700 dark:text-white border-0 px-3 py-1">
                                    {review.count?.toLocaleString() ?? 0} votes
                                  </Badge>
                                </div>

                                <div className="space-y-5">
                                  {review.items?.map((item, i) => {
                                    let colorClass = "bg-gray-500";
                                    let Icon = BookOpen;
                                    let iconColor = "text-gray-400";

                                    if (item.label === "Ingin Baca") {
                                      colorClass = "bg-blue-500";
                                      Icon = Bookmark;
                                      iconColor = "text-blue-600 dark:text-blue-400";
                                    }
                                    if (item.label === "Sedang Baca") {
                                      colorClass = "bg-amber-500";
                                      Icon = BookOpen;
                                      iconColor = "text-amber-600 dark:text-amber-400";
                                    }
                                    if (item.label === "Sudah Baca") {
                                      colorClass = "bg-green-500";
                                      Icon = CheckCircle;
                                      iconColor = "text-green-600 dark:text-green-400";
                                    }

                                    return (
                                      <div key={i} className="space-y-2 group/item">
                                        <div className="flex justify-between text-sm items-center">
                                          <div className="flex items-center gap-2">
                                            <Icon className={`w-4 h-4 ${iconColor}`} />
                                            <span className="text-slate-600 dark:text-gray-300 font-medium group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors">{item.label}</span>
                                          </div>
                                          <span className="font-bold text-slate-900 dark:text-white font-mono">{item.percentage}</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden border border-slate-300/50 dark:border-white/5">
                                          <div
                                            className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out relative`}
                                            style={{ width: item.percentage }}
                                          >
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12" />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                        Data ulasan dan rating diambil dari Open Library.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="citation" className="mt-4">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-900 dark:text-white font-medium">
                          APA Style (Recommended)
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            const citation = generateCitation(displayBook, "APA");
                            navigator.clipboard.writeText(citation);
                            toast.success("Sitasi berhasil disalin!");
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Salin
                        </Button>
                      </div>
                      <Card className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative group">
                        <p className="text-gray-700 dark:text-gray-300 text-sm font-mono break-words select-all">
                          {generateCitation(displayBook, "APA")}
                        </p>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-gray-900 dark:text-white mb-3 font-medium">
                        Export ke Reference Manager
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            downloadRIS(displayBook);
                            toast.success("File RIS untuk Zotero berhasil diunduh");
                          }}
                          className="border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                        >
                          <FileText className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                          Zotero
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            downloadRIS(displayBook);
                            toast.success("File RIS untuk Mendeley berhasil diunduh");
                          }}
                          className="border-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-400 transition-all"
                        >
                          <FileText className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                          Mendeley
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Format .ris kompatibel dengan Zotero, Mendeley, EndNote, dan aplikasi referensi lainnya.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

