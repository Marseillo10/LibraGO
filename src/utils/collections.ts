// ============================================
// SMART COLLECTIONS UTILITY
// ============================================

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string[];
  progress: number; // 0-100
  rating?: number;
  addedDate: Date;
  lastReadDate?: Date;
  tags: string[];
  isFavorite: boolean;
  pageCount: number;
  currentPage: number;
}

export type SmartCollectionType =
  | "currently-reading"
  | "almost-finished"
  | "not-started"
  | "finished"
  | "favorites"
  | "recent"
  | "this-month"
  | "by-genre"
  | "by-rating"
  | "long-books"
  | "short-books";

export interface SmartCollection {
  id: SmartCollectionType;
  name: string;
  description: string;
  icon: string;
  filter: (book: Book) => boolean;
  count?: number;
}

// Smart Collection Definitions
export const createSmartCollections = (books: Book[]): SmartCollection[] => {
  return [
    {
      id: "currently-reading",
      name: "Sedang Dibaca",
      description: "Buku yang sedang Anda baca",
      icon: "📖",
      filter: (book) => book.progress > 0 && book.progress < 100,
    },
    {
      id: "almost-finished",
      name: "Hampir Selesai",
      description: "Buku dengan progress > 80%",
      icon: "🏁",
      filter: (book) => book.progress >= 80 && book.progress < 100,
    },
    {
      id: "not-started",
      name: "Belum Dibaca",
      description: "Buku yang belum dimulai",
      icon: "📚",
      filter: (book) => book.progress === 0,
    },
    {
      id: "finished",
      name: "Selesai Dibaca",
      description: "Buku yang sudah selesai",
      icon: "✅",
      filter: (book) => book.progress === 100,
    },
    {
      id: "favorites",
      name: "Favorit",
      description: "Buku favorit Anda",
      icon: "⭐",
      filter: (book) => book.isFavorite,
    },
    {
      id: "recent",
      name: "Baru Ditambahkan",
      description: "Ditambahkan dalam 7 hari terakhir",
      icon: "🆕",
      filter: (book) => {
        const daysDiff =
          (Date.now() - book.addedDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      },
    },
    {
      id: "this-month",
      name: "Dibaca Bulan Ini",
      description: "Dibaca dalam bulan ini",
      icon: "📅",
      filter: (book) => {
        if (!book.lastReadDate) return false;
        const now = new Date();
        return (
          book.lastReadDate.getMonth() === now.getMonth() &&
          book.lastReadDate.getFullYear() === now.getFullYear()
        );
      },
    },
    {
      id: "long-books",
      name: "Buku Panjang",
      description: "Lebih dari 400 halaman",
      icon: "📕",
      filter: (book) => book.pageCount > 400,
    },
    {
      id: "short-books",
      name: "Buku Pendek",
      description: "Kurang dari 200 halaman",
      icon: "📘",
      filter: (book) => book.pageCount < 200,
    },
    {
      id: "by-rating",
      name: "Rating Tinggi",
      description: "Rating 4 bintang atau lebih",
      icon: "🌟",
      filter: (book) => (book.rating ?? 0) >= 4,
    },
  ].map((collection) => ({
    ...collection,
    count: books.filter(collection.filter).length,
  }));
};

// Get books for a smart collection
export function getBooksInCollection(
  books: Book[],
  collectionId: SmartCollectionType
): Book[] {
  const collections = createSmartCollections(books);
  const collection = collections.find((c) => c.id === collectionId);
  return collection ? books.filter(collection.filter) : [];
}

// ============================================
// TAGGING SYSTEM
// ============================================

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

// Predefined tag colors
export const TAG_COLORS = [
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // green
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#6366F1", // indigo
  "#14B8A6", // teal
];

// Create a tag
export function createTag(name: string, color?: string): Tag {
  return {
    id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    color: color || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
    count: 0,
  };
}

// Get all unique tags from books
export function getAllTags(books: Book[]): Tag[] {
  const tagMap = new Map<string, Tag>();

  books.forEach((book) => {
    book.tags.forEach((tagName) => {
      if (tagMap.has(tagName)) {
        const tag = tagMap.get(tagName)!;
        tag.count++;
      } else {
        tagMap.set(tagName, {
          id: `tag-${tagName}`,
          name: tagName,
          color: TAG_COLORS[tagMap.size % TAG_COLORS.length],
          count: 1,
        });
      }
    });
  });

  return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
}

// Get books by tag
export function getBooksByTag(books: Book[], tagName: string): Book[] {
  return books.filter((book) => book.tags.includes(tagName));
}

// Add tag to book
export function addTagToBook(book: Book, tagName: string): Book {
  if (book.tags.includes(tagName)) return book;
  return {
    ...book,
    tags: [...book.tags, tagName],
  };
}

// Remove tag from book
export function removeTagFromBook(book: Book, tagName: string): Book {
  return {
    ...book,
    tags: book.tags.filter((t) => t !== tagName),
  };
}

// Suggest tags based on genre and content
export function suggestTags(book: Book): string[] {
  const suggestions: string[] = [];

  // Based on genre
  book.genre.forEach((g) => {
    suggestions.push(g.toLowerCase());
  });

  // Based on length
  if (book.pageCount > 500) suggestions.push("long-read");
  if (book.pageCount < 150) suggestions.push("quick-read");

  // Based on progress
  if (book.progress === 100) suggestions.push("finished");
  if (book.progress > 0 && book.progress < 100) suggestions.push("reading");

  // Based on rating
  if (book.rating && book.rating >= 4.5) suggestions.push("highly-rated");

  return [...new Set(suggestions)]; // Remove duplicates
}

// ============================================
// SEARCH & FILTER
// ============================================

export interface FilterOptions {
  genres?: string[];
  tags?: string[];
  minRating?: number;
  maxRating?: number;
  minProgress?: number;
  maxProgress?: number;
  minPages?: number;
  maxPages?: number;
  isFavorite?: boolean;
  searchQuery?: string;
}

export function filterBooks(books: Book[], filters: FilterOptions): Book[] {
  return books.filter((book) => {
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = book.title.toLowerCase().includes(query);
      const matchesAuthor = book.author.toLowerCase().includes(query);
      if (!matchesTitle && !matchesAuthor) return false;
    }

    // Genre filter
    if (
      filters.genres &&
      filters.genres.length > 0 &&
      !filters.genres.some((g) => book.genre.includes(g))
    ) {
      return false;
    }

    // Tag filter
    if (
      filters.tags &&
      filters.tags.length > 0 &&
      !filters.tags.some((t) => book.tags.includes(t))
    ) {
      return false;
    }

    // Rating filter
    if (filters.minRating && (book.rating ?? 0) < filters.minRating) {
      return false;
    }
    if (filters.maxRating && (book.rating ?? 0) > filters.maxRating) {
      return false;
    }

    // Progress filter
    if (filters.minProgress !== undefined && book.progress < filters.minProgress) {
      return false;
    }
    if (filters.maxProgress !== undefined && book.progress > filters.maxProgress) {
      return false;
    }

    // Page count filter
    if (filters.minPages && book.pageCount < filters.minPages) {
      return false;
    }
    if (filters.maxPages && book.pageCount > filters.maxPages) {
      return false;
    }

    // Favorite filter
    if (filters.isFavorite !== undefined && book.isFavorite !== filters.isFavorite) {
      return false;
    }

    return true;
  });
}

