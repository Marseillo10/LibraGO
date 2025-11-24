import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import { HelmetProvider } from 'react-helmet-async';
import SEO from "./components/SEO";
import { toast } from "sonner";
import { LoginScreen } from "./components/screens/LoginScreen";
import { RegisterScreen } from "./components/screens/RegisterScreen";
import { WelcomeScreen } from "./components/screens/WelcomeScreen";
import { GenreSelectionScreen } from "./components/screens/GenreSelectionScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { SearchScreen } from "./components/screens/SearchScreen";
import { EnhancedSearchScreen } from "./components/screens/EnhancedSearchScreen";
import { CollectionScreen } from "./components/screens/CollectionScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";
import { BookDetailScreen } from "./components/screens/BookDetailScreen";
import { ReaderScreen } from "./components/screens/ReaderScreen";
import { EnhancedReaderScreen } from "./components/screens/EnhancedReaderScreen";
import { SubscriptionScreen } from "./components/screens/SubscriptionScreen";
import NotificationScreen from "./components/screens/NotificationScreen";
import HistoryScreen from "./components/screens/HistoryScreen";
import ReadingGoalsScreen from "./components/screens/ReadingGoalsScreen";
import SettingsScreen from "./components/screens/SettingsScreen";
import HelpScreen from "./components/screens/HelpScreen";
import DownloadScreen from "./components/screens/DownloadScreen";
import SupportScreen from "./components/screens/SupportScreen";
import CommunityScreen from "./components/screens/CommunityScreen";
import PublisherDashboard from "./components/screens/PublisherDashboard";
import { BottomNav } from "./components/BottomNav";
import { MobileMenu } from "./components/MobileMenu";
import { DesktopSidebar } from "./components/DesktopSidebar";
import { CommandPalette } from "./components/CommandPalette";
import { Moon, Sun, Wifi, WifiOff } from "lucide-react";
import { Button } from "./components/ui/button";
import { useKeyboardShortcuts, useOnlineStatus } from "./utils/hooks";

type Screen =
  | "login"
  | "register"
  | "welcome"
  | "genre-selection"
  | "home"
  | "search"
  | "collection"
  | "profile"
  | "book-detail"
  | "reader"
  | "subscription"
  | "notifications"
  | "history"
  | "goals"
  | "settings"
  | "help"
  | "downloads"
  | "support"
  | "community"
  | "publisher";

import { useBooks } from "./context/BooksContext";

