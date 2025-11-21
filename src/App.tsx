import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
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
  | "community";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to dark mode (true)
    const savedMode = localStorage.getItem('librago-dark-mode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [useEnhancedFeatures, setUseEnhancedFeatures] = useState(true); // Toggle for enhanced screens
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const userData = {
    name: "Dr. Alisa Prasetyo",
    email: "alisa.prasetyo@university.edu",
    isPremium: false,
  };

  // Online status hook
  const isOnline = useOnlineStatus();

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

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowOnboarding(false); // Skip onboarding for existing users
    setCurrentScreen("home");
    toast.success("Berhasil masuk! Selamat datang di LibraGO");
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setShowOnboarding(true); // Show onboarding for new users
    setCurrentScreen("welcome");
    toast.success("Akun berhasil dibuat! Selamat datang di LibraGO");
  };

  const handleWelcomeComplete = () => {
    setCurrentScreen("genre-selection");
  };

  const handleGenreSelectionComplete = (genres: string[]) => {
    setSelectedGenres(genres);
    setShowOnboarding(false);
    setCurrentScreen("home");
    toast.success("Profil Anda sudah diatur! Selamat membaca 📚");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen("login");
    toast.info("Anda telah keluar dari LibraGO");
  };

  const handleNavigate = (page: string) => {
    setCurrentScreen(page as Screen);
  };

  const handleSelectBook = (bookId: string) => {
    console.log("Selected book:", bookId);
    setCurrentScreen("book-detail");
  };

  const handleReadBook = () => {
    setCurrentScreen("reader");
  };

  const handleUpgrade = () => {
    setCurrentScreen("subscription");
  };

  const handleSubscribe = () => {
    toast.success("Selamat! Anda sekarang adalah member Premium", {
      description: "Nikmati akses tanpa batas ke semua konten premium",
    });
    setCurrentScreen("home");
  };

  const handleBack = () => {
    if (currentScreen === "book-detail" || currentScreen === "subscription") {
      setCurrentScreen("home");
    } else if (currentScreen === "reader") {
      setCurrentScreen("book-detail");
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
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - Only show on desktop for main screens */}
      {isDesktop && ["home", "search", "collection", "profile", "notifications", "history", "goals", "settings", "help", "downloads", "support", "community"].includes(currentScreen) && (
        <DesktopSidebar
          active={currentScreen}
          onNavigate={handleNavigate}
          onUpgrade={handleUpgrade}
          onLogout={handleLogout}
          userName={userData.name}
          userEmail={userData.email}
          isPremium={userData.isPremium}
          collapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />
      )}

      {/* Main Content */}
      <div className={`${isDesktop && ["home", "search", "collection", "profile", "notifications", "history", "goals", "settings", "help", "downloads", "support", "community"].includes(currentScreen) ? (sidebarCollapsed ? "lg:pl-20" : "lg:pl-64") : ""}`}>
        {/* Dark Mode Toggle - Desktop Only, Top Right */}
        {isDesktop && !["reader"].includes(currentScreen) && (
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
            <HomeScreen 
              onSelectBook={handleSelectBook}
              onUpgrade={handleUpgrade}
              onNavigate={handleNavigate}
            />
          )}
          
          {currentScreen === "search" && (
            useEnhancedFeatures ? (
              <EnhancedSearchScreen onSelectBook={handleSelectBook} />
            ) : (
              <SearchScreen onSelectBook={handleSelectBook} />
            )
          )}
          
          {currentScreen === "collection" && (
            <CollectionScreen onSelectBook={handleSelectBook} />
          )}
          
          {currentScreen === "profile" && (
            <ProfileScreen
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              onUpgrade={handleUpgrade}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          )}
          
          {currentScreen === "book-detail" && (
            <BookDetailScreen
              onBack={handleBack}
              onRead={handleReadBook}
              onUpgrade={handleUpgrade}
            />
          )}
          
          {currentScreen === "reader" && (
            useEnhancedFeatures ? (
              <EnhancedReaderScreen 
                onBack={handleBack}
                userName={userData.name}
                userEmail={userData.email}
              />
            ) : (
              <ReaderScreen 
                onBack={handleBack}
                userName={userData.name}
                userEmail={userData.email}
              />
            )
          )}
          
          {currentScreen === "subscription" && (
            <SubscriptionScreen
              onBack={handleBack}
              onSubscribe={handleSubscribe}
            />
          )}

          {currentScreen === "notifications" && (
            <NotificationScreen />
          )}

          {currentScreen === "history" && (
            <HistoryScreen />
          )}

          {currentScreen === "goals" && (
            <ReadingGoalsScreen />
          )}

          {currentScreen === "settings" && (
            <SettingsScreen />
          )}

          {currentScreen === "help" && (
            <HelpScreen />
          )}

          {currentScreen === "downloads" && (
            <DownloadScreen />
          )}

          {currentScreen === "support" && (
            <SupportScreen />
          )}

          {currentScreen === "community" && (
            <CommunityScreen />
          )}
        </div>

        {/* Mobile Menu - Available on all screens when mobile */}
        {!isDesktop && (
          <MobileMenu
            userName={userData.name}
            userEmail={userData.email}
            isPremium={userData.isPremium}
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            onNavigate={handleNavigate}
            onUpgrade={handleUpgrade}
            onLogout={handleLogout}
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

      <Toaster position="top-center" richColors />
    </div>
  );
}