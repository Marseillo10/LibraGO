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
  Heart,
  Share2,
  Download,
  Clock,
  FileText,
  Loader2,
  Moon,
  Sun,
  ExternalLink,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";
import { useBooks } from "../../context/BooksContext";
import { OpenLibraryReader } from "./OpenLibraryReader";
import { cleanDescription } from "../../utils/textUtils";

interface BookDetailScreenProps {
  onBack: () => void;
  onRead: () => void;
  onUpgrade: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function BookDetailScreen({ onBack, onRead, onUpgrade, darkMode, onToggleDarkMode }: BookDetailScreenProps) {
  const { currentBook, addToLibrary, removeFromLibrary, toggleFavorite, library, startDownload } = useBooks();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReader, setShowReader] = useState(false);

  useEffect(() => {
    if (currentBook) {
      setIsFavorite(currentBook.isFavorite);
    }
  }, [currentBook]);

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleToggleFavorite = () => {
    toggleFavorite(currentBook.id);
    setIsFavorite(!isFavorite);
    toast.success(!isFavorite ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${currentBook.id}`);
    toast.success("Link buku berhasil disalin!");
  };

  const handleDownload = () => {
    startDownload(currentBook);
  };

  const handleAddToLibrary = () => {
    addToLibrary(currentBook);
  };

  const handleStartReading = () => {
    if (!isInLibrary) {
      addToLibrary(currentBook);
    }

    if (currentBook.iaId) {
      // Prefer internal reader (which now handles fallback)
      onRead();
    } else if (currentBook.readLink) {
      window.open(currentBook.readLink, '_blank');
    } else if (currentBook.previewLink) {
      window.open(currentBook.previewLink, '_blank');
    } else {
      // Fallback if no link available, still try to open reader (might show demo content)
      onRead();
    }
  };

  const isInLibrary = library.some(b => b.id === currentBook.id);

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {showReader && currentBook.iaId && (
        <OpenLibraryReader
          bookId={currentBook.iaId}
          onClose={() => setShowReader(false)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-gray-900 dark:text-white flex-1 line-clamp-1">{currentBook.title}</h2>
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
              <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-lg mb-4">
                <ImageWithFallback
                  src={currentBook.image}
                  alt={currentBook.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleStartReading}
                  className={`w-full text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${currentBook.iaId
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    }`}
                  size="lg"
                >
                  {currentBook.iaId ? (
                    <>
                      <BookOpen className="w-5 h-5 mr-2" />
                      {currentBook.progress > 0 ? "Lanjutkan Membaca" : "Baca di Aplikasi"}
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Baca di Open Library
                    </>
                  )}
                </Button>

                <div className={`grid gap-3 ${!isInLibrary ? "grid-cols-2" : "grid-cols-1"}`}>
                  {!isInLibrary && (
                    <Button
                      onClick={handleAddToLibrary}
                      variant="outline"
                      className="w-full"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Simpan
                    </Button>
                  )}

                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Unduh
                  </Button>
                </div>

                {/* Secondary External Links */}
                {(currentBook.readLink || currentBook.previewLink) && !currentBook.iaId && (
                  <Button
                    onClick={() => window.open(currentBook.readLink || currentBook.previewLink, '_blank')}
                    variant="ghost"
                    className="w-full text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Buka di Sumber Eksternal
                  </Button>
                )}
              </div>

              {/* Reading Progress */}
              {currentBook.progress > 0 && (
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
                        Halaman {currentBook.currentPage} dari {currentBook.pageCount}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {currentBook.progress}%
                      </span>
                    </div>
                    <Progress value={currentBook.progress} className="h-2" />
                  </div>
                </Card>
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-2">
              <h1 className="text-gray-900 dark:text-white mb-3 text-2xl lg:text-4xl font-bold">
                {currentBook.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                {currentBook.author}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {currentBook.rating || 4.5}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Open Library Rating
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentBook.genre.map((genre) => (
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
                    <TabsTrigger value="citation" className="flex-shrink-0">Sitasi</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="description" className="mt-4">
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none whitespace-pre-line text-justify hyphens-auto">
                    {cleanDescription(currentBook.description || "Tidak ada deskripsi tersedia.")}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Penulis</span>
                      <span className="text-gray-900 dark:text-white text-right">{currentBook.author}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Penerbit</span>
                      <span className="text-gray-900 dark:text-white text-right">{currentBook.publisher || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Tanggal Terbit</span>
                      <span className="text-gray-900 dark:text-white text-right">{currentBook.publishedDate || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Halaman</span>
                      <span className="text-gray-900 dark:text-white text-right">{currentBook.pageCount}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="citation" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-gray-900 dark:text-white mb-2">
                        APA Style
                      </h3>
                      <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                        <p className="text-gray-700 dark:text-gray-300 text-sm font-mono">
                          {currentBook.author}. ({currentBook.publishedDate?.substring(0, 4) || "n.d."}). {currentBook.title}. {currentBook.publisher || "Publisher"}.
                        </p>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-gray-900 dark:text-white mb-2">
                        Export ke
                      </h3>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => toast.success("Exported to Zotero")}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Zotero
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => toast.success("Exported to Mendeley")}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Mendeley
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
