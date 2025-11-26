import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import {
  generateDeviceFingerprint,
  generateSessionId,
  createWatermark,
  initAntiPiracy,
  type UserSession,
  type WatermarkConfig,
} from "../../utils/antiPiracy";
import {
  ArrowLeft,
  Settings,
  BookmarkPlus,
  Volume2,
  Search,
  ChevronLeft,
  ChevronRight,
  Pause,
  BookOpen,
  List,
  Bookmark,
  Share2,
  MoreVertical,
  Loader2,
  Check,
  Maximize,
  Minimize,
  AlertTriangle,
  SkipForward,
  SkipBack,
  Twitter,
  Facebook,
  MessageCircle
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import { useBooks } from "../../context/BooksContext";
import { generateBookContent, BookContent, getPageContent } from "../../utils/bookContent";
import { getBookPageContent } from "../../services/api";
import confetti from "canvas-confetti";
import { OpenLibraryReader } from "./OpenLibraryReader";
import { ReaderProvider, useReader, Highlight } from "../reader/ReaderContext";
import { ReaderSettings } from "../reader/ReaderSettings";
import { TableOfContents } from "../reader/TableOfContents";
import { applyBionicReading } from "../../utils/textUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { ShareQuoteDialog } from "../dialogs/ShareQuoteDialog";

interface ReaderScreenProps {
  onBack: () => void;
  onNavigate?: (path: string) => void;
  userName: string;
  userEmail: string;
  darkMode?: boolean;
}

function EnhancedReaderContent({ onBack, onNavigate, userName, userEmail, darkMode = false }: ReaderScreenProps) {
  const { currentBook, updateBookProgress, fetchBookDetails, readerSettings, updateReaderSettings } = useBooks();
  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    addHighlight,
    viewMode,
    setViewMode,
    isTextAvailable,
    setIsTextAvailable,
  } = useReader();

  const {
    theme,
    fontSize,
    lineHeight,
    fontFamily,
    brightness,
    readingMode,
    backgroundEffects,
    ttsSpeed,
    contentProtection,
    bionicReading,
    textAlign,
    wordsPerPage,
    isItalic,
    ttsVoice,
    isContinuousReading
  } = readerSettings;

  const [currentPage, setCurrentPage] = useState(1);
  const [bookContent, setBookContent] = useState<BookContent | null>(null);
  const [pageText, setPageText] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [highlightedText, setHighlightedText] = useState("");
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);


  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleSocialShare = async () => {
    if (navigator.share) {
        await navigator.share({
            title: `Check out this book: ${currentBook?.title}`,
            text: `I'm reading "${currentBook?.title}" by ${currentBook?.author}. Check it out!`,
            url: window.location.href,
        });
        toast.success("Shared successfully!");
    } else {
        handleCopyLink();
    }
  };

  React.useEffect(() => {
    const getVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
        }
    };

    getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getVoices;
    }
  }, []);

  // Sync immersive mode with fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setImmersiveMode(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleImmersiveMode = async () => {
    try {
      if (!immersiveMode) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      }
      setImmersiveMode(!immersiveMode);
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
      // Fallback: just toggle UI state if API fails
      setImmersiveMode(!immersiveMode);
    }
  };

  // Anti-Piracy State
  const [deviceId] = useState(() => generateDeviceFingerprint());
  const [sessionId] = useState(() => generateSessionId());

  // Load Book Details
  useEffect(() => {
    const loadBookFromUrl = async () => {
      if (!currentBook) {
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get("id");
        if (bookId) {
          await fetchBookDetails(bookId);
        }
      }
    };
    loadBookFromUrl();
  }, [currentBook, fetchBookDetails]);

  // Isolate Reader Theme
  useEffect(() => {
    // Remove 'dark' class from html to isolate reader theme
    document.documentElement.classList.remove('dark');

    return () => {
      // Restore 'dark' class if enabled globally
      if (darkMode) {
        document.documentElement.classList.add('dark');
      }
    };
  }, [darkMode]);

  // Initialize content and handle wordsPerPage changes
  useEffect(() => {
    if (currentBook) {
      const content = generateBookContent(currentBook, wordsPerPage);

      // Check if we are reloading the same book with different settings
      const isSameBook = bookContent?.bookId === currentBook.id;

      if (isSameBook && bookContent && bookContent.wordsPerPage !== wordsPerPage) {
        // Settings changed, maintain progress
        const progress = (currentPage - 1) / bookContent.totalPages;
        const newPage = Math.floor(progress * content.totalPages) + 1;
        setCurrentPage(Math.min(Math.max(1, newPage), content.totalPages));
      } else if (!isSameBook) {
        // New book loaded
        const initialPage = currentBook.currentPage && currentBook.currentPage > 0 ? currentBook.currentPage : 1;
        setCurrentPage(Math.min(initialPage, content.totalPages));
      }

      setBookContent(content);
    }
  }, [currentBook?.id, wordsPerPage]);

  // Load Page Content
  useEffect(() => {
    const loadContent = async () => {
      if (currentBook?.iaId && viewMode === "text") {
        setPageText("Loading...");
        setIsTextAvailable(true);
        try {
          const text = await getBookPageContent(currentBook.iaId, currentPage);
          if (text) {
            setPageText(text);
          } else {
            setPageText("");
            setIsTextAvailable(false);
          }
        } catch (error) {
          setPageText("");
          setIsTextAvailable(false);
        }
      } else if (bookContent && viewMode === "text") {
        setPageText(getPageContent(bookContent, currentPage));
        setIsTextAvailable(true);
      }
      // Reset scroll for scroll mode
      if (readingMode === 'scroll') {
        window.scrollTo(0, 0);
      }
    };
    loadContent();
  }, [currentPage, bookContent, currentBook?.iaId, viewMode, readingMode]);

  // Update Progress
  useEffect(() => {
    if (currentBook && bookContent) {
      updateBookProgress(currentBook.id, currentPage, bookContent.totalPages);
    }
  }, [currentPage, currentBook?.id, bookContent?.totalPages]);

  // Anti-Piracy Init
  useEffect(() => {
    if (!contentProtection || !currentBook) return;
    const userSession: UserSession = {
      userId: userEmail,
      userName,
      userEmail,
      deviceId,
      sessionId,
      timestamp: Date.now(),
      isPremium: true,
    };
    return initAntiPiracy(userSession);
  }, [contentProtection, userName, userEmail, deviceId, sessionId, currentBook]);

  const watermarkConfig: WatermarkConfig = {
    userName,
    userEmail,
    deviceId,
    timestamp: new Date().toLocaleString(),
    bookId: currentBook?.id || "",
    sessionId,
  };
  const watermark = createWatermark(watermarkConfig);

  // Handlers
  const handleFinishBook = () => {
    if (currentBook) {
      updateBookProgress(currentBook.id, 100);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981']
      });
      toast.success("Congratulations! You've finished the book.");
      setTimeout(() => {
        if (onNavigate) onNavigate("collection");
        else onBack();
      }, 2000);
    }
  };

  /* const handleHighlight = (color: string) => {
    if (selectedText) {
      addHighlight({
        id: Date.now().toString(),
        text: selectedText,
        color,
        page: currentPage,
      });
      toast.success("Text highlighted");
      setShowHighlightMenu(false);
      setSelectedText("");
    }
  }; */

  const toggleTTS = () => {
    setTtsPlaying(!ttsPlaying);
    if (!ttsPlaying) {
      const utterance = new SpeechSynthesisUtterance(pageText);
      utterance.rate = ttsSpeed;
      if (ttsVoice) {
        const selectedVoice = voices.find(v => v.name === ttsVoice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onboundary = (event) => {
        const charIndex = event.charIndex;
        const text = utterance.text;
        const word = text.substring(charIndex).split(' ')[0];
        const highlighted = text.substring(0, charIndex) + `<span class="bg-blue-200 dark:bg-blue-800">${word}</span>` + text.substring(charIndex + word.length);
        setHighlightedText(highlighted);
      };

      utterance.onend = () => {
        setTtsPlaying(false);
        setHighlightedText("");
        if (isContinuousReading) {
          handleNextPage(true);
        }
      };

      window.speechSynthesis.speak(utterance);
      toast.success("TTS Playing");
    } else {
      window.speechSynthesis.cancel();
      setHighlightedText("");
      toast.success("TTS Paused");
    }
  };

  const handleToggleBookmark = () => {
    const existingBookmark = bookmarks.find(b => b.page === currentPage);
    if (existingBookmark) {
      removeBookmark(existingBookmark.id);
      toast.success("Bookmark removed");
    }
    else {
      addBookmark({
        id: Date.now().toString(),
        page: currentPage,
        label: `Page ${currentPage}`,
        color: 'blue'
      });
      toast.success("Bookmark added");
    }
  };

  const handleNextPage = (autoPlay = false) => {
    if (bookContent && currentPage < bookContent.totalPages) {
      setCurrentPage(currentPage + 1);
      window.speechSynthesis.cancel();
      setTtsPlaying(false);
      setHighlightedText("");
      if (autoPlay) {
        setIsAutoPlaying(true);
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.speechSynthesis.cancel();
      setTtsPlaying(false);
      setHighlightedText("");
    }
  };

  useEffect(() => {
    if (isAutoPlaying) {
      toggleTTS();
      setIsAutoPlaying(false);
    }
  }, [pageText, isAutoPlaying]);
  
  // Stop TTS on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  useEffect(() => {
    if (ttsPlaying) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(pageText);
      utterance.rate = ttsSpeed;
      if (ttsVoice) {
        const selectedVoice = voices.find(v => v.name === ttsVoice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onboundary = (event) => {
        const charIndex = event.charIndex;
        const text = utterance.text;
        const word = text.substring(charIndex).split(' ')[0];
        const highlighted = text.substring(0, charIndex) + `<span class="bg-blue-200 dark:bg-blue-800">${word}</span>` + text.substring(charIndex + word.length);
        setHighlightedText(highlighted);
      };

      utterance.onend = () => {
        setTtsPlaying(false);
        setHighlightedText("");
        if (isContinuousReading) {
          handleNextPage(true);
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  }, [ttsSpeed, ttsVoice]);

  // Theme Styles
  const fontMap: Record<string, string> = {
    'Inter': '"Inter", sans-serif',
    'Merriweather': '"Merriweather", serif',
    'Roboto': '"Roboto", sans-serif',
    'Lora': '"Lora", serif',
    'Georgia': 'Georgia, serif',
    'Times New Roman': '"Times New Roman", serif',
    'Arial': 'Arial, sans-serif',
    'Verdana': 'Verdana, sans-serif',
    'Open Dyslexic': '"OpenDyslexic", "Comic Sans MS", cursive',
  };

  const themeStyles = {
    light: {
      bg: "bg-white",
      text: "text-slate-800",
      muted: "text-slate-500",
      border: "border-slate-200",
      icon: "text-slate-600 hover:text-slate-900",
      headerBg: "bg-white",
      headerBgHex: "#ffffff"
    },
    dark: {
      bg: "bg-slate-950",
      text: "text-slate-50",
      muted: "text-slate-300",
      border: "border-slate-700",
      icon: "text-slate-200 hover:text-white",
      headerBg: "bg-slate-800",
      headerBgHex: "#1e293b"
    },
    sepia: {
      bg: "bg-[#fbf5e9]",
      text: "text-[#5b4636]",
      muted: "text-[#8c7a6b]",
      border: "border-[#e6dace]",
      icon: "text-[#5b4636] hover:text-[#3e2f25]",
      headerBg: "bg-[#fbf5e9]",
      headerBgHex: "#fbf5e9"
    },
    night: {
      bg: "bg-black",
      text: "text-gray-200",
      muted: "text-gray-400",
      border: "border-[#262626]",
      icon: "text-gray-300 hover:text-white",
      headerBg: "bg-black",
      headerBgHex: "#000000"
    },
    "e-ink": {
      bg: "bg-gray-100",
      text: "text-black",
      muted: "text-gray-600",
      border: "border-gray-300",
      icon: "text-gray-700 hover:text-black",
      headerBg: "bg-gray-100",
      headerBgHex: "#f3f4f6"
    },
  };

  const currentTheme = themeStyles[theme];

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <p className="text-gray-500">Memuat buku...</p>
      </div>
    );
  }

  if (viewMode === "scan" && currentBook?.iaId) {
    return (
      <OpenLibraryReader
        bookId={currentBook.iaId}
        onClose={() => setViewMode("text")}
      />
    );
  }

  const getMainBackground = () => {
    if (backgroundEffects && (theme === 'dark' || theme === 'night')) {
      return "bg-[#050505]";
    }
    return currentTheme.bg;
  };

  const isDarkMode = theme === 'dark' || theme === 'night';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${getMainBackground()} ${isDarkMode ? 'dark' : ''}`}>
      {/* Background Effects */}
      {backgroundEffects && (theme === 'dark' || theme === 'night') && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      )}

      {/* Header */}
      <div className={`
        sticky top-0 z-40 transition-transform duration-300
        ${immersiveMode ? '-translate-y-full' : 'translate-y-0'}
        ${immersiveMode ? '-translate-y-full' : 'translate-y-0'}
        ${currentTheme.headerBg} border-b ${currentTheme.border}
      `}
        style={{ backgroundColor: currentTheme.headerBgHex }}
      >
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className={isDarkMode ? 'text-white hover:text-gray-200 hover:bg-white/10' : currentTheme.icon}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="hidden md:block">
              <h1 className={`text-sm font-semibold truncate max-w-[200px] ${isDarkMode ? 'text-white' : currentTheme.text}`}>
                {currentBook.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowTableOfContents(true)} className={isDarkMode ? 'text-white hover:text-gray-200 hover:bg-white/10' : currentTheme.icon}>
              <List className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleTTS} className={`${ttsPlaying ? "text-blue-500" : (isDarkMode ? 'text-white hover:text-gray-200 hover:bg-white/10' : currentTheme.icon)}`}>
              {ttsPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} className={isDarkMode ? 'text-white hover:text-gray-200 hover:bg-white/10' : currentTheme.icon}>
              <Settings className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={isDarkMode ? 'text-white hover:text-gray-200 hover:bg-white/10' : currentTheme.icon}>
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={isDarkMode ? "dark" : ""}>
                <DropdownMenuItem onClick={handleToggleBookmark}>
                  {bookmarks.some(b => b.page === currentPage) ? <Bookmark className="w-4 h-4 mr-2" /> : <BookmarkPlus className="w-4 h-4 mr-2" />}
                  <span>{bookmarks.some(b => b.page === currentPage) ? "Remove Bookmark" : "Add Bookmark"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleImmersiveMode}>
                  {immersiveMode ? <Minimize className="w-4 h-4 mr-2" /> : <Maximize className="w-4 h-4 mr-2" />}
                  <span>{immersiveMode ? "Exit Fullscreen" : "Fullscreen"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="flex-1 relative z-10 overflow-hidden"
        onClick={() => immersiveMode && setImmersiveMode(false)}
      >
        {/* Watermark Overlay */}
        {contentProtection && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden opacity-[0.03]">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute whitespace-nowrap text-xs font-bold select-none"
                style={{
                  transform: 'rotate(-45deg)',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  color: theme === 'dark' ? 'white' : 'black'
                }}
              >
                {watermark}
              </div>
            ))}
          </div>
        )}

        {/* Reader Content */}
        <div
          className={`
            h-full w-full px-4 md:px-8 py-8 mx-auto max-w-4xl
            ${currentTheme.text}
            ${readingMode === 'paginated' ? 'overflow-x-auto' : 'overflow-y-auto'}
          `}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            filter: `brightness(${brightness}%)`,
            fontFamily: fontMap[fontFamily] || 'sans-serif',
            textAlign: textAlign,
            fontStyle: isItalic ? 'italic' : 'normal',
          }}
          onMouseUp={() => {
            if (!contentProtection) {
              const selection = window.getSelection();
              const text = selection?.toString().trim();
              if (text && text.length > 0) {
                setSelectedText(text);
                setShowHighlightMenu(true);
              }
            }
          }}
        >
          {!isTextAvailable ? (
            // Futuristic Fallback Screen
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                <AlertTriangle className="w-20 h-20 text-blue-500 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Mode Teks Tidak Tersedia
              </h3>
              <p className={`max-w-md mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Maaf, teks digital untuk halaman ini tidak tersedia atau dilindungi hak cipta.
                Silakan gunakan tampilan pindaian untuk membaca.
              </p>
              <Button
                onClick={() => setViewMode("scan")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Beralih ke Tampilan Pindaian
              </Button>
            </div>
          ) : (
            readingMode === 'paginated' ? (
              // Paginated View (Columnar)
              <div
                className="h-[calc(100vh-140px)] w-full"
                style={{
                  columnWidth: '100vw', // Force single column per screen width
                  columnGap: '4rem',
                  height: '100%',
                  columnFill: 'auto',
                  width: '100%',
                  textAlign: textAlign
                }}
              >
                <div dangerouslySetInnerHTML={{
                  __html: (ttsPlaying && highlightedText ? highlightedText : (bionicReading ? applyBionicReading(pageText) : pageText))
                    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
                    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
                    .replace(/\n\n/g, '<br/><br/>')
                }} />
              </div>
            ) : (
              // Scroll View
              <div className="pb-32">
                <div dangerouslySetInnerHTML={{
                  __html: (ttsPlaying && highlightedText ? highlightedText : (bionicReading ? applyBionicReading(pageText) : pageText))
                    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
                    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-4">$1</h2>')
                    .replace(/\n\n/g, '<br/><br/>')
                }} />
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className={`
        sticky bottom-0 z-40 transition-transform duration-300
        ${immersiveMode ? 'translate-y-full' : 'translate-y-0'}
        ${currentTheme.headerBg} border-t ${currentTheme.border}
      `}
        style={{ backgroundColor: currentTheme.headerBgHex }}
      >
        <div className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`bg-transparent border ${isDarkMode ? 'text-white border-gray-700 hover:bg-white/10' : `${currentTheme.text} ${currentTheme.border} hover:bg-black/5`}`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <div className="flex flex-col items-center flex-1 mx-4">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : currentTheme.text}`}>
              Page {currentPage}
            </span>
            <div className="w-full max-w-xs flex items-center gap-2">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : currentTheme.muted}`}>1</span>
              <Slider
                value={[currentPage]}
                min={1}
                max={bookContent?.totalPages || 1}
                step={1}
                onValueChange={(val: number[]) => setCurrentPage(val[0])}
                className="flex-1"
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : currentTheme.muted}`}>{bookContent?.totalPages || 1}</span>
            </div>
          </div>

          {currentBook && currentPage >= (bookContent?.totalPages || 1) ? (
            <Button onClick={handleFinishBook} className="bg-green-600 hover:bg-green-700 text-white">
              Finish Book <Check className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setCurrentPage(Math.min((bookContent?.totalPages || 1), currentPage + 1))}
              disabled={!bookContent || currentPage >= (bookContent?.totalPages || 1)}
              className={`bg-transparent border ${isDarkMode ? 'text-white border-gray-700 hover:bg-white/10' : `${currentTheme.text} ${currentTheme.border} hover:bg-black/5`}`}
            >
              Next <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Table of Contents */}
      <TableOfContents
        open={showTableOfContents}
        onOpenChange={setShowTableOfContents}
        chapters={bookContent?.chapters || []}
        onNavigatePage={setCurrentPage}
        currentPage={currentPage}
      />

      {/* Settings Sheet */}
      <ReaderSettings open={settingsOpen} onOpenChange={setSettingsOpen} onNavigatePage={setCurrentPage} />

      {/* Share Dialog */}
      {currentBook && (
        <ShareQuoteDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          bookTitle={currentBook.title}
          author={currentBook.author}
          bookUrl={window.location.href}
          coverUrl={currentBook.image}
        />
      )}

      {/* Highlight Menu */}
      {/* {showHighlightMenu && selectedText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setShowHighlightMenu(false)}>
          <Card className="p-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">"{selectedText}"</p>
              <div className="flex gap-2">
                {['yellow', 'blue', 'green', 'pink', 'purple'].map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full bg-${color}-400 hover:scale-110 transition-transform`}
                    onClick={() => handleHighlight(color)}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      )} */}
    </div>
  );
}

export function EnhancedReaderScreen(props: ReaderScreenProps) {
  return (
    <ReaderProvider>
      <EnhancedReaderContent {...props} />
    </ReaderProvider>
  );
}
