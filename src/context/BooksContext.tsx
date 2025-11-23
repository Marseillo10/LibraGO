import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book } from '../utils/collections';
import { api } from '../services/api';
import { toast } from 'sonner';

export interface ReadingGoal {
    id: string;
    title: string;
    type: "books" | "pages" | "time" | "genre";
    target: number;
    current: number;
    period: "daily" | "weekly" | "monthly" | "yearly";
    startDate: string;
    endDate: string;
    status: "active" | "completed" | "failed";
}

export interface Notification {
    id: string;
    type: "book" | "achievement" | "premium" | "social" | "system";
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
    icon?: string;
}

export interface ReadingStats {
    totalBooks: number;
    totalPages: number;
    totalTime: string;
    currentStreak: number;
    longestStreak: number;
    avgPagesPerDay: number;
    booksThisMonth: number;
    booksThisYear: number;
}

interface BooksContextType {
    library: Book[];
    addToLibrary: (book: Book) => void;
    removeFromLibrary: (bookId: string) => void;
    updateBookProgress: (bookId: string, page: number) => void;
    toggleFavorite: (bookId: string) => void;

    // Search & Discovery
    searchResults: Book[];
    isSearching: boolean;
    searchBooks: (query: string) => Promise<void>;
    trendingBooks: Book[];
    recommendations: Book[];
    isLoadingHome: boolean;
    refreshHomeData: () => Promise<void>;

    // Persistent Search State
    searchState: {
        query: string;
        results: Book[];
        filters: any;
        scrollPosition: number;
        viewMode: "grid" | "list";
        sortBy: string;
        isFilterOpen: boolean;
    };
    setSearchState: (state: any) => void;

    // Persistent Scroll States
    dashboardScroll: number;
    setDashboardScroll: (position: number) => void;
    collectionScroll: number;
    setCollectionScroll: (position: number) => void;

    // Current Book
    currentBook: Book | null;
    setCurrentBook: (book: Book | null) => void;
    fetchBookDetails: (id: string) => Promise<Book | null>;

    // Goals & Stats
    readingGoals: ReadingGoal[];
    addGoal: (goal: ReadingGoal) => void;
    deleteGoal: (id: string) => void;
    readingStats: ReadingStats;
    readingLogs: Record<string, number>;
    unlockedAchievements: string[];

    // Notifications
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    clearNotifications: () => void;
    deleteNotification: (id: string) => void;

    // Profile & Settings
    userProfile: UserProfile;
    updateProfile: (data: Partial<UserProfile>) => void;
    settings: Settings;
    updateSettings: (data: Partial<Settings>) => void;

    // Downloads
    downloads: DownloadItem[];
    startDownload: (book: Book) => void;
    pauseDownload: (id: string) => void;
    resumeDownload: (id: string) => void;
    cancelDownload: (id: string) => void;
    removeDownload: (id: string) => void;
}

export interface UserProfile {
    name: string;
    email: string;
    bio?: string;
    location?: string;
    birthDate?: string;
    joinDate: string;
    level: number;
    xp: number;
    nextXp: number;
    nextLevel: number;
    isPremium: boolean;
}

export interface Settings {
    notifications: {
        newBooks: boolean;
        readingReminders: boolean;
        achievements: boolean;
        socialActivity: boolean;
        newsletter: boolean;
        premiumExpiry: boolean;
    };
    theme: "light" | "dark" | "system" | "sepia";
    readingPreferences: {
        fontSize: number;
        lineHeight: number;
        pageTransition: "slide" | "curl" | "none";
        autoBookmark: boolean;
        readingMode: "scroll" | "paginated";
    };
    privacy: {
        profilePublic: boolean;
        showReadingActivity: boolean;
        allowRecommendations: boolean;
    };
    download: {
        autoDownload: boolean;
        quality: "high" | "medium" | "low";
    };
}

