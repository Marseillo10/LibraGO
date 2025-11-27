import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import {
  generateDeviceFingerprint,
  generateSessionId,
  createWatermark,
  initAntiPiracy,
  type UserSession,
  type WatermarkConfig,
} from "../../utils/antiPiracy";
import { toast } from "sonner";
import {
  ArrowLeft,
  Settings,
  BookmarkPlus,
  Menu,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ScanLine
} from "lucide-react";
import { useBooks } from "../../context/BooksContext";
import { generateBookContent, getPageContent, type BookContent } from "../../utils/bookContent";
import { ReaderSettings } from "../reader/ReaderSettings";
import { applyBionicReading } from "../../utils/textUtils";

interface ReaderScreenProps {
  onBack: () => void;
  onNavigate?: (path: string) => void;
  userName: string;
  userEmail: string;
}

function ReaderScreenContent({ onBack, onNavigate, userName, userEmail }: ReaderScreenProps) {
  const { currentBook, updateBookProgress, fetchBookDetails, readerSettings } = useBooks();
  const {
    theme,
    fontSize,
    lineHeight,
    fontFamily,
    brightness,
    readingMode,
    backgroundEffects,
    contentProtection,
    bionicReading,
    textAlign,
    readerWidth
  } = readerSettings;

  const [currentPage, setCurrentPage] = useState(currentBook?.currentPage || 1);
  const [showControls, setShowControls] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bookContent, setBookContent] = useState<BookContent | null>(null);
  const [pageText, setPageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId] = useState(() => generateDeviceFingerprint());
  const [sessionId] = useState(() => generateSessionId());

  // Helper to determine reader width classes
  const getReaderWidthClass = (width: 'narrow' | 'normal' | 'wide') => {
      switch (width) {
          case 'narrow': return 'max-w-xl';
          case 'normal': return 'max-w-3xl';
          case 'wide': return 'max-w-5xl';
          default: return 'max-w-3xl';
      }
  };

  const readerWidthClass = getReaderWidthClass(readerWidth);

  // Load book details if missing
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

  // Initialize content
  useEffect(() => {
    if (currentBook) {
      const content = generateBookContent(currentBook, wordsPerPage);
      setBookContent(content);
      const initialPage = currentBook.currentPage && currentBook.currentPage > 0
        ? currentBook.currentPage
        : 1;
      setCurrentPage(initialPage);
    }
  }, [currentBook?.id, wordsPerPage]);

  // Load page text
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      if (currentBook?.iaId) {
        try {
          const text = await getBookPageContent(currentBook.iaId, currentPage);
          setPageText(text || "");
        } catch (error) {
          setPageText("");
        }
      } else if (bookContent) {
        setPageText(getPageContent(bookContent, currentPage));
      }
      setIsLoading(false);
      if (readingMode === 'scroll') {
        window.scrollTo(0, 0);
      }
    };
    loadContent();
  }, [currentPage, bookContent, currentBook?.iaId, readingMode]);

  // Update progress
  useEffect(() => {
    if (currentBook) {
      updateBookProgress(currentBook.id, currentPage);
    }
  }, [currentPage, currentBook?.id]);

  // Anti-Piracy
  useEffect(() => {
    if (!contentProtection) return;

    const userSession: UserSession = {
      userId: userEmail,
      userName,
      userEmail,
      deviceId,
      sessionId,
      timestamp: Date.now(),
      isPremium: false,
    };
    const cleanup = initAntiPiracy(userSession);
    return cleanup;
  }, [userName, userEmail, deviceId, sessionId, contentProtection]);

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const watermark = createWatermark({
    userName,
    userEmail,
    deviceId,
    timestamp: new Date().toLocaleString(),
    bookId: currentBook.id,
    sessionId,
  });

  const themes = {
    light: { bg: "bg-white", text: "text-slate-900", ui: "bg-white border-slate-200", bgHex: "#ffffff" },
    dark: { bg: "bg-slate-950", text: "text-slate-100", ui: "bg-slate-800 border-slate-700", bgHex: "#1e293b" },
    sepia: { bg: "bg-[#F4ECD8]", text: "text-slate-900", ui: "bg-[#F4ECD8] border-[#E6DCC6]", bgHex: "#F4ECD8" },
    night: { bg: "bg-[#1a1a1a]", text: "text-gray-300", ui: "bg-neutral-800 border-[#333]", bgHex: "#262626" },
    "e-ink": { bg: "bg-[#F5F5F5]", text: "text-slate-800", ui: "bg-[#F5F5F5] border-[#E0E0E0]", bgHex: "#F5F5F5" },
  };

  const currentTheme = themes[theme];

  // Font Family Map
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

  const handlePageChange = (newPage: number) => {
    const maxPage = currentBook.pageCount || 9999;
    setCurrentPage(Math.max(1, Math.min(maxPage, newPage)));
  };

  return (
    <div
      className={`min-h-screen ${currentTheme.bg} transition-colors duration-500 relative overflow-hidden`}
      style={{ filter: `brightness(${brightness}%)` }}
    >
      {/* Background Animation */}
      {backgroundAnimation && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        </div>
      )}

      {/* Header / Toolbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showControls ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div
          className={`${currentTheme.ui} border-b px-4 h-16 flex items-center justify-between shadow-sm`}
          style={{ backgroundColor: currentTheme.bgHex }}
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className={currentTheme.text}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${currentTheme.text} line-clamp-1`}>{currentBook.title}</span>
              <span className={`text-xs opacity-70 ${currentTheme.text}`}>{currentBook.author}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className={currentTheme.text}>
              <Volume2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className={currentTheme.text}>
              <BookmarkPlus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className={currentTheme.text}>
              <Menu className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className={`${currentTheme.text} bg-white/10`}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="relative h-screen w-full"
        onClick={() => setShowControls(!showControls)}
      >
        {/* Content Protection Watermark */}
        {contentProtection && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden opacity-[0.03]">
            <div className="w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] flex flex-wrap content-center justify-center gap-24">
              {Array.from({ length: 50 }).map((_, i) => (
                <span key={i} className={`text-xl font-bold ${currentTheme.text}`}>
                  {watermark}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Text Content or Fallback */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : !pageText ? (
          // Fallback Screen (Text Mode Not Available)
          <div className="flex flex-col items-center justify-center h-full p-8 text-center relative overflow-hidden">
            {/* Futuristic Background for Error Screen */}
            <div className="absolute inset-0 bg-slate-900 z-0">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-md space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/20">
                <ScanLine className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Mode Teks Tidak Tersedia</h2>
              <p className="text-slate-300">
                Maaf, teks digital untuk halaman ini tidak tersedia atau dilindungi hak cipta. Silakan gunakan tampilan pindaian (scanned view) untuk membaca.
              </p>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 w-full">
                Beralih ke Tampilan Pindaian
              </Button>
            </div>
          </div>
        ) : (
          // Actual Reader Content
          <div
            className={`
              h-full w-full px-4 md:px-8 py-20 md:py-24 mx-auto ${readerWidthClass}
              ${currentTheme.text}
              ${readingMode === 'paginated' ? 'overflow-x-auto' : 'overflow-y-auto'}
            `}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              fontFamily: fontMap[fontFamily] || 'sans-serif',
              textAlign: textAlign
            }}
          >
            {readingMode === 'paginated' ? (
              // Paginated View (Columnar)
              <div
                className="h-full w-full"
                style={{
                  columnWidth: '100vw',
                  columnGap: '4rem',
                  height: '100%',
                  columnFill: 'auto',
                  width: '100%',
                  textAlign: textAlign
                }}
              >
                <div dangerouslySetInnerHTML={{
                  __html: (bionicReading ? applyBionicReading(pageText) : pageText)
                    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
                    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-4">$1</h2>')
                    .replace(/\n\n/g, '<br/><br/>')
                }} />
              </div>
            ) : (
              // Scroll View
              <div dangerouslySetInnerHTML={{
                __html: (bionicReading ? applyBionicReading(pageText) : pageText)
                  .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
                  .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-4">$1</h2>')
                  .replace(/\n\n/g, '<br/><br/>')
              }} />
            )}
          </div>
        )}
      </div>

      {/* Footer / Progress Controls */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${showControls ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <div
          className={`${currentTheme.ui} border-t px-4 py-4 shadow-lg`}
          style={{ backgroundColor: currentTheme.bgHex }}
        >
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(currentPage / (currentBook.pageCount || 1)) * 100}%` }}
              />
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={currentTheme.text}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Prev
              </Button>

              <span className={`text-sm font-medium ${currentTheme.text}`}>
                Page {currentPage} of {currentBook.pageCount || "?"}
              </span>

              <Button
                variant="ghost"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= (currentBook.pageCount || 9999)}
                className={currentTheme.text}
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ReaderSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export function ReaderScreen(props: ReaderScreenProps) {
  return (
      <ReaderScreenContent {...props} />
  );
}
