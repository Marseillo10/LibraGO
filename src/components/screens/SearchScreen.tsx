import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Search, SlidersHorizontal, X, Star, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../ui/sheet";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useBooks } from "../../context/BooksContext";
import { Book } from "../../utils/collections";
import { toast } from "sonner";

interface SearchScreenProps {
  onSelectBook: (bookId: string) => void;
  darkMode?: boolean;
}

export function SearchScreen({ onSelectBook, darkMode = false }: SearchScreenProps) {
  const { searchResults, isSearching, searchBooks } = useBooks();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Advanced Filter States
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [pageRange, setPageRange] = useState([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const [freeOnly, setFreeOnly] = useState(false);
  const [authorSearchQuery, setAuthorSearchQuery] = useState("");

  const genres = ["Computers", "Fiction", "Science", "Business", "History"];
  const subjects = ["Programming", "Design", "Business", "Psychology", "Biography"];
  const languages = ["en", "id"];

  // Trigger search when filters or query change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || authorSearchQuery || selectedGenres.length > 0 || selectedSubjects.length > 0) {
        handleSearch();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, authorSearchQuery, selectedGenres, selectedSubjects]);

  const handleSearch = () => {
    // Construct complex query
    let queryParts = [];

    if (searchQuery) queryParts.push(searchQuery);
    if (authorSearchQuery) queryParts.push(`inauthor:${authorSearchQuery}`);
    if (selectedGenres.length > 0) queryParts.push(`subject:${selectedGenres.join('|')}`);
    if (selectedSubjects.length > 0) queryParts.push(`subject:${selectedSubjects.join('|')}`);

    const fullQuery = queryParts.join(' ');

    if (fullQuery.trim()) {
      searchBooks(fullQuery);
    }
  };

  // Client-side filtering for properties not supported by simple API query
  const filteredResults = searchResults.filter((book: Book) => {
    // Language filter (if API returns language, but our Book interface might not have it mapped yet? 
    // The current Book interface doesn't have language. We'll skip language filter for now or add it later)
    // const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(book.language);

    const matchesPages = book.pageCount >= pageRange[0] && book.pageCount <= pageRange[1];
    const matchesRating = (book.rating || 0) >= minRating;
    // const matchesFree = !freeOnly || !book.isPremium; // We don't have isPremium in Book interface yet

    return matchesPages && matchesRating;
  });

  const handleClearFilters = () => {
    setSelectedGenres([]);
    setSelectedSubjects([]);
    setSelectedLanguages([]);
    setPageRange([0, 2000]);
    setMinRating(0);
    setFreeOnly(false);
    setAuthorSearchQuery("");
  };

  const hasActiveFilters = authorSearchQuery !== "" || selectedGenres.length > 0 ||
    selectedSubjects.length > 0 || selectedLanguages.length > 0 ||
    pageRange[0] > 0 || pageRange[1] < 2000 || minRating > 0 || freeOnly;

  return (
    <div className={`min-h-screen pb-20 lg:pb-8 transition-colors duration-300 ${darkMode ? "bg-transparent" : "bg-white"}`}>
      <div className="px-6 py-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <h1 className="text-gray-900 dark:text-white mb-6">Pencarian</h1>

          {/* Search Bar with Advanced Filter */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari buku, penulis, atau jurnal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4"
              />
            </div>

            {/* Advanced Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="w-5 h-5" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Lanjutan</SheetTitle>
                  <SheetDescription>
                    Saring pencarian berdasarkan penulis, subjek, genre, dan jumlah halaman
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                  {/* Author Search Filter */}
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3">Penulis</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Cari berdasarkan penulis..."
                        value={authorSearchQuery}
                        onChange={(e) => setAuthorSearchQuery(e.target.value)}
                        className="pl-9 pr-9"
                      />
                      {authorSearchQuery && (
                        <X
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                          onClick={() => setAuthorSearchQuery("")}
                        />
                      )}
                    </div>
                  </div>

                  {/* Genre Filter */}
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3">Kategori</h3>
                    <div className="space-y-2">
                      {genres.map((genre) => (
                        <label key={genre} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Checkbox
                            checked={selectedGenres.includes(genre)}
                            onCheckedChange={(checked: boolean | "indeterminate") => {
                              if (checked === true) {
                                setSelectedGenres([...selectedGenres, genre]);
                              } else {
                                setSelectedGenres(selectedGenres.filter(g => g !== genre));
                              }
                            }}
                          />
                          {genre}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Page Range Filter */}
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3">
                      Jumlah Halaman: {pageRange[0]} - {pageRange[1]}
                    </h3>
                    <Slider
                      min={0}
                      max={2000}
                      step={50}
                      value={pageRange}
                      onValueChange={setPageRange}
                      className="mt-2"
                    />
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3">
                      Rating Minimal: {minRating.toFixed(1)} ★
                    </h3>
                    <Slider
                      min={0}
                      max={5}
                      step={0.1}
                      value={[minRating]}
                      onValueChange={(value: number[]) => setMinRating(value[0])}
                      className="mt-2"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="flex-1"
                    >
                      Reset Filter
                    </Button>
                    <Button
                      onClick={() => {
                        setIsFilterOpen(false);
                        handleSearch();
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Terapkan
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {authorSearchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Penulis: {authorSearchQuery}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setAuthorSearchQuery("")}
                  />
                </Badge>
              )}
              {selectedGenres.map((genre) => (
                <Badge key={genre} variant="secondary" className="gap-1">
                  {genre}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedGenres(selectedGenres.filter(g => g !== genre))}
                  />
                </Badge>
              ))}
              {(pageRange[0] > 0 || pageRange[1] < 2000) && (
                <Badge variant="secondary" className="gap-1">
                  {pageRange[0]}-{pageRange[1]} halaman
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setPageRange([0, 2000])}
                  />
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  ≥ {minRating.toFixed(1)} ★
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setMinRating(0)}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Results */}
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              {isSearching ? "Mencari..." : `${filteredResults.length} hasil ditemukan`}
            </p>
          </div>

          {isSearching ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResults.map((book: Book) => (
                <Card
                  key={book.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onSelectBook(book.id)}
                >
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <ImageWithFallback
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-1">
                      {book.author}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-gray-900 dark:text-white">{book.rating || 4.5}</span>
                      </div>
                      <span className="text-gray-500">{book.pageCount} hal</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isSearching && filteredResults.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">
                Tidak ada hasil ditemukan
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Coba ubah kata kunci atau filter pencarian Anda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