export interface DownloadItem {
    id: string;
    bookId: string;
    title: string;
    author: string;
    coverUrl: string;
    status: "downloading" | "completed" | "paused" | "failed";
    progress: number;
    size: string;
    downloadedSize: string;
    quality: "high" | "medium" | "low";
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export const BooksProvider = ({ children }: { children: ReactNode }) => {
    // Persistent Library State
    const [library, setLibrary] = useState<Book[]>(() => {
        const saved = localStorage.getItem('librago-library');
        return saved ? JSON.parse(saved) : [];
    });

    // User Profile State
    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        const saved = localStorage.getItem('librago-profile');
        return saved ? JSON.parse(saved) : {
            name: "Alex Johnson",
            email: "alex.johnson@example.com",
            bio: "Peneliti dan pengajar di bidang Computer Science. Gemar membaca buku teknologi dan pengembangan diri.",
            location: "Jakarta, Indonesia",
            birthDate: "1990-05-15",
            joinDate: "Januari 2024",
            level: 12,
            xp: 2450,
            nextXp: 3000,
            nextLevel: 15,
            isPremium: false
        };
    });

    // Settings State
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('librago-settings');
        return saved ? JSON.parse(saved) : {
            notifications: {
                newBooks: true,
                readingReminders: true,
                achievements: true,
                socialActivity: false,
                newsletter: true,
                premiumExpiry: true,
            },
            theme: "system",
            readingPreferences: {
                fontSize: 16,
                lineHeight: 1.5,
                pageTransition: "slide",
                autoBookmark: true,
                readingMode: "paginated",
            },
            privacy: {
                profilePublic: true,
                showReadingActivity: true,
                allowRecommendations: true,
            },
            download: {
                autoDownload: false,
                quality: "high",
            }
        };
    });

    // Persist Profile & Settings
    useEffect(() => {
        localStorage.setItem('librago-profile', JSON.stringify(userProfile));
    }, [userProfile]);

    useEffect(() => {
        localStorage.setItem('librago-settings', JSON.stringify(settings));
    }, [settings]);

    const updateProfile = (data: Partial<UserProfile>) => {
        setUserProfile(prev => ({ ...prev, ...data }));
    };

    const updateSettings = (data: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...data }));
    };

    // Goals State
    const [readingGoals, setReadingGoals] = useState<ReadingGoal[]>(() => {
        const saved = localStorage.getItem('librago-goals');
        return saved ? JSON.parse(saved) : [];
    });

    // Notifications State
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem('librago-notifications');
        return saved ? JSON.parse(saved) : [];
    });

    // Discovery State
    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
    const [recommendations, setRecommendations] = useState<Book[]>([]);
    const [isLoadingHome, setIsLoadingHome] = useState(false);

    // Persistent Search State
    const [searchState, setSearchState] = useState({
        query: "",
        results: [],
        filters: {},
        scrollPosition: 0,
        viewMode: "grid" as "grid" | "list",
        sortBy: "relevance",
        isFilterOpen: false
    });

    // Persistent Scroll States
    const [dashboardScroll, setDashboardScroll] = useState(0);
    const [collectionScroll, setCollectionScroll] = useState(0);

    // Current Book State
    const [currentBook, setCurrentBook] = useState<Book | null>(null);

    // Persist library changes
    useEffect(() => {
        localStorage.setItem('librago-library', JSON.stringify(library));
    }, [library]);

    // Persist goals changes
    useEffect(() => {
        localStorage.setItem('librago-goals', JSON.stringify(readingGoals));
    }, [readingGoals]);

    // Persist notifications changes
    useEffect(() => {
        localStorage.setItem('librago-notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Initial Data Load
    useEffect(() => {
        refreshHomeData();
    }, []);

    const refreshHomeData = async () => {
        setIsLoadingHome(true);
        try {
            const [trending, recs] = await Promise.all([
                api.getTrendingBooks(),
                api.getRecommendations()
            ]);
            setTrendingBooks(trending);
            setRecommendations(recs);
        } catch (error) {
            console.error("Error loading home data:", error);
            toast.error("Gagal memuat data buku. Periksa koneksi internet Anda.");
        } finally {
            setIsLoadingHome(false);
        }
    };

    const searchBooks = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await api.searchBooks(query);
            setSearchResults(results);
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Gagal mencari buku");
        } finally {
            setIsSearching(false);
        }
    };

    const fetchBookDetails = async (id: string) => {
        // First check library
        const libraryBook = library.find((b: Book) => b.id === id);
        if (libraryBook) {
            setCurrentBook(libraryBook);
            return libraryBook;
        }

        // Then check cached lists
        const cachedBook = [...trendingBooks, ...recommendations, ...searchResults].find(b => b.id === id);
        if (cachedBook) {
            // Fetch full details anyway to get description etc
            try {
                const fullBook = await api.getBookDetails(id);
                if (fullBook) {
                    setCurrentBook(fullBook);
                    return fullBook;
                }
            } catch (e) {
                // Fallback to cached basic info
                setCurrentBook(cachedBook);
                return cachedBook;
            }
        }

        // Fetch from API
        try {
            const book = await api.getBookDetails(id);
            if (book) {
                setCurrentBook(book);
                return book;
            }
        } catch (error) {
            console.error("Error fetching book details:", error);
            toast.error("Gagal memuat detail buku");
        }
        return null;
    };

    const addToLibrary = (book: Book) => {
        if (library.some((b: Book) => b.id === book.id)) {
            toast.info("Buku sudah ada di perpustakaan Anda");
            return;
        }
        setLibrary((prev: Book[]) => [book, ...prev]);
        toast.success("Buku ditambahkan ke perpustakaan");
    };

    const removeFromLibrary = (bookId: string) => {
        setLibrary((prev: Book[]) => prev.filter((b: Book) => b.id !== bookId));
        toast.success("Buku dihapus dari perpustakaan");
    };

    // Reading Logs State (Date -> Pages Read)
    const [readingLogs, setReadingLogs] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('librago-reading-logs');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('librago-reading-logs', JSON.stringify(readingLogs));
    }, [readingLogs]);

    // Achievements State
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
        const saved = localStorage.getItem('librago-achievements');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('librago-achievements', JSON.stringify(unlockedAchievements));
    }, [unlockedAchievements]);

    const checkAchievements = (stats: ReadingStats, currentLogs: Record<string, number>) => {
        const newUnlocked = [...unlockedAchievements];
        const today = new Date().toISOString().split('T')[0];

        const achievementsList = [
            { id: "bookworm", condition: stats.totalBooks >= 10, title: "Bookworm", msg: "Baca 10 buku" },
            { id: "century_club", condition: stats.totalBooks >= 100, title: "Century Club", msg: "Baca 100 buku" },
            { id: "consistent", condition: stats.currentStreak >= 30, title: "Consistent", msg: "Reading streak 30 hari" },
            { id: "first_step", condition: stats.totalPages >= 1, title: "First Step", msg: "Mulai membaca buku pertama" },
            { id: "dedicated", condition: (currentLogs[today] || 0) >= 50, title: "Dedicated", msg: "Baca 50 halaman dalam sehari" }
        ];

        let achievementUnlocked = false;

        achievementsList.forEach(ach => {
            if (ach.condition && !newUnlocked.includes(ach.id)) {
                newUnlocked.push(ach.id);
                achievementUnlocked = true;
                addNotification({
                    id: Date.now().toString() + ach.id,
                    type: "achievement",
                    title: `Achievement Unlocked: ${ach.title}! 🏆`,
                    message: ach.msg,
                    timestamp: "Baru saja",
                    isRead: false
                });
                toast.success(`Achievement Unlocked: ${ach.title}!`);
            }
        });

        if (achievementUnlocked) {
            setUnlockedAchievements(newUnlocked);
        }
    };

    const updateBookProgress = (bookId: string, page: number) => {
        setLibrary((prev: Book[]) => prev.map((b: Book) => {
            if (b.id === bookId) {
                const oldPage = b.currentPage || 0;
                const pagesRead = Math.max(0, page - oldPage);

                // Update Reading Logs
                if (pagesRead > 0) {
                    const today = new Date().toISOString().split('T')[0];
                    setReadingLogs(prevLogs => {
                        const newLogs = {
                            ...prevLogs,
                            [today]: (prevLogs[today] || 0) + pagesRead
                        };
                        // Check achievements with new logs
                        // We need to defer this slightly or pass new logs to checkAchievements
                        // For simplicity, we'll rely on the effect or next render, 
                        // but ideally we calculate stats here. 
                        // Let's just trigger a check in a useEffect dependent on readingLogs/library
                        return newLogs;
                    });
                }

                const progress = Math.min(100, Math.round((page / b.pageCount) * 100));
                // Check if just completed
                if (progress === 100 && b.progress < 100) {
                    addNotification({
                        id: Date.now().toString(),
                        type: "achievement",
                        title: "Buku Selesai! 🎉",
                        message: `Selamat! Anda telah menyelesaikan "${b.title}"`,
                        timestamp: "Baru saja",
                        isRead: false
                    });
                }
                const updatedBook = { ...b, currentPage: page, progress, lastReadDate: new Date() };

                // Also update currentBook if it matches
                if (currentBook && currentBook.id === bookId) {
                    setCurrentBook(updatedBook);
                }

                return updatedBook;
            }
            return b;
        }));
    };

    // Trigger achievement check when relevant data changes
    useEffect(() => {
        const stats = calculateStats();
        checkAchievements(stats, readingLogs);
    }, [library, readingLogs]);

    const toggleFavorite = (bookId: string) => {
        setLibrary((prev: Book[]) => prev.map((b: Book) => {
            if (b.id === bookId) {
                return { ...b, isFavorite: !b.isFavorite };
            }
            return b;
        }));
    };

    // Goals Logic
    const addGoal = (goal: ReadingGoal) => {
        setReadingGoals([...readingGoals, goal]);
        toast.success("Target baru dibuat!");
    };

    const deleteGoal = (id: string) => {
        setReadingGoals(readingGoals.filter(g => g.id !== id));
        toast.success("Target dihapus");
    };

    // Notifications Logic
    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
    };

    const markNotificationRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
        toast.success("Semua notifikasi dihapus");
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Downloads Logic
    const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
        const saved = localStorage.getItem('librago-downloads');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('librago-downloads', JSON.stringify(downloads));
    }, [downloads]);

    // Simulate download progress
    useEffect(() => {
        const interval = setInterval(() => {
            setDownloads(prev => prev.map(d => {
                if (d.status === 'downloading' && d.progress < 100) {
                    const newProgress = Math.min(100, d.progress + 5);
                    const status = newProgress === 100 ? 'completed' : 'downloading';

                    if (status === 'completed') {
                        toast.success(`Download selesai: ${d.title}`);
                        addNotification({
                            id: Date.now().toString(),
                            type: "system",
                            title: "Download Selesai",
                            message: `Buku "${d.title}" siap dibaca offline.`,
                            timestamp: "Baru saja",
                            isRead: false
                        });
                    }

                    return {
                        ...d,
                        progress: newProgress,
                        status,
                        downloadedSize: `${(parseFloat(d.size) * newProgress / 100).toFixed(1)} MB`
                    };
                }
                return d;
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const startDownload = (book: Book) => {
        if (downloads.some(d => d.bookId === book.id)) {
            toast.info("Buku ini sedang didownload atau sudah selesai");
            return;
        }

        const newDownload: DownloadItem = {
            id: Date.now().toString(),
            bookId: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.image,
            status: "downloading",
            progress: 0,
            size: `${(Math.random() * 50 + 10).toFixed(1)} MB`, // Mock size
            downloadedSize: "0 MB",
            quality: "medium"
        };

        setDownloads(prev => [newDownload, ...prev]);
        toast.success("Download dimulai");
    };

    const pauseDownload = (id: string) => {
        setDownloads(prev => prev.map(d => d.id === id ? { ...d, status: "paused" } : d));
        toast.info("Download dijeda");
    };

    const resumeDownload = (id: string) => {
        setDownloads(prev => prev.map(d => d.id === id ? { ...d, status: "downloading" } : d));
        toast.success("Download dilanjutkan");
    };

    const cancelDownload = (id: string) => {
        setDownloads(prev => prev.filter(d => d.id !== id));
        toast.info("Download dibatalkan");
    };

    const removeDownload = (id: string) => {
        setDownloads(prev => prev.filter(d => d.id !== id));
        toast.success("Download dihapus");
    };

    // Derived Stats
    const calculateStats = (): ReadingStats => {
        const completedBooks = library.filter(b => b.progress === 100);
        const totalPages = library.reduce((acc, b) => acc + (b.currentPage || 0), 0);
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const booksThisMonth = completedBooks.filter(b => {
            if (!b.lastReadDate) return false;
            const d = new Date(b.lastReadDate);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;

        const booksThisYear = completedBooks.filter(b => {
            if (!b.lastReadDate) return false;
            const d = new Date(b.lastReadDate);
            return d.getFullYear() === thisYear;
        }).length;

        // Calculate Streak
        const sortedDates = Object.keys(readingLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        let currentStreak = 0;
        let longestStreak = 0; // Simplified for now, would need full history analysis for true longest

        if (sortedDates.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // Check if read today or yesterday to maintain streak
            if (sortedDates[0] === today || sortedDates[0] === yesterday) {
                currentStreak = 1;
                let checkDate = new Date(sortedDates[0]);

                for (let i = 1; i < sortedDates.length; i++) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    const expectedDate = checkDate.toISOString().split('T')[0];
                    if (sortedDates[i] === expectedDate) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        // Calculate Avg Pages Per Day (last 30 days)
        const last30Days = Object.entries(readingLogs)
            .filter(([date]) => {
                const d = new Date(date);
                const diffTime = Math.abs(now.getTime() - d.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 30;
            })
            .reduce((acc, [, pages]) => acc + pages, 0);

        const avgPagesPerDay = Math.round(last30Days / 30);

        return {
            totalBooks: completedBooks.length,
            totalPages,
            totalTime: `${Math.round(totalPages * 1.5 / 60)} jam`,
            currentStreak,
            longestStreak: Math.max(currentStreak, longestStreak), // Basic logic
            avgPagesPerDay,
            booksThisMonth,
            booksThisYear
        };
    };

    const readingStats = calculateStats();

    return (
        <BooksContext.Provider value={{
            library,
            addToLibrary,
            removeFromLibrary,
            updateBookProgress,
            toggleFavorite,
            searchResults,
            isSearching,
            searchBooks,
            trendingBooks,
            recommendations,
            isLoadingHome,
            refreshHomeData,
            searchState,
            setSearchState,
            dashboardScroll,
            setDashboardScroll,
            collectionScroll,
            setCollectionScroll,
            currentBook,
            setCurrentBook,
            fetchBookDetails,
            readingGoals,
            addGoal,
            deleteGoal,
            readingStats,
            readingLogs, // Expose reading logs
            unlockedAchievements, // Expose achievements
            notifications,
            addNotification,
            markNotificationRead,
            markAllNotificationsRead,
            clearNotifications,
            deleteNotification,
            downloads,
            startDownload,
            pauseDownload,
            resumeDownload,
            cancelDownload,
            removeDownload,
            userProfile,
            updateProfile,
            settings,
            updateSettings
        }}>
            {children}
        </BooksContext.Provider>
    );
};

export const useBooks = () => {
    const context = useContext(BooksContext);
    if (context === undefined) {
        throw new Error('useBooks must be used within a BooksProvider');
    }
    return context;
};
