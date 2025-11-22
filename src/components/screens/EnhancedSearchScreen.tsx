import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Crown,
  Mic,
  Camera,
  Clock,
  TrendingUp,
  Grid3x3,
  List,
  SortAsc,
  Sparkles,
  Filter,
  AlertCircle,
} from "lucide-react";
import { BarcodeScanner } from "../ui/BarcodeScanner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { VoiceSearch } from "../VoiceSearch";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Book } from "../../utils/collections";
import { EmptyState } from "../EmptyState";
import { ErrorState } from "../ErrorState";
import { BookCardSkeleton } from "../skeletons/BookCardSkeleton";

interface SearchScreenProps {
  onSelectBook: (bookId: string) => void;
  darkMode?: boolean;
}

export function EnhancedSearchScreen({ onSelectBook, darkMode = false }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isbnSearchQuery, setIsbnSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("librago-recent-searches");
    return saved ? JSON.parse(saved) : ["Clean Code", "Design Patterns", "Python", "React"];
  });

  // API States
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Advanced Filter States
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [publisherSearchQuery, setPublisherSearchQuery] = useState("");
  const [pageRange, setPageRange] = useState([0, 10000]);
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [freeOnly, setFreeOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [authorSearchQuery, setAuthorSearchQuery] = useState("");

  const genres = ["Computer Science", "Programming", "Software Engineering", "Algorithms", "Data Structures", "AI & ML", "Design", "Business"];
  const subjects = ["Theory", "Practice", "Design Patterns", "Clean Code", "Refactoring", "Testing", "DevOps"];
  const languages = [
    { code: "en", flag: "🇬🇧" },
    { code: "id", flag: "🇮🇩" },
    { code: "zh", flag: "🇨🇳" },
    { code: "es", flag: "🇪🇸" },
    { code: "ja", flag: "🇯🇵" },
    { code: "fr", flag: "🇫🇷" },
  ];

  // Fetch trending books on mount
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const books = await api.getTrendingBooks();
        setTrendingBooks(books);
      } catch (err) {
        console.error("Failed to load trending books", err);
      } finally {
        setIsTrendingLoading(false);
      }
    };
    loadTrending();
  }, []);

  // Persist recent searches
  useEffect(() => {
    localStorage.setItem("librago-recent-searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const searchSuggestions = searchQuery.length > 0 ? [
    `${searchQuery} tutorial`,
    `${searchQuery} for beginners`,
    `${searchQuery} advanced`,
    `${searchQuery} best practices`,
  ] : [];

  const handleSearch = async (query: string) => {
    // Allow empty query if we have advanced filters
    const hasAdvancedFilters = authorSearchQuery || publisherSearchQuery || isbnSearchQuery || selectedGenres.length > 0;
    if (!query.trim() && !hasAdvancedFilters) return;

    setSearchQuery(query);
    setIsLoading(true);
    setError(null);
    setResults([]);
    setStartIndex(0);
    setHasMore(true);

    // Update recent searches
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }

    try {
      // Construct advanced query
      let terms: string[] = [];

      // If ISBN is present, it overrides other text queries for precision
      if (isbnSearchQuery) {
        terms.push(`isbn:${isbnSearchQuery}`);
      } else {
        if (query.trim()) terms.push(query);
        if (authorSearchQuery) terms.push(`inauthor:${authorSearchQuery}`);
        if (publisherSearchQuery) terms.push(`inpublisher:${publisherSearchQuery}`);
        if (selectedGenres.length > 0) terms.push(`subject:${selectedGenres[0]}`);
      }

      const apiQuery = terms.join("+");
      const langRestrict = selectedLanguages.length > 0 ? selectedLanguages[0] : "";

      const books = await api.searchBooks(apiQuery, 20, 0, langRestrict, sortBy);

      // Client-side filtering
      let filteredBooks = books;

      if (minRating > 0) {
        filteredBooks = filteredBooks.filter(b => (b.rating || 0) >= minRating);
      }

      if (pageRange[0] > 0 || pageRange[1] < 10000) {
        filteredBooks = filteredBooks.filter(b => {
          const pages = b.pageCount || 0;
          return pages >= pageRange[0] && pages <= pageRange[1];
        });
      }

      if (yearStart || yearEnd) {
        filteredBooks = filteredBooks.filter(b => {
          if (!b.publishedDate) return false;
          const year = parseInt(b.publishedDate.substring(0, 4));
          if (isNaN(year)) return false;
          const start = yearStart ? parseInt(yearStart) : 0;
          const end = yearEnd ? parseInt(yearEnd) : 9999;
          return year >= start && year <= end;
        });
      }

      if (selectedLanguages.length > 0) {
        filteredBooks = filteredBooks.filter(b => b.language && selectedLanguages.includes(b.language));
      }

      setResults(filteredBooks);
      setHasMore(books.length === 20);
    } catch (err) {
      setError("Gagal mencari buku. Silakan coba lagi.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextIndex = startIndex + 20;

    try {
      let terms: string[] = [];
      if (isbnSearchQuery) {
        terms.push(`isbn:${isbnSearchQuery}`);
      } else {
        if (searchQuery.trim()) terms.push(searchQuery);
        if (authorSearchQuery) terms.push(`inauthor:${authorSearchQuery}`);
        if (publisherSearchQuery) terms.push(`inpublisher:${publisherSearchQuery}`);
        if (selectedGenres.length > 0) terms.push(`subject:${selectedGenres[0]}`);
      }

      const apiQuery = terms.join("+");
      const langRestrict = selectedLanguages.length > 0 ? selectedLanguages[0] : "";

      const newBooks = await api.searchBooks(apiQuery, 20, nextIndex, langRestrict, sortBy);

      // Apply same client-side filters
      let filteredNewBooks = newBooks;
      if (minRating > 0) filteredNewBooks = filteredNewBooks.filter(b => (b.rating || 0) >= minRating);
      if (pageRange[0] > 0 || pageRange[1] < 10000) {
        filteredNewBooks = filteredNewBooks.filter(b => {
          const pages = b.pageCount || 0;
          return pages >= pageRange[0] && pages <= pageRange[1];
        });
      }
      if (yearStart || yearEnd) {
        filteredNewBooks = filteredNewBooks.filter(b => {
          if (!b.publishedDate) return false;
          const year = parseInt(b.publishedDate.substring(0, 4));
          if (isNaN(year)) return false;
          const start = yearStart ? parseInt(yearStart) : 0;
          const end = yearEnd ? parseInt(yearEnd) : 9999;
          return year >= start && year <= end;
        });
      }
      if (selectedLanguages.length > 0) {
        filteredNewBooks = filteredNewBooks.filter(b => b.language && selectedLanguages.includes(b.language));
      }

      setResults(prev => [...prev, ...filteredNewBooks]);
      setStartIndex(nextIndex);
      setHasMore(newBooks.length === 20);
    } catch (err) {
      toast.error("Gagal memuat lebih banyak buku");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
    if (isbnSearchQuery) {
      setSearchQuery(""); // Clear main search if ISBN is used
      handleSearch("");
    } else {
      handleSearch(searchQuery);
    }
    toast.success("Filters applied");
  };

  const handleVoiceResult = (text: string) => {
    handleSearch(text);
    setShowVoiceSearch(false);
  };

  const handleScanResult = (result: string) => {
    setShowScanner(false);
    const isbnQuery = `isbn:${result}`;
    handleSearch(isbnQuery);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedSubjects([]);
    setSelectedLanguages([]);
    setPublisherSearchQuery("");
    setPageRange([0, 10000]);
    setYearStart("");
    setYearEnd("");
    setMinRating(0);
    setFreeOnly(false);
    setPremiumOnly(false);
    setAuthorSearchQuery("");
    setIsbnSearchQuery("");
    setSortBy("relevance");
    toast.success("Filters cleared");
  };

  const activeFilterCount =
    selectedGenres.length +
    selectedSubjects.length +
    selectedLanguages.length +
    (publisherSearchQuery ? 1 : 0) +
    (isbnSearchQuery ? 1 : 0) +
    (authorSearchQuery ? 1 : 0) +
    (freeOnly ? 1 : 0) +
    (premiumOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (sortBy !== "relevance" ? 1 : 0) +
    (yearStart || yearEnd ? 1 : 0) +
    (pageRange[0] > 0 || pageRange[1] < 10000 ? 1 : 0);

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${darkMode ? "bg-transparent" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white">Cari Buku</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {results.length > 0 ? `${results.length.toLocaleString()} buku ditemukan` : "Temukan buku favoritmu"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari judul, penulis, ISBN, atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                className="pl-12 pr-12 h-12 text-base"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Voice Search */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0"
              onClick={() => setShowVoiceSearch(true)}
            >
              <Mic className="w-5 h-5" />
            </Button>

            {/* Barcode Scanner */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0"
              onClick={() => setShowScanner(true)}
            >
              <Camera className="w-5 h-5" />
            </Button>

            {/* Advanced Filters */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 gap-2 relative border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-600 hover:bg-blue-700">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Refine Search
                      </SheetTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Reset
                      </Button>
                    </div>
                    <SheetDescription>
                      Customize your search results with precision
                    </SheetDescription>
                  </SheetHeader>

                  <ScrollArea className="flex-1 px-6 py-6">
                    <div className="space-y-8">
                      {/* Sort & Order */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <SortAsc className="w-4 h-4 text-blue-500" />
                          Sort Order
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {["relevance", "newest"].map((sort) => (
                            <div
                              key={sort}
                              className={`
                                cursor-pointer rounded-xl border-2 p-3 text-center transition-all
                                ${sortBy === sort
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                  : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                                }
                              `}
                              onClick={() => setSortBy(sort)}
                            >
                              <span className="text-sm font-medium capitalize">{sort}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-gray-100 dark:bg-gray-800" />

                      {/* Specific Identifiers */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Search className="w-4 h-4 text-purple-500" />
                          Specific Details
                        </h3>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">ISBN</Label>
                            <Input
                              placeholder="978-..."
                              value={isbnSearchQuery}
                              onChange={(e) => setIsbnSearchQuery(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-500">Author</Label>
                              <Input
                                placeholder="Name..."
                                value={authorSearchQuery}
                                onChange={(e) => setAuthorSearchQuery(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-gray-500">Publisher</Label>
                              <Input
                                placeholder="Name..."
                                value={publisherSearchQuery}
                                onChange={(e) => setPublisherSearchQuery(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gray-100 dark:bg-gray-800" />

                      {/* Categories & Language */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Grid3x3 className="w-4 h-4 text-green-500" />
                          Categories & Language
                        </h3>

                        <Tabs defaultValue="genres" className="w-full">
                          <TabsList className="w-full grid grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                            <TabsTrigger value="genres" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Genres</TabsTrigger>
                            <TabsTrigger value="languages" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Languages</TabsTrigger>
                          </TabsList>

                          <TabsContent value="genres" className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {genres.map((genre) => (
                                <Badge
                                  key={genre}
                                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                                  className={`
                                    cursor-pointer px-3 py-1.5 rounded-full transition-all
                                    ${selectedGenres.includes(genre)
                                      ? "bg-blue-600 hover:bg-blue-700 border-transparent"
                                      : "hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    }
                                  `}
                                  onClick={() => {
                                    setSelectedGenres(prev =>
                                      prev.includes(genre)
                                        ? prev.filter(g => g !== genre)
                                        : [...prev, genre]
                                    );
                                  }}
                                >
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="languages" className="mt-3">
                            <div className="grid grid-cols-3 gap-2">
                              {languages.map((lang) => (
                                <div
                                  key={lang.code}
                                  className={`
                                    cursor-pointer rounded-lg border p-2 text-center text-2xl transition-all
                                    ${selectedLanguages.includes(lang.code)
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                    }
                                  `}
                                  onClick={() => {
                                    setSelectedLanguages(prev =>
                                      prev.includes(lang.code)
                                        ? prev.filter(l => l !== lang.code)
                                        : [...prev, lang.code]
                                    );
                                  }}
                                >
                                  {lang.flag}
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      <Separator className="bg-gray-100 dark:bg-gray-800" />

                      {/* Year Range */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          Publication Year
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              placeholder="From"
                              value={yearStart}
                              onChange={(e) => setYearStart(e.target.value)}
                              className="pl-3 pr-3 text-center bg-gray-50 dark:bg-gray-800/50"
                            />
                          </div>
                          <span className="text-gray-400">-</span>
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              placeholder="To"
                              value={yearEnd}
                              onChange={(e) => setYearEnd(e.target.value)}
                              className="pl-3 pr-3 text-center bg-gray-50 dark:bg-gray-800/50"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gray-100 dark:bg-gray-800" />

                      {/* Access Type */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          Access Type
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            className={`
                              cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all
                              ${freeOnly
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-100 dark:border-gray-800 hover:border-gray-200"
                              }
                            `}
                            onClick={() => {
                              setFreeOnly(!freeOnly);
                              if (!freeOnly) setPremiumOnly(false);
                            }}
                          >
                            <span className="text-sm font-medium">Free</span>
                          </div>
                          <div
                            className={`
                              cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all
                              ${premiumOnly
                                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                                : "border-gray-100 dark:border-gray-800 hover:border-gray-200"
                              }
                            `}
                            onClick={() => {
                              setPremiumOnly(!premiumOnly);
                              if (!premiumOnly) setFreeOnly(false);
                            }}
                          >
                            <span className="text-sm font-medium">Premium</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <Button
                      className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl"
                      onClick={applyFilters}
                    >
                      Apply Filters ({activeFilterCount})
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Search Suggestions */}
          {searchQuery && searchSuggestions.length > 0 && (
            <Card className="mt-2 p-3">
              <div className="space-y-1">
                {searchSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => handleSearch(suggestion)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Recent & Trending */}
        {!searchQuery && !results.length && !isLoading && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Recent Searches */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-gray-900 dark:text-white">Recent Searches</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSearch(search)}
                  >
                    {search}
                  </Badge>
                ))}
                {recentSearches.length === 0 && (
                  <p className="text-sm text-gray-500">No recent searches</p>
                )}
              </div>
            </Card>

            {/* Trending Books */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h3 className="text-gray-900 dark:text-white">Trending Books</h3>
              </div>
              {isTrendingLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {trendingBooks.slice(0, 5).map((book, index) => (
                    <Button
                      key={book.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => onSelectBook(book.id)}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-gray-500 flex-shrink-0">#{index + 1}</span>
                        <span className="truncate">{book.title}</span>
                      </span>
                      <Badge variant="outline" className="ml-2 flex-shrink-0">{book.rating} ★</Badge>
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Results Header */}
        {(searchQuery || results.length > 0 || isLoading) && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLoading
                ? "Searching..."
                : results.length > 0
                  ? `${results.length} results found`
                  : "No results found"}
            </p>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedGenres.map((genre) => (
              <Badge key={genre} variant="secondary" className="gap-1">
                {genre}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() =>
                    setSelectedGenres(selectedGenres.filter((g) => g !== genre))
                  }
                />
              </Badge>
            ))}
            {freeOnly && (
              <Badge variant="secondary" className="gap-1">
                Free Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFreeOnly(false)} />
              </Badge>
            )}
            {premiumOnly && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="w-3 h-3" />
                Premium Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPremiumOnly(false)} />
              </Badge>
            )}
          </div>
        )}

        {/* Content Area */}
        {isLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Gagal memuat buku"
            description={error}
            onRetry={() => handleSearch(searchQuery)}
          />
        ) : results.length === 0 && searchQuery ? (
          <EmptyState
            icon={Search}
            title="Tidak ada hasil ditemukan"
            description={`Kami tidak dapat menemukan buku yang cocok dengan "${searchQuery}". Coba kata kunci lain atau kurangi filter.`}
            actionLabel="Hapus Filter"
            onAction={clearFilters}
          />
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}>
            {results.map((book) => (
              <Card
                key={book.id}
                className={`cursor-pointer hover:shadow-lg transition-all ${viewMode === "list" ? "p-4 flex gap-4" : "p-4"
                  }`}
                onClick={() => onSelectBook(book.id)}
              >
                {viewMode === "grid" ? (
                  <>
                    <div className="relative mb-3">
                      <ImageWithFallback
                        src={book.image}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {/* Premium badge would go here if we had that data reliably */}
                    </div>
                    <h3 className="text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 font-medium">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                      {book.author}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{book.rating || "N/A"}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {book.pageCount ? `${book.pageCount}p` : "Unknown"}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative w-24 h-32 flex-shrink-0">
                      <ImageWithFallback
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-gray-900 dark:text-white line-clamp-2 font-medium">
                          {book.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {book.author}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {book.genre && book.genre.slice(0, 2).map((g, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">
                          {book.pageCount} pages
                        </Badge>
                        {book.publishedDate && (
                          <Badge variant="outline" className="text-xs">
                            {book.publishedDate.substring(0, 4)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{book.rating || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {results.length > 0 && hasMore && !isLoading && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="min-w-[200px]"
            >
              {isLoadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2" />
                  Loading more...
                </>
              ) : (
                "Load More Results"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Voice Search Modal */}
      {showVoiceSearch && (
        <VoiceSearch
          onResult={handleVoiceResult}
          onClose={() => setShowVoiceSearch(false)}
        />
      )}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
      />
    </div>
  );
}
