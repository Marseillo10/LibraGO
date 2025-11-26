import { useState, useEffect, useRef, useCallback } from "react";
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
  ScanBarcode,
  Clock,
  TrendingUp,
  Grid3x3,
  List,
  SortAsc,
  Sparkles,
  Filter,
  AlertCircle,
  Quote,
  Ban,
  BookOpen,
  FileText,
  Globe,
  Calendar,
  Hash,
  User,
  Building2,
  Library,
  ChevronDown,
  Heart,
  Info,
} from "lucide-react";
import Fuse from 'fuse.js';
import { BarcodeScanner } from "../ui/BarcodeScanner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cleanDescription } from "../../utils/textUtils";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { VoiceSearch } from "../VoiceSearch";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Book } from "../../utils/collections";
import { useBooks } from "../../context/BooksContext";
import { EmptyState } from "../EmptyState";
import { ErrorState } from "../ErrorState";
import { BookCardSkeleton } from "../skeletons/BookCardSkeleton";

interface SearchScreenProps {
  onSelectBook: (bookId: string) => void;
  darkMode?: boolean;
}

import { useDebounce } from "../../hooks/useDebounce";

// ... existing imports

export function EnhancedSearchScreen({ onSelectBook, darkMode = false }: SearchScreenProps) {
  const { searchState, setSearchState } = useBooks();

  // Initialize from context or default
  const [searchQuery, setSearchQuery] = useState(searchState.query || "");
  const debouncedQuery = useDebounce(searchQuery, 500); // 500ms delay

  const [isFilterOpen, setIsFilterOpen] = useState(searchState.isFilterOpen || false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const shouldShowSuggestions = useRef(true);

  const [viewMode, setViewMode] = useState<"grid" | "list">(searchState.viewMode || "grid");
  const [sortBy, setSortBy] = useState(searchState.filters?.sortBy || "relevance");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("librago-recent-searches");
    return saved ? JSON.parse(saved) : ["Clean Code", "Design Patterns", "Python", "React"];
  });

  // API States
  const [results, setResults] = useState<Book[]>(searchState.results || []);
  const [totalResults, setTotalResults] = useState<number>(searchState.totalResults || 0);
  const [displayedResults, setDisplayedResults] = useState<Book[]>(searchState.results || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Infinite Scroll Observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastBookElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        handleLoadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore]);

  // Advanced Filter States
  const [selectedGenres, setSelectedGenres] = useState<string[]>(searchState.filters?.selectedGenres || []);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(searchState.filters?.selectedSubjects || []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(searchState.filters?.selectedLanguages || []);
  const [publisherSearchQuery, setPublisherSearchQuery] = useState(searchState.filters?.publisherSearchQuery || "");
  const [titleSearchQuery, setTitleSearchQuery] = useState(searchState.filters?.titleSearchQuery || "");
  const [subjectSearchQuery, setSubjectSearchQuery] = useState(searchState.filters?.subjectSearchQuery || "");
  const [isbnSearchQuery, setIsbnSearchQuery] = useState(searchState.filters?.isbnSearchQuery || "");
  const [issnSearchQuery, setIssnSearchQuery] = useState(searchState.filters?.issnSearchQuery || "");
  const [isYearFilterEnabled, setIsYearFilterEnabled] = useState(searchState.filters?.isYearFilterEnabled || false);
  const [yearRange, setYearRange] = useState(searchState.filters?.yearRange || [1990, 2025]);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Advanced Keywords
  const [exactPhrase, setExactPhrase] = useState(searchState.filters?.exactPhrase || "");
  const [atLeastOne, setAtLeastOne] = useState(searchState.filters?.atLeastOne || "");
  const [withoutWords, setWithoutWords] = useState(searchState.filters?.withoutWords || "");

  // Advanced Filters
  const [printType, setPrintType] = useState(searchState.filters?.printType || "all"); // all, books, magazines
  const [filterType, setFilterType] = useState(searchState.filters?.filterType || ""); // partial, full, free-ebooks, paid-ebooks, ebooks

  const [pageRange, setPageRange] = useState(searchState.filters?.pageRange || [0, 10000]);
  const [yearStart, setYearStart] = useState(searchState.filters?.yearStart || "");
  const [yearEnd, setYearEnd] = useState(searchState.filters?.yearEnd || "");
  const [minRating, setMinRating] = useState(searchState.filters?.minRating || 0);
  const [freeOnly, setFreeOnly] = useState(searchState.filters?.freeOnly || false);
  const [premiumOnly, setPremiumOnly] = useState(searchState.filters?.premiumOnly || false);
  const [includeLowQuality, setIncludeLowQuality] = useState(searchState.filters?.includeLowQuality || false);
  const [authorSearchQuery, setAuthorSearchQuery] = useState(searchState.filters?.authorSearchQuery || "");

  const genres = ["Computer Science", "Programming", "Software Engineering", "Algorithms", "Data Structures", "AI & ML", "Design", "Business"];
  const subjects = ["Theory", "Practice", "Design Patterns", "Clean Code", "Refactoring", "Testing", "DevOps"];
  const languages = [
    { code: "en", flag: "🇬🇧", name: "English" },
    { code: "id", flag: "🇮🇩", name: "Indonesian" },
    { code: "es", flag: "🇪🇸", name: "Spanish" },
    { code: "fr", flag: "🇫🇷", name: "French" },
    { code: "de", flag: "🇩🇪", name: "German" },
    { code: "it", flag: "🇮🇹", name: "Italian" },
    { code: "pt", flag: "🇵🇹", name: "Portuguese" },
    { code: "ru", flag: "🇷🇺", name: "Russian" },
    { code: "ja", flag: "🇯🇵", name: "Japanese" },
    { code: "zh", flag: "🇨🇳", name: "Chinese" },
    { code: "ko", flag: "🇰🇷", name: "Korean" },
    { code: "ar", flag: "🇸🇦", name: "Arabic" },
    { code: "hi", flag: "🇮🇳", name: "Hindi" },
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

  const scrollRef = useRef(0);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position if returning from navigation
  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Restore scroll position if returning from navigation
    if (searchState.scrollPosition > 0) {
      window.scrollTo(0, searchState.scrollPosition);

      // Double check after a small delay
      setTimeout(() => {
        if (Math.abs(window.scrollY - searchState.scrollPosition) > 50) {
          window.scrollTo(0, searchState.scrollPosition);
        }
      }, 100);
    }

    // Reset restoring flag after initial render and debounce period
    setTimeout(() => {
      isRestoring.current = false;
    }, 1000);

    // Save scroll position on unmount
    return () => {
      setSearchState((prev: any) => ({ ...prev, scrollPosition: scrollRef.current }));
    };
  }, []);

  // Persist recent searches
  useEffect(() => {
    localStorage.setItem("librago-recent-searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Persist View Mode
  useEffect(() => {
    setSearchState((prev: any) => ({ ...prev, viewMode }));
  }, [viewMode]);

  // Persist Filter Open State
  useEffect(() => {
    setSearchState((prev: any) => ({ ...prev, isFilterOpen }));
  }, [isFilterOpen]);

  // Improved Search Suggestions Logic
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  // Ref to track if we are restoring state to prevent auto-suggestions
  const isRestoring = useRef(!!searchState.query);

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Don't show suggestions if we are restoring state or query is too short
      if (isRestoring.current || !shouldShowSuggestions.current || !debouncedQuery || debouncedQuery.length < 3) {
        setSuggestedBooks([]);
        setShowSuggestions(false);
        return;
      }

      setIsSuggestionsLoading(true);
      setShowSuggestions(true);
      try {
        // Fetch a small number of books for suggestions
        const { docs: books } = await api.searchBooks(debouncedQuery, 5);
        setSuggestedBooks(books);
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
      } finally {
        setIsSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Auto-trigger search for ISBN deep links
  useEffect(() => {
    if (searchQuery.startsWith("isbn:") && results.length === 0 && !isLoading) {
      handleSearch(searchQuery, true);
    }
  }, [searchQuery]);

  const getSearchSuggestions = () => {
    if (!searchQuery.trim()) return [];
    // We now use suggestedBooks for the main suggestions, 
    // but we can still keep history if query is empty or short? 
    // The requirement is "always book title with little teks author below and it book cover".
    // So we primarily rely on suggestedBooks.
    return [];
  };



  // Fuse.js instance for instant fuzzy search
  const fuseOptions = {
    keys: ['title', 'author', 'description', 'genre'],
    threshold: 0.4, // Match fuzziness (0.0 = exact, 1.0 = match anything)
    distance: 100,
    minMatchCharLength: 2,
    shouldSort: true,
  };

  // Instant Fuzzy Search Effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayedResults(results);
      return;
    }

    // If we have results, filter them instantly while API loads
    if (results.length > 0) {
      const fuse = new Fuse(results, fuseOptions);
      const fuseResults = fuse.search(searchQuery);

      // If Fuse finds matches, show them. Otherwise show all (fallback to API waiting)
      if (fuseResults.length > 0) {
        setDisplayedResults(fuseResults.map(r => r.item));
      } else {
        // If local search fails, we might be searching for something new entirely.
        // Keep showing current results until API updates, or show empty?
        // Showing current results is less jarring.
        setDisplayedResults(results);
      }
    }
  }, [searchQuery, results]);

  // Scroll Indicator Logic
  useEffect(() => {
    const hasSeenIndicator = sessionStorage.getItem("hasSeenScrollIndicator");
    if (!hasSeenIndicator) {
      setShowScrollIndicator(true);
    }
  }, []);

  const handleScroll = () => {
    if (showScrollIndicator) {
      setShowScrollIndicator(false);
      sessionStorage.setItem("hasSeenScrollIndicator", "true");
    }
  };

  const handleSearch = async (query: string, saveToHistory = false) => {
    // Allow empty query if we have advanced filters
    const hasAdvancedFilters = titleSearchQuery || authorSearchQuery || publisherSearchQuery || subjectSearchQuery || isbnSearchQuery || issnSearchQuery || isYearFilterEnabled || selectedGenres.length > 0 || exactPhrase || atLeastOne || withoutWords;
    if (!query.trim() && !hasAdvancedFilters) return;

    // Update recent searches
    if (query.trim() && saveToHistory) {
      setRecentSearches(prev => {
        const newRecent = [query.trim(), ...prev.filter(s => s !== query.trim())].slice(0, 10);
        localStorage.setItem("librago-recent-searches", JSON.stringify(newRecent));
        return newRecent;
      });
      setShowSuggestions(false); // Hide suggestions ONLY when search is explicitly executed (Enter or Click)
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setTotalResults(0);
    setStartIndex(0);
    setHasMore(true);

    // Update recent searches only on manual enter or distinct actions, 
    // maybe not on every keystroke. For now, let's keep it simple or move it to a "onBlur" or specific action if needed.
    // To avoid spamming recent searches, we can check if the query is long enough or complete.
    // For this demo, we'll add it if it's a "Smart Search" result or explicitly submitted.

    try {
      // Construct advanced query
      let terms: string[] = [];

      // SMART SEARCH LOGIC
      let cleanQuery = query.trim();

      // 0. Pre-processing: Remove filler words
      cleanQuery = cleanQuery.replace(/^(show me|find|search for|look for|get|i want) /i, "");

      // 1. Natural Language Patterns (NLP-lite)
      const patterns = [
        { regex: /(?:books?|novels?|stories?) (?:about|concerning|on) (.+)/i, type: 'subject' },
        { regex: /(?:books?|novels?|works?) (?:by|written by|authored by) (.+)/i, type: 'author' },
        { regex: /(?:published|released) (?:in|from) (\d{4})/i, type: 'year' },
        { regex: /(?:published|released) (?:by) (.+)/i, type: 'publisher' },
        { regex: /(?:books?|novels?) (?:in) (english|spanish|french|german|italian|indonesian|japanese|chinese|korean|russian)/i, type: 'language' }
      ];

      let nlpMatchFound = false;
      for (const pattern of patterns) {
        const match = cleanQuery.match(pattern.regex);
        if (match && match[1]) {
          const value = match[1].trim();
          if (pattern.type === 'year') {
            // For year, we might want to set the year filter or add to query
            // Let's add to query for now as 'published:YYYY' isn't standard in our API wrapper but 'subject' etc are.
            // Actually, OpenLibrary supports 'published:YYYY' in q parameter usually, or we can use our client side filter.
            // Let's try adding it to terms if it's a standard field, or handle specially.
            // For simplicity in this "Smart Search", let's map to our known prefixes.
            // But wait, our API wrapper takes a single query string.
            // Let's push to terms.
            // However, for 'year', we have a client-side filter `isYearFilterEnabled`.
            // Maybe we should enable that?
            // For now, let's stick to query terms for simplicity and robustness.
            // Open Library often accepts just the year.
            terms.push(value);
          } else {
            terms.push(`${pattern.type}:${value}`);
          }
          nlpMatchFound = true;
          // We might want to stop after first match or allow multiple?
          // Let's break to avoid conflicting interpretations of the same string.
          break;
        }
      }

      // 2. Concept Expansion (Semantic Lite)
      // Maps "vibe" words to specific search terms
      const conceptMap: Record<string, string> = {
        "scary": "subject:horror",
        "horror": "subject:horror",
        "funny": "subject:humor",
        "comedy": "subject:humor",
        "romance": "subject:romance",
        "love": "subject:romance",
        "fantasy": "subject:fantasy",
        "magic": "subject:fantasy",
        "sci-fi": "subject:science_fiction",
        "space": "subject:science_fiction",
        "history": "subject:history",
        "past": "subject:history",
        "rich": "subject:biography", // Heuristic
        "money": "subject:business",
        "coding": "subject:computers",
        "programming": "subject:computers",
        "mystery": "subject:mystery",
        "thriller": "subject:thriller",
        "crime": "subject:crime",
        "biography": "subject:biography",
        "autobiography": "subject:biography",
        "memoir": "subject:biography",
        "cooking": "subject:cooking",
        "food": "subject:cooking",
        "recipes": "subject:cooking",
        "travel": "subject:travel",
        "places": "subject:travel",
        "art": "subject:art",
        "design": "subject:design",
        "music": "subject:music",
        "science": "subject:science",
        "nature": "subject:nature",
        "business": "subject:business",
        "finance": "subject:business",
        "self-help": "subject:self_help",
        "motivation": "subject:self_help",
        "health": "subject:health",
        "fitness": "subject:health",
        "kids": "subject:juvenile_fiction",
        "children": "subject:juvenile_fiction",
      };

      // Check for concepts
      const lowerQuery = cleanQuery.toLowerCase();
      let conceptFound = false;
      Object.keys(conceptMap).forEach(concept => {
        if (lowerQuery.includes(concept)) {
          terms.push(conceptMap[concept]);
          conceptFound = true;
        }
      });

      // 1. ISBN Detection (10 or 13 digits, allowing hyphens)
      const isbnPattern = /^(?:\d[\d-]{9,12}[\dXx]|\d{13})$/;
      if (isbnPattern.test(cleanQuery)) {
        terms.push(`isbn:${cleanQuery}`);
      }
      // 2. "Title by Author" Detection
      else if (cleanQuery.toLowerCase().includes(" by ")) {
        const parts = cleanQuery.split(/ by /i);
        if (parts.length === 2) {
          terms.push(`title:${parts[0].trim()}`);
          terms.push(`author:${parts[1].trim()}`);
        } else {
          terms.push(cleanQuery);
        }
      }
      // 3. Standard Search (if no special concept/ISBN)
      else if (!conceptFound) {
        // If ISBN field is explicitly set in filters
        if (isbnSearchQuery) {
          terms.push(`isbn:${isbnSearchQuery}`);
        } else {
          if (cleanQuery) terms.push(cleanQuery);
          if (titleSearchQuery) terms.push(`title:${titleSearchQuery}`);
          if (authorSearchQuery) terms.push(`author:${authorSearchQuery}`);
          if (publisherSearchQuery) terms.push(`publisher:${publisherSearchQuery}`);
          if (subjectSearchQuery) terms.push(`subject:${subjectSearchQuery}`);
          if (selectedGenres.length > 0) terms.push(`subject:${selectedGenres[0]}`);

          // Advanced Keywords
          if (exactPhrase) terms.push(`"${exactPhrase}"`);
          if (atLeastOne) {
            const orTerms = atLeastOne.split(/\s+/).join(" OR ");
            terms.push(`(${orTerms})`);
          }
          if (withoutWords) {
            const notTerms = withoutWords.split(/\s+/).map((w: string) => `-${w}`).join(" ");
            terms.push(notTerms);
          }
          if (issnSearchQuery) terms.push(`issn:${issnSearchQuery}`);
        }
      }

      const apiQuery = terms.join(" ") + (selectedLanguages.length > 0 ? ` language:${selectedLanguages[0]}` : "");

      // Open Library uses page number (1-based)
      const page = 1;

      let { docs: books, numFound, rawCount } = await api.searchBooks(apiQuery, 100, page, sortBy, includeLowQuality);

      // Client-side filtering for Date Range
      if (isYearFilterEnabled) {
        const startYear = yearRange[0];
        const endYear = yearRange[1];

        books = books.filter(book => {
          if (!book.publishedDate) return false;
          const bookYear = parseInt(book.publishedDate.substring(0, 4));
          return !isNaN(bookYear) && bookYear >= startYear && bookYear <= endYear;
        });
      }

      // Client-side filtering for other properties
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

      // Client-side Sorting
      if (sortBy === "oldest") {
        filteredBooks.sort((a, b) => {
          const dateA = new Date(a.publishedDate || "9999").getTime();
          const dateB = new Date(b.publishedDate || "9999").getTime();
          return dateA - dateB;
        });
      } else if (sortBy === "rating") {
        // Sort by rating, then by ratings count
        filteredBooks.sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (b.ratingsCount || 0) - (a.ratingsCount || 0);
        });
      } else if (sortBy === "popularity") {
        filteredBooks.sort((a, b) => (b.ratingsCount || 0) - (a.ratingsCount || 0));
      }

      setResults(filteredBooks);
      setTotalResults(numFound);
      setDisplayedResults(filteredBooks);
      setHasMore(rawCount === 100); // Use rawCount to determine if there are more pages from API

      // Update Context State
      setSearchState({
        query: query,
        results: filteredBooks,
        totalResults: numFound,
        filters: {
          selectedGenres,
          selectedSubjects,
          selectedLanguages,
          publisherSearchQuery,
          titleSearchQuery,
          subjectSearchQuery,
          isbnSearchQuery,
          issnSearchQuery,
          isYearFilterEnabled,
          yearRange,
          exactPhrase,
          atLeastOne,
          withoutWords,
          printType,
          filterType,
          pageRange,
          yearStart,
          yearEnd,
          minRating,
          freeOnly,
          premiumOnly,
          authorSearchQuery,
          sortBy
        },
        scrollPosition: window.scrollY,
        viewMode,
        sortBy,
        isFilterOpen
      });

    } catch (err) {
      setError("Gagal mencari buku. Silakan coba lagi.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Live Search Effect (API)
  useEffect(() => {
    if (debouncedQuery) {
      handleSearch(debouncedQuery, false); // Don't save to history on live search
    } else if (!debouncedQuery) {
      // Clear results if query is empty
      setResults([]);
      setTotalResults(0); // Clear total results too
    }
    setHasMore(true);
  }, [debouncedQuery, sortBy, selectedGenres, freeOnly, premiumOnly, includeLowQuality]);

  // Fetch real descriptions for list view
  useEffect(() => {
    if (viewMode === "list" && results.length > 0) {
      const fetchDescriptions = async () => {
        const booksNeedingDescription = results.filter(
          b => !b.description ||
            b.description === "Description not available in search results." ||
            // Check if it looks like a first sentence (heuristic: short or ends in quote/ellipsis, but simpler to just check if we haven't fetched it yet)
            // We can add a flag to the book object, but for now let's just try to fetch if it's not explicitly marked as "fetched"
            // Actually, let's just fetch for the top 10 visible ones to save bandwidth
            true
        ).slice(0, 10); // Limit to top 10 to avoid rate limits

        // Filter out books we've already checked to avoid infinite loops if we store that state
        // For simplicity, we'll just check if the description is the default or looks like a first sentence (which we can't easily distinguish without a flag)
        // Let's assume if it's short it might be a first sentence.

        // Better approach: Just fetch for the first 5 books that haven't been "enriched"
        // We can use a local set to track enriched IDs to avoid re-fetching

        const booksToEnrich = results.slice(0, 10).filter(b => !b.isDescriptionLoaded);

        if (booksToEnrich.length === 0) return;

        const updatedBooks = [...results];
        let hasUpdates = false;

        await Promise.all(booksToEnrich.map(async (book) => {
          const description = await api.getBookDescription(book.id);
          if (description) {
            const index = updatedBooks.findIndex(b => b.id === book.id);
            if (index !== -1) {
              updatedBooks[index] = { ...updatedBooks[index], description, isDescriptionLoaded: true };
              hasUpdates = true;
            }
          } else {
            // Mark as loaded even if failed so we don't retry
            const index = updatedBooks.findIndex(b => b.id === book.id);
            if (index !== -1) {
              updatedBooks[index] = { ...updatedBooks[index], isDescriptionLoaded: true };
              hasUpdates = true;
            }
          }
        }));

        if (hasUpdates) {
          setResults(updatedBooks);
        }
      };

      fetchDescriptions();
    }
  }, [results, viewMode]);



  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextIndex = startIndex + 100;

    try {
      let terms: string[] = [];
      if (isbnSearchQuery) {
        terms.push(`isbn:${isbnSearchQuery}`);
      } else {
        if (searchQuery.trim()) terms.push(searchQuery);
        if (titleSearchQuery) terms.push(`title:${titleSearchQuery}`);
        if (authorSearchQuery) terms.push(`author:${authorSearchQuery}`);
        if (publisherSearchQuery) terms.push(`publisher:${publisherSearchQuery}`);
        if (subjectSearchQuery) terms.push(`subject:${subjectSearchQuery}`);
        if (selectedGenres.length > 0) terms.push(`subject:${selectedGenres[0]}`);

        // Advanced Keywords
        if (exactPhrase) terms.push(`"${exactPhrase}"`);
        if (atLeastOne) {
          const orTerms = atLeastOne.split(/\s+/).join(" OR ");
          terms.push(`(${orTerms})`);
        }
        if (withoutWords) {
          const notTerms = withoutWords.split(/\s+/).map((w: string) => `-${w}`).join(" ");
          terms.push(notTerms);
        }
        if (issnSearchQuery) terms.push(`issn:${issnSearchQuery}`);
      }

      const apiQuery = terms.join(" ") + (selectedLanguages.length > 0 ? ` language:${selectedLanguages[0]}` : "");

      // Calculate page number
      const page = Math.floor(nextIndex / 100) + 1;

      const { docs: newBooks, rawCount } = await api.searchBooks(apiQuery, 100, page, sortBy, includeLowQuality);

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

      // Client-side Sorting for new batch
      if (sortBy === "oldest") {
        filteredNewBooks.sort((a, b) => {
          const dateA = new Date(a.publishedDate || "9999").getTime();
          const dateB = new Date(b.publishedDate || "9999").getTime();
          return dateA - dateB;
        });
      } else if (sortBy === "rating") {
        filteredNewBooks.sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (b.ratingsCount || 0) - (a.ratingsCount || 0);
        });
      } else if (sortBy === "popularity") {
        filteredNewBooks.sort((a, b) => (b.ratingsCount || 0) - (a.ratingsCount || 0));
      }

      setResults(prev => [...prev, ...filteredNewBooks]);
      // displayedResults will update via useEffect when results changes
      setStartIndex(nextIndex);
      setHasMore(rawCount === 100);
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
      handleSearch(searchQuery, true);
    }
    toast.success("Filters applied");
  };

  const handleVoiceResult = (text: string) => {
    setSearchQuery(text);
    shouldShowSuggestions.current = false;
    handleSearch(text, true);
    setShowVoiceSearch(false);
  };

  const handleScanResult = (result: string) => {
    setShowScanner(false);
    setSearchQuery(result);
    shouldShowSuggestions.current = false;
    handleSearch(result, true);
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
    setPublisherSearchQuery("");
    setTitleSearchQuery("");
    setSubjectSearchQuery("");
    setIsbnSearchQuery("");
    setIssnSearchQuery("");
    setIsYearFilterEnabled(false);
    setYearRange([1990, 2025]);
    setExactPhrase("");
    setAtLeastOne("");
    setWithoutWords("");
    setPrintType("all");
    setFilterType("");
    setSortBy("relevance");
    toast.success("Filters cleared");
  };

  const activeFilterCount =
    selectedGenres.length +
    selectedSubjects.length +
    selectedLanguages.length +
    (publisherSearchQuery ? 1 : 0) +
    (isbnSearchQuery ? 1 : 0) +
    (issnSearchQuery ? 1 : 0) +
    (authorSearchQuery ? 1 : 0) +
    (exactPhrase ? 1 : 0) +
    (atLeastOne ? 1 : 0) +
    (withoutWords ? 1 : 0) +
    (printType !== "all" ? 1 : 0) +
    (filterType ? 1 : 0) +
    (freeOnly ? 1 : 0) +
    (premiumOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
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
                {results.length > 0 ? `${totalResults.toLocaleString()} buku ditemukan` : "Temukan buku favoritmu"}
              </p>
            </div>
          </div>

          {/* Search Button */}


          {/* Action Buttons */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search title, author, ISBN, or topic..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  shouldShowSuggestions.current = true;
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery, true)}
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

              {/* Search Suggestions (Live Books) */}
              {searchQuery && showSuggestions && (suggestedBooks.length > 0 || isSuggestionsLoading) && (
                <Card className="mt-2 p-2 overflow-hidden border-gray-200 dark:border-gray-700 shadow-lg absolute z-50 w-full top-full left-0">
                  <div className="space-y-1">
                    {isSuggestionsLoading && suggestedBooks.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">Loading suggestions...</div>
                    ) : (
                      suggestedBooks.map((book) => (
                        <div
                          key={book.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => onSelectBook(book.id)}
                        >
                          <div className="w-10 h-14 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                            <ImageWithFallback
                              src={book.image}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {book.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Search Button */}
            <Button
              onClick={() => handleSearch(searchQuery, true)}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hidden sm:flex"
            >
              <Search className="w-5 h-5 mr-2" />
              Cari
            </Button>

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
              <ScanBarcode className="w-5 h-5" />
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
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 p-0">
                <div
                  className="flex flex-col h-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applyFilters();
                    }
                  }}
                >
                  <SheetHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        Advanced Search
                      </SheetTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Reset All
                      </Button>
                    </div>
                    <SheetDescription className="text-gray-500 dark:text-gray-400">
                      Find exactly what you're looking for
                    </SheetDescription>
                  </SheetHeader>

                  <ScrollArea className="flex-1 px-6 py-6" onScrollCapture={handleScroll}>
                    <div className="space-y-8 relative">
                      {/* Scroll Indicator */}
                      {showScrollIndicator && (
                        <div className="hidden md:flex absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-10 flex-col items-center animate-bounce pointer-events-none">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full shadow-sm mb-1">Scroll for more</span>
                          <ChevronDown className="w-5 h-5 text-blue-600" />
                        </div>
                      )}



                      {/* Section 2: Keywords */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Search className="w-4 h-4 text-blue-500" />
                          Keywords
                        </h3>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">All these words</Label>
                            <Input
                              placeholder="e.g. harry potter"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Quote className="w-3 h-3" /> Exact phrase
                            </Label>
                            <Input
                              placeholder='e.g. "sorcerer stone"'
                              value={exactPhrase}
                              onChange={(e) => setExactPhrase(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 dark:text-gray-400">At least one of these words</Label>
                            <Input
                              placeholder="e.g. magic wizard witch"
                              value={atLeastOne}
                              onChange={(e) => setAtLeastOne(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Ban className="w-3 h-3" /> None of these words
                            </Label>
                            <Input
                              placeholder="e.g. movie film"
                              value={withoutWords}
                              onChange={(e) => setWithoutWords(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gray-100 dark:bg-gray-800" />


                      {/* Section 2: Bibliographic */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Library className="w-4 h-4 text-purple-500" />
                          Bibliographic Data
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> Title
                            </Label>
                            <Input
                              placeholder="e.g. Harry Potter"
                              value={titleSearchQuery}
                              onChange={(e) => setTitleSearchQuery(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <User className="w-3 h-3" /> Author
                            </Label>
                            <Input
                              placeholder="e.g. J.K. Rowling"
                              value={authorSearchQuery}
                              onChange={(e) => setAuthorSearchQuery(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> Publisher
                            </Label>
                            <Input
                              placeholder="e.g. Bloomsbury"
                              value={publisherSearchQuery}
                              onChange={(e) => setPublisherSearchQuery(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Subject
                            </Label>
                            <Input
                              placeholder="e.g. Fantasy, History"
                              value={subjectSearchQuery}
                              onChange={(e) => setSubjectSearchQuery(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Hash className="w-3 h-3" /> ISBN
                            </Label>
                            <Input
                              placeholder="e.g. 978-3-16-148410-0"
                              value={isbnSearchQuery}
                              onChange={(e) => setIsbnSearchQuery(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Hash className="w-3 h-3" /> ISSN
                            </Label>
                            <Input
                              placeholder="e.g. 0123-4567"
                              value={issnSearchQuery}
                              onChange={(e) => setIssnSearchQuery(e.target.value)}
                              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <Label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              Publication Year
                            </Label>
                            <Switch
                              id="year-filter"
                              checked={isYearFilterEnabled}
                              onCheckedChange={setIsYearFilterEnabled}
                            />
                          </div>

                          <div className={`transition-all duration-200 ${isYearFilterEnabled ? "opacity-100" : "opacity-50 pointer-events-none grayscale"}`}>
                            <div className="flex items-center justify-between mb-2 px-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                                {yearRange[0]}
                              </span>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                                {yearRange[1]}
                              </span>
                            </div>
                            <Slider
                              value={yearRange}
                              min={1900}
                              max={2025}
                              step={1}
                              onValueChange={setYearRange}
                              className="py-2"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gray-100 dark:bg-gray-800" />

                      {/* Section 3: Filters */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Filter className="w-4 h-4 text-green-500" />
                          Filters
                        </h3>

                        {/* Print Type */}
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500 dark:text-gray-400">Print Type</Label>
                          <div className="flex gap-2">
                            {['all', 'books', 'magazines'].map((type) => (
                              <Badge
                                key={type}
                                variant={printType === type ? "default" : "outline"}
                                className={`cursor-pointer capitalize ${printType === type ? "bg-blue-600" : ""}`}
                                onClick={() => setPrintType(type)}
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>



                        {/* Filter Type (Availability) - Moved to bottom */}
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500 dark:text-gray-400">Availability</Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: "", label: "Any" },
                              { id: "free-ebooks", label: "Free Google eBooks" },
                              { id: "paid-ebooks", label: "Paid Google eBooks" },
                              { id: "ebooks", label: "Google eBooks" },
                              { id: "partial", label: "Preview Available" },
                              { id: "full", label: "Full View" },
                            ].map((filter) => (
                              <Badge
                                key={filter.id}
                                variant={filterType === filter.id ? "default" : "outline"}
                                className={`cursor-pointer ${filterType === filter.id ? "bg-blue-600" : ""}`}
                                onClick={() => setFilterType(filter.id)}
                              >
                                {filter.label}
                              </Badge>
                            ))}
                          </div>
                        </div>




                        {/* Language (Moved to Bottom) */}
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Language
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {languages.map((lang) => (
                              <Badge
                                key={lang.code}
                                variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
                                className={`cursor-pointer ${selectedLanguages.includes(lang.code) ? "bg-blue-600" : ""}`}
                                onClick={() => {
                                  setSelectedLanguages(prev =>
                                    prev.includes(lang.code)
                                      ? prev.filter(l => l !== lang.code)
                                      : [...prev, lang.code]
                                  );
                                }}
                              >
                                <span className="mr-1">{lang.flag}</span> {lang.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>



                    </div>
                  </ScrollArea>

                  <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
                      onClick={() => {
                        setIsFilterOpen(false);
                        handleSearch(searchQuery);
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet >
          </div >


        </div >

        {/* Recent & Trending */}
        {/* Recent & Trending */}
        {
          !searchQuery && !results.length && !isLoading && (
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Recent Searches */}
              <Card className="p-6 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Recent Searches</h3>
                  </div>
                  {recentSearches.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-3"
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem("librago-recent-searches");
                      }}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {recentSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                      onClick={() => {
                        shouldShowSuggestions.current = false;
                        setSearchQuery(search);
                        handleSearch(search, true);
                      }}
                    >
                      <Search className="w-3.5 h-3.5 mr-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">{search}</span>
                    </Badge>
                  ))}
                  {recentSearches.length === 0 && (
                    <div className="w-full py-8 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No recent searches yet</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Trending Books */}
              <Card className="p-6 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Trending Books</h3>
                </div>
                {isTrendingLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="w-12 h-16 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-3">
                      {trendingBooks.slice(0, 5).map((book, index) => (
                        <div
                          key={book.id}
                          className="group flex items-center gap-4 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all cursor-pointer"
                          onClick={() => onSelectBook(book.id)}
                        >
                          <span className={`
                        flex-shrink-0 w-6 text-center font-bold text-lg
                        ${index === 0 ? "text-yellow-500" :
                              index === 1 ? "text-gray-400" :
                                index === 2 ? "text-orange-700" : "text-gray-300 dark:text-gray-600"}
                      `}>
                            {index + 1}
                          </span>

                          <div className="relative w-12 h-16 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                            <ImageWithFallback
                              src={book.image}
                              alt={book.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                              {book.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {book.author}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{book.rating || "4.5"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )
        }

        {/* Results Header */}
        {
          (searchQuery || results.length > 0 || isLoading) && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLoading
                  ? "Searching..."
                  : results.length > 0
                    ? `${totalResults.toLocaleString()} results found`
                    : "No results found"}
              </p>

              <div className="flex items-center gap-2">
                {/* Quality Toggle */}
                {/* Quality Toggle */}
                <div className="flex items-center gap-2 mr-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="low-quality-main"
                      checked={includeLowQuality}
                      onCheckedChange={setIncludeLowQuality}
                    />
                    <Label htmlFor="low-quality-main" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                      Show All
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px] p-3">
                          <div className="space-y-2">
                            <p className="font-semibold text-xs">Filter Settings:</p>
                            <div className="text-xs space-y-1">
                              <p><span className="font-medium text-green-500">ON:</span> Includes books without cover images or author names.</p>
                              <p><span className="font-medium text-red-500">OFF:</span> Excludes low-quality results to show only complete book entries.</p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

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
                    <SelectItem value="popularity">Most Popular</SelectItem>
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
          )
        }

        {/* Active Filters */}
        {
          activeFilterCount > 0 && (
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
          )
        }

        {/* Content Area */}
        {
          isLoading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <BookCardSkeleton key={i} viewMode={viewMode} />
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

              onAction={() => {
                clearFilters();
                handleSearch(searchQuery, true);
              }}
            />
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}>
              {results.map((book) => (
                <Card
                  key={book.id}
                  className={`cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:ring-2 hover:ring-blue-500/20 dark:hover:ring-blue-400/20 group bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 ${viewMode === "list" ? "p-4 flex-row gap-4 items-start" : "flex flex-col h-full"
                    }`}
                  onClick={() => onSelectBook(book.id)}
                >
                  {viewMode === "grid" ? (
                    <>
                      <div className="aspect-[2/3] overflow-hidden relative bg-gray-100 dark:bg-gray-800 p-2 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
                        <ImageWithFallback
                          src={book.image}
                          alt={book.title}
                          className="w-full h-full object-contain shadow-sm group-hover:scale-105 transition-transform duration-300"
                        />
                        {book.isFavorite && (
                          <div className="absolute top-2 right-2 bg-pink-500 text-white p-1.5 rounded-full shadow-lg z-10">
                            <Heart className="w-3.5 h-3.5 fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors" title={book.title}>
                            {book.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                            {book.author}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{book.rating || "N/A"}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            {book.pageCount ? `${book.pageCount}p` : "Unknown"}
                          </Badge>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative w-20 h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={book.image}
                          alt={book.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col py-0.5 gap-2">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {book.title}
                            </h3>
                            <div className="flex items-center gap-1 shrink-0 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{book.rating || "N/A"}</span>
                            </div>
                          </div>

                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {book.author}
                          </p>
                        </div>

                        {/* Description */}
                        {book.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed text-justify hyphens-auto">
                            {cleanDescription(typeof book.description === 'string' ? book.description : "No description available.")}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-1">
                          {book.genre && book.genre.slice(0, 3).map((g, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {g}
                            </Badge>
                          ))}
                          {book.pageCount && (
                            <Badge variant="secondary" className="text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {book.pageCount} pages
                            </Badge>
                          )}
                          {book.publishedDate && (
                            <Badge variant="secondary" className="text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {book.publishedDate.substring(0, 4)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )
        }

        {/* Infinite Scroll Sentinel */}
        {hasMore && (
          <div ref={lastBookElementRef} className="py-8 flex justify-center">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Memuat lebih banyak...</span>
              </div>
            ) : (
              <div className="h-4" />
            )}
          </div>
        )}
      </div >


      {/* Voice Search Modal */}
      {
        showVoiceSearch && (
          <VoiceSearch
            onResult={handleVoiceResult}
            onClose={() => setShowVoiceSearch(false)}
          />
        )
      }
      {showScanner && (
        <BarcodeScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleScanResult}
        />
      )}
    </div >
  );
}
