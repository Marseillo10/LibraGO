import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import {
  ArrowLeft,
  Settings,
  BookmarkPlus,
  Type,
  Sun,
  Moon,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../ui/sheet";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useBooks } from "../../context/BooksContext";

interface ReaderScreenProps {
  onBack: () => void;
  onNavigate?: (path: string) => void;
  userName: string;
  userEmail: string;
}

import { generateBookContent, getPageContent, type BookContent } from "../../utils/bookContent";
import { getBookPageContent } from "../../services/api";

export function ReaderScreen({ onBack, onNavigate, userName, userEmail }: ReaderScreenProps) {
  const { currentBook, updateBookProgress } = useBooks();
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("sepia");
  const [brightness, setBrightness] = useState(100);
  const [currentPage, setCurrentPage] = useState(currentBook?.currentPage || 1);

  // Book Content State
  const [bookContent, setBookContent] = useState<BookContent | null>(null);
  const [pageText, setPageText] = useState("");

  // Anti-Piracy
  const [deviceId] = useState(() => generateDeviceFingerprint());
  const [sessionId] = useState(() => generateSessionId());

  // Initialize content
  useEffect(() => {
    console.log("ReaderScreen currentBook:", currentBook);
    console.log("ReaderScreen iaId:", currentBook?.iaId);
    if (currentBook) {
      const content = generateBookContent(currentBook);
      setBookContent(content);

      // Set initial page from book progress if available
      const initialPage = currentBook.currentPage && currentBook.currentPage > 0
        ? currentBook.currentPage
        : 1;
      setCurrentPage(initialPage);
    }
  }, [currentBook?.id]);

  // Update page content
  useEffect(() => {
    const loadContent = async () => {
      if (currentBook?.iaId) {
        setPageText("Loading...");
        try {
          const text = await getBookPageContent(currentBook.iaId, currentPage);
          setPageText(text || "No text content available for this page.");
        } catch (error) {
          setPageText("Error loading page content.");
        }
      } else if (bookContent) {
        setPageText(getPageContent(bookContent, currentPage));
      }
      window.scrollTo(0, 0);
    };

    loadContent();
  }, [currentPage, bookContent, currentBook?.iaId]);

  // Update progress when page changes
  useEffect(() => {
    if (currentBook) {
      updateBookProgress(currentBook.id, currentPage);
    }
  }, [currentPage, currentBook?.id]);

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Enhanced watermark with anti-piracy
  const watermarkConfig: WatermarkConfig = {
    userName,
    userEmail,
    deviceId,
    timestamp: new Date().toLocaleString(),
    bookId: currentBook.id,
    sessionId,
  };

  const watermark = createWatermark(watermarkConfig);

  // Initialize anti-piracy protection
  useEffect(() => {
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

    toast.success("Content Protection Active", {
      description: "Reading session secured",
      duration: 2000,
    });

    return cleanup;
  }, [userName, userEmail, deviceId, sessionId]);

  const themes = {
    light: { bg: "bg-white", text: "text-slate-900" },
    dark: { bg: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", text: "text-slate-100" },
    sepia: { bg: "bg-amber-50", text: "text-slate-900" },
  };

  const currentTheme = themes[theme as keyof typeof themes];

  return (
    <div
      className={`min-h-screen ${currentTheme.bg} transition-colors`}
      style={{
        filter: `brightness(${brightness}%)`,
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Halaman {currentPage} dari {currentBook.pageCount || "Unknown"}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <BookmarkPlus className="w-5 h-5" />
            </Button>

            {/* Reader Settings */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Pengaturan Pembaca</SheetTitle>
                  <SheetDescription>
                    Sesuaikan ukuran font, tema, dan kecerahan untuk pengalaman membaca yang lebih nyaman
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                  {/* Font Size */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Ukuran Font
                      </Label>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {fontSize}px
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value: number[]) => setFontSize(value[0])}
                        min={12}
                        max={24}
                        step={2}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <Label className="mb-3 block">Tema</Label>
                    <RadioGroup value={theme} onValueChange={setTheme}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Sun className="w-4 h-4" />
                          Terang
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Moon className="w-4 h-4" />
                          Gelap
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="sepia" id="sepia" />
                        <Label htmlFor="sepia" className="flex items-center gap-2 cursor-pointer flex-1">
                          <div className="w-4 h-4 rounded-full bg-amber-100" />
                          Sepia
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Kecerahan</Label>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {brightness}%
                      </span>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={(value: number[]) => setBrightness(value[0])}
                      min={50}
                      max={150}
                      step={10}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${(currentPage / (currentBook.pageCount || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Content with Watermark */}
      <div className="relative px-6 py-12 lg:px-12 max-w-4xl mx-auto">
        {/* Dynamic Watermark - Anti-Piracy */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 200px,
              currentColor 200px,
              currentColor 201px
            )`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="transform rotate-[-45deg] text-center select-none"
              style={{ fontSize: "24px", lineHeight: "3" }}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className={currentTheme.text}>
                  {watermark}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Book Content */}
        <div
          className={`${currentTheme.text} relative z-10 leading-relaxed`}
          style={{ fontSize: `${fontSize}px` }}
        >
          <div dangerouslySetInnerHTML={{
            __html: pageText
              .replace(/^# (.*$)/gm, '<h1>$1</h1>')
              .replace(/^## (.*$)/gm, '<h2>$1</h2>')
              .replace(/^### (.*$)/gm, '<h3>$1</h3>')
              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>')
              .replace(/\n\n/g, '<br/><br/>')
          }} />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Halaman Sebelumnya
          </Button>
          <span className={`${currentTheme.text} text-sm`}>
            {currentPage} / {currentBook.pageCount || "?"}
          </span>
          <Button
            onClick={() => setCurrentPage(Math.min(currentBook.pageCount || 9999, currentPage + 1))}
            disabled={currentPage === (currentBook.pageCount || 9999)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Halaman Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
