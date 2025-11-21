import { useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Search, SlidersHorizontal, X, Star, Crown } from "lucide-react";
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

interface SearchScreenProps {
  onSelectBook: (bookId: string) => void;
}

export function SearchScreen({ onSelectBook }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Advanced Filter States
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [pageRange, setPageRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [freeOnly, setFreeOnly] = useState(false);
  const [authorSearchQuery, setAuthorSearchQuery] = useState("");

  const genres = ["Computer Science", "Programming", "Software Engineering", "Algorithms", "Data Structures"];
  const subjects = ["Theory", "Practice", "Design Patterns", "Clean Code", "Refactoring"];
  const languages = ["English", "Bahasa Indonesia", "Mandarin", "Spanyol", "Jepang"];

  const searchResults = [
    {
      id: "1",
      title: "Structure and Interpretation of Computer Programs",
      author: "Harold Abelson, Gerald Jay Sussman",
      genre: "Computer Science",
      subject: "Theory",
      pages: 350,
      rating: 4.9,
      language: "English",
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
      language: "English",
      isPremium: true,
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop",
    },
    {
      id: "3",
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      author: "Erich Gamma",
      genre: "Programming",
      subject: "Design Patterns",
      pages: 395,
      rating: 4.8,
      language: "English",
      isPremium: true,
      image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop",
    },
    {
      id: "4",
      title: "Refactoring: Improving the Design of Existing Code",
      author: "Martin Fowler",
      genre: "Software Engineering",
      subject: "Refactoring",
      pages: 418,
      rating: 4.6,
      language: "Bahasa Indonesia",
      isPremium: false,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
    },
  ];

  const filteredResults = searchResults.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAuthor = authorSearchQuery === "" || book.author.toLowerCase().includes(authorSearchQuery.toLowerCase());
    const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(book.genre);
    const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(book.subject);
    const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(book.language);
    const matchesPages = book.pages >= pageRange[0] && book.pages <= pageRange[1];
    const matchesRating = book.rating >= minRating;
    const matchesFree = !freeOnly || !book.isPremium;
    
    return matchesSearch && matchesAuthor && matchesGenre && matchesSubject && matchesLanguage && matchesPages && matchesRating && matchesFree;
  });

  const handleClearFilters = () => {
    setSelectedGenres([]);
    setSelectedSubjects([]);
    setSelectedLanguages([]);
    setPageRange([0, 10000]);
    setMinRating(0);
    setFreeOnly(false);
    setAuthorSearchQuery("");
  };

  const hasActiveFilters = authorSearchQuery !== "" || selectedGenres.length > 0 || 
                          selectedSubjects.length > 0 || selectedLanguages.length > 0 || 
                          pageRange[0] > 0 || pageRange[1] < 10000 || minRating > 0 || freeOnly;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20 lg:pb-8">
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
                    <h3 className="text-gray-900 dark:text-white mb-3">Genre</h3>
                    <div className="space-y-2">
                      {genres.map((genre) => (
                        <label key={genre} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Checkbox
                            checked={selectedGenres.includes(genre)}
                            onCheckedChange={(checked) => {
                              if (checked) {
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

                  {/* Subject Filter */}
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3">Subjek</h3>
                    <div className="space-y-2">
                      {subjects.map((subject) => (
                        <label key={subject} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                          <Checkbox
                            checked={selectedSubjects.includes(subject)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSubjects([...selectedSubjects, subject]);
                              } else {
                                setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                              }
                            }}
                          />
                          {subject}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-3">Bahasa</h3>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((language) => (
                        <Button
                          key={language}
                          variant={selectedLanguages.includes(language) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (selectedLanguages.includes(language)) {
                              setSelectedLanguages(selectedLanguages.filter(l => l !== language));
                            } else {
                              setSelectedLanguages([...selectedLanguages, language]);
                            }
                          }}
                          className={selectedLanguages.includes(language) ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                        >
                          {language}
                        </Button>
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
                      max={10000}
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
                      onValueChange={(value) => setMinRating(value[0])}
                      className="mt-2"
                    />
                  </div>

                  {/* Free Content Filter */}
                  <div>
                    <label className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer">
                      <Checkbox
                        checked={freeOnly}
                        onCheckedChange={(checked) => setFreeOnly(checked as boolean)}
                      />
                      <span>Hanya Konten Gratis</span>
                    </label>
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
                      onClick={() => setIsFilterOpen(false)}
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
              {selectedSubjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="gap-1">
                  {subject}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedSubjects(selectedSubjects.filter(s => s !== subject))}
                  />
                </Badge>
              ))}
              {selectedLanguages.map((language) => (
                <Badge key={language} variant="secondary" className="gap-1">
                  {language}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedLanguages(selectedLanguages.filter(l => l !== language))}
                  />
                </Badge>
              ))}
              {(pageRange[0] > 0 || pageRange[1] < 10000) && (
                <Badge variant="secondary" className="gap-1">
                  {pageRange[0]}-{pageRange[1]} halaman
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setPageRange([0, 10000])}
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
              {freeOnly && (
                <Badge variant="secondary" className="gap-1">
                  Gratis
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFreeOnly(false)}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Results */}
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredResults.length} hasil ditemukan
              {searchQuery && ` untuk "${searchQuery}"`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map((book) => (
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
                  {book.isPremium && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                        Premium
                      </Badge>
                    </div>
                  )}
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
                      <span className="text-gray-900 dark:text-white">{book.rating}</span>
                    </div>
                    <span className="text-gray-500">{book.pages} hal</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredResults.length === 0 && (
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
