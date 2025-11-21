import { useState } from "react";
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
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";

interface BookDetailScreenProps {
  onBack: () => void;
  onRead: () => void;
  onUpgrade: () => void;
}

export function BookDetailScreen({ onBack, onRead, onUpgrade }: BookDetailScreenProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const book = {
    id: "1",
    title: "Structure and Interpretation of Computer Programs",
    authors: "Harold Abelson, Gerald Jay Sussman, Julie Sussman",
    publisher: "MIT Press",
    year: 1996,
    pages: 350,
    language: "English",
    isbn: "978-0262510875",
    rating: 4.9,
    totalRatings: 1542,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop",
    description:
      "Structure and Interpretation of Computer Programs has had a dramatic impact on computer science curricula over the past decade. This long-awaited revision contains changes throughout the text. There are new implementations of most of the major programming systems in the book, including the interpreters and compilers, and the authors have incorporated many small changes that reflect their experience teaching the course at MIT since the first edition was published.",
    genres: ["Computer Science", "Programming", "Textbook"],
    readingProgress: 67,
    currentPage: 234,
    isPremium: false,
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Dihapus dari favorit" : "Ditambahkan ke favorit");
  };

  const handleShare = () => {
    toast.success("Link buku berhasil disalin!");
  };

  const handleDownload = () => {
    if (book.isPremium) {
      onUpgrade();
    } else {
      toast.success("Buku sedang diunduh...");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-gray-900 dark:text-white flex-1">Detail Buku</h2>
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
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={onRead}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  {book.readingProgress > 0 ? "Lanjutkan Membaca" : "Mulai Membaca"}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
              </div>

              {/* Reading Progress */}
              {book.readingProgress > 0 && (
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
                        Halaman {book.currentPage} dari {book.pages}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {book.readingProgress}%
                      </span>
                    </div>
                    <Progress value={book.readingProgress} className="h-2" />
                  </div>
                </Card>
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-2">
              <h1 className="text-gray-900 dark:text-white mb-3">
                {book.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {book.authors}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-gray-900 dark:text-white">
                    {book.rating}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  ({book.totalRatings} rating)
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {book.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
                {book.isPremium && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    Premium
                  </Badge>
                )}
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
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {book.description}
                  </p>
                </TabsContent>

                <TabsContent value="details" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Penulis</span>
                      <span className="text-gray-900 dark:text-white">{book.authors}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Penerbit</span>
                      <span className="text-gray-900 dark:text-white">{book.publisher}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Tahun</span>
                      <span className="text-gray-900 dark:text-white">{book.year}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Halaman</span>
                      <span className="text-gray-900 dark:text-white">{book.pages}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Bahasa</span>
                      <span className="text-gray-900 dark:text-white">{book.language}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">ISBN</span>
                      <span className="text-gray-900 dark:text-white">{book.isbn}</span>
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
                          Abelson, H., Sussman, G. J., & Sussman, J. (1996). Structure and
                          Interpretation of Computer Programs. MIT Press.
                        </p>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-gray-900 dark:text-white mb-2">
                        MLA Style
                      </h3>
                      <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                        <p className="text-gray-700 dark:text-gray-300 text-sm font-mono">
                          Abelson, Harold, et al. Structure and Interpretation of Computer
                          Programs. MIT Press, 1996.
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
