import { useState } from "react";
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
} from "lucide-react";
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
import { toast } from "sonner@2.0.3";

interface SearchScreenProps {
  onSelectBook: (bookId: string) => void;
}

export function EnhancedSearchScreen({ onSelectBook }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [recentSearches, setRecentSearches] = useState([
    "Clean Code",
    "Design Patterns",
    "Python Programming",
    "Machine Learning",
  ]);
  
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
  const languages = ["English", "Bahasa Indonesia", "Mandarin", "Spanish", "Japanese", "French"];

  const trendingSearches = [
    { query: "AI Programming", count: "2.4K" },
    { query: "React Hooks", count: "1.8K" },
    { query: "System Design", count: "1.2K" },
    { query: "TypeScript", count: "956" },
  ];

  const searchSuggestions = searchQuery.length > 0 ? [
    `${searchQuery} tutorial`,
    `${searchQuery} for beginners`,
    `${searchQuery} advanced`,
    `${searchQuery} best practices`,
  ] : [];

  const searchResults = [
    {
      id: "1",
      title: "Structure and Interpretation of Computer Programs",
      author: "Harold Abelson, Gerald Jay Sussman",
      genre: "Computer Science",
      subject: "Theory",
      pages: 350,
      rating: 4.9,
      reviews: 1234,
      language: "English",
      publisher: "MIT Press",
      year: 1996,
      isbn: "978-0-262-01153-2",
      isPremium: false,
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop",
    },
    {
      id: "2",
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      genre: "Software Engineering",
      subject: "Clean Code",
      pages: 464,
      rating: 4.7,
      reviews: 2341,
      language: "English",
      publisher: "Addison-Wesley",
      year: 2008,
      isbn: "978-0-132-35088-4",
      isPremium: true,
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop",
    },
    {
      id: "3",
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
      genre: "Programming",
      subject: "Design Patterns",
      pages: 395,
      rating: 4.8,
      reviews: 1876,
      language: "English",
      publisher: "Addison-Wesley",
      year: 1994,
      isbn: "978-0-201-63361-0",
      isPremium: true,
      image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop",
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }
  };

  const handleVoiceResult = (text: string) => {
    handleSearch(text);
    setShowVoiceSearch(false);
  };

  const handleBarcodeScanner = () => {
    toast.success("Barcode scanner will open (camera required)");
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
    toast.success("Filters cleared");
  };

  const activeFilterCount = 
    selectedGenres.length +
    selectedSubjects.length +
    selectedLanguages.length +
    (publisherSearchQuery ? 1 : 0) +
    (freeOnly ? 1 : 0) +
    (premiumOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
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
                {searchResults.length.toLocaleString()} buku tersedia
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
              className="h-12 w-12"
              onClick={() => setShowVoiceSearch(true)}
            >
              <Mic className="w-5 h-5" />
            </Button>

            {/* Barcode Scanner */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={handleBarcodeScanner}
            >
              <Camera className="w-5 h-5" />
            </Button>

            {/* Advanced Filters */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 gap-2 relative">
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="hidden sm:inline">Filter</span>
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                  <SheetDescription>
                    Filter pencarian berdasarkan berbagai kriteria untuk hasil yang lebih spesifik
                  </SheetDescription>
                </SheetHeader>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                <div className="space-y-6 mt-6">
                  {/* Author Search */}
                  <div>
                    <Label className="text-sm mb-2">Search by Author</Label>
                    <Input
                      placeholder="Author name..."
                      value={authorSearchQuery}
                      onChange={(e) => setAuthorSearchQuery(e.target.value)}
                    />
                    {authorSearchQuery && (
                      <p className="text-xs text-gray-500 mt-2">
                        Filtering by author: <span className="text-blue-600 dark:text-blue-400">{authorSearchQuery}</span>
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Publisher Search */}
                  <div>
                    <Label className="text-sm mb-2">Search by Publisher</Label>
                    <Input
                      placeholder="Publisher name..."
                      value={publisherSearchQuery}
                      onChange={(e) => setPublisherSearchQuery(e.target.value)}
                    />
                    {publisherSearchQuery && (
                      <p className="text-xs text-gray-500 mt-2">
                        Filtering by publisher: <span className="text-blue-600 dark:text-blue-400">{publisherSearchQuery}</span>
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Publication Year */}
                  <div>
                    <Label className="text-sm mb-3">Publication Year</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">From</label>
                        <Input
                          type="number"
                          placeholder="e.g., 1990"
                          value={yearStart}
                          onChange={(e) => setYearStart(e.target.value)}
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">To</label>
                        <Input
                          type="number"
                          placeholder="e.g., 2024"
                          value={yearEnd}
                          onChange={(e) => setYearEnd(e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                    {yearStart && yearEnd && (
                      <p className="text-xs text-gray-500 mt-2">
                        Books published between {yearStart} and {yearEnd}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Genre */}
                  <div>
                    <Label className="text-sm mb-3">Genre</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {genres.map((genre) => (
                        <div key={genre} className="flex items-center">
                          <Checkbox
                            id={`genre-${genre}`}
                            checked={selectedGenres.includes(genre)}
                            onCheckedChange={(checked) => {
                              setSelectedGenres(
                                checked
                                  ? [...selectedGenres, genre]
                                  : selectedGenres.filter((g) => g !== genre)
                              );
                            }}
                          />
                          <label
                            htmlFor={`genre-${genre}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {genre}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Subject */}
                  <div>
                    <Label className="text-sm mb-3">Subject</Label>
                    <div className="space-y-2">
                      {subjects.map((subject) => (
                        <div key={subject} className="flex items-center">
                          <Checkbox
                            id={`subject-${subject}`}
                            checked={selectedSubjects.includes(subject)}
                            onCheckedChange={(checked) => {
                              setSelectedSubjects(
                                checked
                                  ? [...selectedSubjects, subject]
                                  : selectedSubjects.filter((s) => s !== subject)
                              );
                            }}
                          />
                          <label
                            htmlFor={`subject-${subject}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {subject}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Language */}
                  <div>
                    <Label className="text-sm mb-3">Language</Label>
                    <div className="space-y-2">
                      {languages.map((language) => (
                        <div key={language} className="flex items-center">
                          <Checkbox
                            id={`lang-${language}`}
                            checked={selectedLanguages.includes(language)}
                            onCheckedChange={(checked) => {
                              setSelectedLanguages(
                                checked
                                  ? [...selectedLanguages, language]
                                  : selectedLanguages.filter((l) => l !== language)
                              );
                            }}
                          />
                          <label
                            htmlFor={`lang-${language}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {language}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Page Range */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm">Pages</Label>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {pageRange[0]} - {pageRange[1]}
                      </span>
                    </div>
                    <Slider
                      value={pageRange}
                      onValueChange={setPageRange}
                      min={0}
                      max={10000}
                      step={100}
                      className="mb-2"
                    />
                  </div>

                  <Separator />

                  {/* Rating */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm">Minimum Rating</Label>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {minRating} ⭐
                      </span>
                    </div>
                    <Slider
                      value={[minRating]}
                      onValueChange={(value) => setMinRating(value[0])}
                      min={0}
                      max={5}
                      step={0.5}
                    />
                  </div>

                  <Separator />

                  {/* Premium Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="free-only" className="text-sm">
                        Free Books Only
                      </Label>
                      <Checkbox
                        id="free-only"
                        checked={freeOnly}
                        onCheckedChange={(checked) => {
                          setFreeOnly(!!checked);
                          if (checked) setPremiumOnly(false);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="premium-only" className="text-sm flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Premium Books Only
                      </Label>
                      <Checkbox
                        id="premium-only"
                        checked={premiumOnly}
                        onCheckedChange={(checked) => {
                          setPremiumOnly(!!checked);
                          if (checked) setFreeOnly(false);
                        }}
                      />
                    </div>
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
        {!searchQuery && (
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
              </div>
            </Card>

            {/* Trending */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h3 className="text-gray-900 dark:text-white">Trending Searches</h3>
              </div>
              <div className="space-y-2">
                {trendingSearches.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => handleSearch(item.query)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-gray-500">#{index + 1}</span>
                      {item.query}
                    </span>
                    <Badge variant="outline">{item.count}</Badge>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {searchQuery
              ? `${searchResults.length} results for "${searchQuery}"`
              : "All Books"}
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
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
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

        {/* Results Grid/List */}
        <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}>
          {searchResults.map((book) => (
            <Card
              key={book.id}
              className={`cursor-pointer hover:shadow-lg transition-all ${
                viewMode === "list" ? "p-4 flex gap-4" : "p-4"
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
                    {book.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                    {book.author}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{book.rating}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {book.pages}p
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
                      <h3 className="text-gray-900 dark:text-white line-clamp-2">
                        {book.title}
                      </h3>
                      {book.isPremium && (
                        <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {book.author}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {book.genre}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {book.pages} pages
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {book.year}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{book.rating}</span>
                        <span className="text-xs text-gray-500">
                          ({book.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Voice Search Modal */}
      {showVoiceSearch && (
        <VoiceSearch
          onResult={handleVoiceResult}
          onClose={() => setShowVoiceSearch(false)}
        />
      )}
    </div>
  );
}

function Label({ children, htmlFor, className }: any) {
  return (
    <label htmlFor={htmlFor} className={`text-sm text-gray-900 dark:text-white ${className || ""}`}>
      {children}
    </label>
  );
}