// ============================================
// SORTING
// ============================================

export type SortOption =
  | "title-asc"
  | "title-desc"
  | "author-asc"
  | "author-desc"
  | "date-added-asc"
  | "date-added-desc"
  | "date-read-asc"
  | "date-read-desc"
  | "rating-asc"
  | "rating-desc"
  | "progress-asc"
  | "progress-desc"
  | "pages-asc"
  | "pages-desc";

export function sortBooks(books: Book[], sortBy: SortOption): Book[] {
  const sorted = [...books];

  switch (sortBy) {
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "author-asc":
      return sorted.sort((a, b) => a.author.localeCompare(b.author));
    case "author-desc":
      return sorted.sort((a, b) => b.author.localeCompare(a.author));
    case "date-added-asc":
      return sorted.sort((a, b) => a.addedDate.getTime() - b.addedDate.getTime());
    case "date-added-desc":
      return sorted.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
    case "date-read-asc":
      return sorted.sort((a, b) => {
        if (!a.lastReadDate) return 1;
        if (!b.lastReadDate) return -1;
        return a.lastReadDate.getTime() - b.lastReadDate.getTime();
      });
    case "date-read-desc":
      return sorted.sort((a, b) => {
        if (!a.lastReadDate) return 1;
        if (!b.lastReadDate) return -1;
        return b.lastReadDate.getTime() - a.lastReadDate.getTime();
      });
    case "rating-asc":
      return sorted.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
    case "rating-desc":
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "progress-asc":
      return sorted.sort((a, b) => a.progress - b.progress);
    case "progress-desc":
      return sorted.sort((a, b) => b.progress - a.progress);
    case "pages-asc":
      return sorted.sort((a, b) => a.pageCount - b.pageCount);
    case "pages-desc":
      return sorted.sort((a, b) => b.pageCount - a.pageCount);
    default:
      return sorted;
  }
}