export default function App() {
  const { fetchBookDetails, userProfile } = useBooks();

  // Initialize screen based on URL path
  const getInitialScreen = (): Screen => {
    const path = window.location.pathname.substring(1); // Remove leading slash
    if (!path) return "login"; // Default to login if root, auth check will redirect to home

    // Handle ISBN deep link
    if (path.startsWith("isbn/")) {
      return "search";
    }

    // Map paths to screens
    const validScreens: Screen[] = [
      "login", "register", "welcome", "genre-selection", "home", "search",
      "collection", "profile", "book-detail", "reader", "subscription",
      "notifications", "history", "goals", "settings", "help", "downloads",
      "support", "community", "publisher"
    ];

    if (validScreens.includes(path as Screen)) {
      return path as Screen;
    }
    return "login";
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen);

  // Persistent Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('librago-is-logged-in') === 'true';
  });

  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Show onboarding if not completed
    return localStorage.getItem('librago-onboarding-complete') !== 'true';
  });

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to dark mode (true)
    const savedMode = localStorage.getItem('librago-dark-mode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [useEnhancedFeatures, setUseEnhancedFeatures] = useState(true); // Enable enhanced screens by default
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Online status hook
  const isOnline = useOnlineStatus();
  const { setSearchState } = useBooks();

  // Handle ISBN Deep Link
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/isbn/")) {
      const isbn = path.split("/isbn/")[1];
      if (isbn) {
        setSearchState((prev: any) => ({
          ...prev,
          query: `isbn:${isbn}`,
          results: [] // Clear previous results to trigger new search
        }));
      }
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference to localStorage
    localStorage.setItem('librago-dark-mode', darkMode.toString());
  }, [darkMode]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync URL with currentScreen
  useEffect(() => {
    let path = "/";
    if (currentScreen !== "home") {
      path = `/${currentScreen}`;
    }

    // Don't overwrite ISBN path immediately if we just landed there
    if (window.location.pathname.startsWith("/isbn/") && currentScreen === "search") {
      return;
    }

    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  }, [currentScreen]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1);
      if (!path) {
        setCurrentScreen(isLoggedIn ? "home" : "login");
      } else if (path.startsWith("isbn/")) {
        setCurrentScreen("search");
      } else {
        // Simple mapping, assuming path matches screen name
        setCurrentScreen(path as Screen);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isLoggedIn]);

  // Keyboard Shortcuts (enabled when logged in)
  useKeyboardShortcuts(
    isLoggedIn
      ? [
        {
          key: "k",
          meta: true,
          action: () => setCommandPaletteOpen(true),
          description: "Open command palette",
        },
        {
          key: "b",
          meta: true,
          action: () => {
            toast.info("Bookmark feature coming soon!");
          },
          description: "Toggle bookmark",
        },
        {
          key: "d",
          meta: true,
          action: () => {
            toggleDarkMode();
          },
          description: "Toggle dark mode",
        },
        {
          key: "/",
          action: () => {
            if (currentScreen !== "search") {
              handleNavigate("search");
            }
          },
          description: "Go to search",
        },
      ]
      : []
  );

  // Effect to redirect to home if already logged in on mount
  useEffect(() => {
    // Don't redirect if we are on a deep link like ISBN
    if (window.location.pathname.startsWith("/isbn/")) return;

    if (isLoggedIn && currentScreen === "login") {
      setCurrentScreen("home");
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('librago-is-logged-in', 'true');

    // If onboarding already done, go to home
    if (localStorage.getItem('librago-onboarding-complete') === 'true') {
      setShowOnboarding(false);
      setCurrentScreen("home");
    } else {
      setShowOnboarding(false); // Skip for now or check logic
      setCurrentScreen("home");
    }

    toast.success("Berhasil masuk! Selamat datang di LibraGO");
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    localStorage.setItem('librago-is-logged-in', 'true');
    setShowOnboarding(true); // Show onboarding for new users
    localStorage.removeItem('librago-onboarding-complete');
    setCurrentScreen("welcome");
    toast.success("Akun berhasil dibuat! Selamat datang di LibraGO");
  };

  const handleWelcomeComplete = () => {
    setCurrentScreen("genre-selection");
  };

  const handleGenreSelectionComplete = (genres: string[]) => {
    setSelectedGenres(genres);
    setShowOnboarding(false);
    localStorage.setItem('librago-onboarding-complete', 'true');
    setCurrentScreen("home");
    toast.success("Profil Anda sudah diatur! Selamat membaca 📚");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('librago-is-logged-in');
    setCurrentScreen("login");
    toast.info("Anda telah keluar dari LibraGO");
  };

  // Navigation History Stack
  const [historyStack, setHistoryStack] = useState<Screen[]>([]);

  const handleNavigate = (page: string) => {
    // clear history when navigating from menu
    setHistoryStack([]);
    setCurrentScreen(page as Screen);
  };

  const handleSelectBook = async (bookId: string) => {
    console.log("Selected book:", bookId);
    await fetchBookDetails(bookId);
    // Push current screen to history before navigating
    setHistoryStack((prev) => [...prev, currentScreen]);
    setCurrentScreen("book-detail");
  };

  const handleReadBook = () => {
    // Push current screen (book-detail) to history
    setHistoryStack((prev) => [...prev, currentScreen]);
    setCurrentScreen("reader");
  };

  const handleUpgrade = () => {
    // Push current screen to history
    setHistoryStack((prev) => [...prev, currentScreen]);
    setCurrentScreen("subscription");
  };

  const handleSubscribe = () => {
    toast.success("Selamat! Anda sekarang adalah member Premium", {
      description: "Nikmati akses tanpa batas ke semua konten premium",
    });
    // Clear history and go home
    setHistoryStack([]);
    setCurrentScreen("home");
  };

  const handleBack = () => {
    if (historyStack.length > 0) {
      const newStack = [...historyStack];
      const previousScreen = newStack.pop();
      setHistoryStack(newStack);
      if (previousScreen) {
        setCurrentScreen(previousScreen);
        return;
      }
    }

    // Fallback if history is empty
    if (currentScreen === "book-detail" || currentScreen === "subscription") {
      setCurrentScreen("home");
    } else if (currentScreen === "reader") {
      setCurrentScreen("book-detail");
    } else {
      setCurrentScreen("home");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Show login/register/onboarding screens if not logged in or onboarding
  if (!isLoggedIn) {
    return (
      <>
        {currentScreen === "login" ? (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentScreen("register")}
          />
        ) : (
          <RegisterScreen
            onRegister={handleRegister}
            onNavigateToLogin={() => setCurrentScreen("login")}
          />
        )}
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Show onboarding for new users
  if (showOnboarding && currentScreen === "welcome") {
    return (
      <>
        <WelcomeScreen onComplete={handleWelcomeComplete} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (showOnboarding && currentScreen === "genre-selection") {
    return (
      <>
        <GenreSelectionScreen onComplete={handleGenreSelectionComplete} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Main app screens
  return (
    <HelmetProvider>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}`}>
        <SEO />
        <Toaster position="top-center" richColors />

        {/* Desktop Sidebar - Only show on desktop for main screens */}
        {isDesktop && ["home", "search", "collection", "profile", "notifications", "history", "goals", "settings", "help", "downloads", "support", "community", "publisher"].includes(currentScreen) && (
          <DesktopSidebar
            active={currentScreen}
            onNavigate={handleNavigate}
            onUpgrade={handleUpgrade}
            onLogout={handleLogout}
            userName={userProfile.name}
            userEmail={userProfile.email}
            isPremium={userProfile.isPremium}
            collapsed={sidebarCollapsed}
            onToggleCollapse={setSidebarCollapsed}
          />
        )}

        {/* Main Content */}
        <div className={`${isDesktop && ["home", "search", "collection", "profile", "notifications", "history", "goals", "settings", "help", "downloads", "support", "community", "publisher"].includes(currentScreen) ? (sidebarCollapsed ? "lg:pl-20" : "lg:pl-64") : ""}`}>
          {/* Dark Mode Toggle - Desktop Only, Top Right */}
          {isDesktop && !["reader", "book-detail"].includes(currentScreen) && (
            <div className="fixed top-6 right-6 z-50">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full shadow-lg"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          )}

          {/* Screen Content */}
          <div className={`${!isDesktop ? "max-w-md mx-auto" : ""}`}>
            {currentScreen === "home" && (
              <>
                <SEO title="Home" />
                <HomeScreen
                  onSelectBook={handleSelectBook}
                  onUpgrade={handleUpgrade}
                  onNavigate={handleNavigate}
                  darkMode={darkMode}
                />
              </>
            )}

            {currentScreen === "search" && (
              useEnhancedFeatures ? (
                <>
                  <SEO title="Search Books" />
                  <EnhancedSearchScreen
                    onSelectBook={handleSelectBook}
                    darkMode={darkMode}
                  />
                </>
              ) : (
                <>
                  <SEO title="Search Books" />
                  <SearchScreen
                    onSelectBook={handleSelectBook}
                    darkMode={darkMode}
                  />
                </>
              )
            )}

            {currentScreen === "collection" && (
              <>
                <SEO title="My Collection" />
                <CollectionScreen
                  onSelectBook={handleSelectBook}
                  darkMode={darkMode}
                />
              </>
            )}

            {currentScreen === "profile" && (
              <>
                <SEO title="My Profile" />
                <ProfileScreen
                  user={userProfile}
                  darkMode={darkMode}
                  onToggleDarkMode={toggleDarkMode}
                  onUpgrade={handleUpgrade}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                  onUpdateProfile={() => { }} // No-op, handled by context
                />
              </>
            )}

            {currentScreen === "book-detail" && (
              <>
                <SEO title="Book Details" />
                <BookDetailScreen
                  onBack={handleBack}
                  onRead={handleReadBook}
                  onUpgrade={handleUpgrade}
                  darkMode={darkMode}
                  onToggleDarkMode={toggleDarkMode}
                />
              </>
            )}

            {currentScreen === "reader" && (
              useEnhancedFeatures ? (
                <>
                  <SEO title="Reading" />
                  <EnhancedReaderScreen
                    onBack={handleBack}
                    onNavigate={handleNavigate}
                    userName="Dr. Alisa"
                    userEmail="alisa@hospital.com"
                    darkMode={darkMode}
                  />
                </>
              ) : (
                <>
                  <SEO title="Reading" />
                  <ReaderScreen
                    onBack={handleBack}
                    onNavigate={handleNavigate}
                    userName={userProfile.name}
                    userEmail={userProfile.email}
                  />
                </>
              )
            )}

            {currentScreen === "subscription" && (
              <>
                <SEO title="Premium Subscription" />
                <SubscriptionScreen
                  onBack={handleBack}
                  onSubscribe={handleSubscribe}
                />
              </>
            )}

            {currentScreen === "notifications" && (
              <>
                <SEO title="Notifications" />
                <NotificationScreen />
              </>
            )}

            {currentScreen === "history" && (
              <>
                <SEO title="Reading History" />
                <HistoryScreen />
              </>
            )}

            {currentScreen === "goals" && (
              <>
                <SEO title="Reading Goals" />
                <ReadingGoalsScreen />
              </>
            )}

            {currentScreen === "settings" && (
              <>
                <SEO title="Settings" />
                <SettingsScreen
                  user={userProfile}
                  onUpdateProfile={() => { }} // No-op, handled by context
                  onLogout={handleLogout}
                  darkMode={darkMode}
                  onToggleDarkMode={toggleDarkMode}
                  onNavigate={handleNavigate}
                />
              </>
            )}

            {currentScreen === "help" && (
              <>
                <SEO title="Help Center" />
                <HelpScreen />
              </>
            )}

            {currentScreen === "downloads" && (
              <>
                <SEO title="Downloads" />
                <DownloadScreen />
              </>
            )}

            {currentScreen === "support" && (
              <>
                <SEO title="Support Us" />
                <SupportScreen />
              </>
            )}

            {currentScreen === "community" && (
              <>
                <SEO title="Community" />
                <CommunityScreen />
              </>
            )}

            {currentScreen === "publisher" && (
              <>
                <SEO title="Publisher Dashboard" />
                <PublisherDashboard />
              </>
            )}
          </div>

          {/* Mobile Menu - Available on all screens when mobile */}
          {!isDesktop && (
            <MobileMenu
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              onNavigate={handleNavigate}
              onUpgrade={handleUpgrade}
              onLogout={handleLogout}
              userName={userProfile.name}
              userEmail={userProfile.email}
              isPremium={userProfile.isPremium}
            />
          )}

          {/* Bottom Navigation - Only show on mobile for main screens */}
          {!isDesktop && ["home", "search", "collection", "profile", "notifications", "history", "goals", "downloads", "community", "settings", "help", "support"].includes(currentScreen) && (
            <BottomNav
              active={currentScreen}
              onNavigate={handleNavigate}
              onMenuOpen={() => setMobileMenuOpen(true)}
              notificationCount={notificationCount}
            />
          )}
        </div>

        {/* Command Palette - Desktop only */}
        {isDesktop && isLoggedIn && (
          <CommandPalette
            open={commandPaletteOpen}
            onOpenChange={setCommandPaletteOpen}
            onNavigate={handleNavigate}
            onToggleDarkMode={toggleDarkMode}
            darkMode={darkMode}
            currentScreen={currentScreen}
          />
        )}

        {/* Online Status Indicator - Mobile only */}
        {!isDesktop && !isOnline && (
          <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Tidak ada koneksi internet</span>
          </div>
        )}
      </div>
    </HelmetProvider>
  );
}