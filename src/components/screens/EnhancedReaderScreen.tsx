import { useState, useRef, useEffect } from "react";
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
  Type,
  Sun,
  Highlighter,
  MessageSquare,
  Volume2,
  Search,
  Languages,
  Eye,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  BookOpen,
  List,
  Bookmark,
  Share2,
  MoreVertical,
  Palette,
  Loader2,
  Check,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { useBooks } from "../../context/BooksContext";
import { generateBookContent, BookContent, getPageContent } from "../../utils/bookContent";
import { getBookPageContent } from "../../services/api";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ShareQuoteDialog } from "../dialogs/ShareQuoteDialog";
import { OpenLibraryReader } from "./OpenLibraryReader";

interface ReaderScreenProps {
  onBack: () => void;
  onNavigate?: (path: string) => void;
  userName: string;
  userEmail: string;
  darkMode?: boolean;
}

interface Highlight {
  id: string;
  text: string;
  color: string;
  note?: string;
  page: number;
}

interface Bookmark {
  id: string;
  page: number;
  label: string;
  color: string;
}

interface Annotation {
  id: string;
  text: string;
  page: number;
  position: number;
}

export function EnhancedReaderScreen({ onBack, onNavigate, userName, userEmail, darkMode = false }: ReaderScreenProps) {
  const { currentBook, updateBookProgress } = useBooks();
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [theme, setTheme] = useState(darkMode ? "dark" : "light");
  const [brightness, setBrightness] = useState(100);

  // Initialize page from book, default to 1
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedText, setSelectedText] = useState("");
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState("");
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [readingMode, setReadingMode] = useState<"scroll" | "page">("page");
  const [pageView, setPageView] = useState<"single" | "double">("single");
  const [fontFamily, setFontFamily] = useState("inter");
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [shareQuoteOpen, setShareQuoteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"text" | "scan">("text");
  const [isTextAvailable, setIsTextAvailable] = useState(true);

  // Book Content State
  const [bookContent, setBookContent] = useState<BookContent | null>(null);
  const [pageText, setPageText] = useState("");

  // Anti-Piracy State
  const [deviceId] = useState(() => generateDeviceFingerprint());
  const [sessionId] = useState(() => generateSessionId());
  const [protectionEnabled, setProtectionEnabled] = useState(true);

  const [highlights, setHighlights] = useState<Highlight[]>([
    { id: "1", text: "Computational processes are abstract beings", color: "yellow", page: 1 },
  ]);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // Initialize content and page when book loads
  useEffect(() => {
    if (currentBook) {
      const content = generateBookContent(currentBook);
      setBookContent(content);

      // Ensure pageCount is valid
      if (!currentBook.pageCount || currentBook.pageCount < 1) {
        // If pageCount is missing/invalid, we can't really paginate properly.
        // But we should avoid NaN.
      }

      const initialPage = currentBook.currentPage && currentBook.currentPage > 0 && !isNaN(currentBook.currentPage)
        ? currentBook.currentPage
        : 1;
      setCurrentPage(initialPage);
    }
  }, [currentBook?.id]);

  // Update page content when page or book content changes
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
      window.scrollTo(0, 0);
    };

    loadContent();
  }, [currentPage, bookContent, currentBook?.iaId, viewMode]);

  // Update progress when page changes
  useEffect(() => {
    if (currentBook) {
      updateBookProgress(currentBook.id, currentPage);
    }
  }, [currentPage, currentBook?.id]);

  // Enhanced watermark with anti-piracy
  const watermarkConfig: WatermarkConfig = {
    userName,
    userEmail,
    deviceId,
    timestamp: new Date().toLocaleString(),
    bookId: currentBook?.id || "",
    sessionId,
  };

  const watermark = createWatermark(watermarkConfig);

  // Initialize anti-piracy protection
  useEffect(() => {
    if (!protectionEnabled || !currentBook) return;

    const userSession: UserSession = {
      userId: userEmail,
      userName,
      userEmail,
      deviceId,
      sessionId,
      timestamp: Date.now(),
      isPremium: true,
    };

    const cleanup = initAntiPiracy(userSession);
    return cleanup;
  }, [protectionEnabled, userName, userEmail, deviceId, sessionId, currentBook]);




  const themes = {
    light: { bg: "bg-white", text: "text-gray-900", name: "Light" },
    dark: { bg: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900", text: "text-gray-50", name: "Dark" },
    sepia: { bg: "bg-amber-50", text: "text-gray-900", name: "Sepia" },
    night: { bg: "bg-gray-950", text: "text-gray-300", name: "Night" },
    eink: { bg: "bg-gray-100", text: "text-black", name: "E-Ink" },
  };

  const currentTheme = themes[theme as keyof typeof themes];

  const highlightColors = [
    { name: "Yellow", value: "yellow", class: "bg-yellow-200 dark:bg-yellow-900/40" },
    { name: "Blue", value: "blue", class: "bg-blue-200 dark:bg-blue-900/40" },
    { name: "Green", value: "green", class: "bg-green-200 dark:bg-green-900/40" },
    { name: "Pink", value: "pink", class: "bg-pink-200 dark:bg-pink-900/40" },
    { name: "Purple", value: "purple", class: "bg-purple-200 dark:bg-purple-900/40" },
  ];

  const fonts = [
    { name: "Inter", value: "inter" },
    { name: "Georgia", value: "georgia" },
    { name: "Times New Roman", value: "times" },
    { name: "Arial", value: "arial" },
    { name: "Verdana", value: "verdana" },
    { name: "Open Dyslexic", value: "opendyslexic" },
  ];

  const handleFinishBook = () => {
    if (currentBook) {
      updateBookProgress(currentBook.id, 100);

      // Trigger confetti animation
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981']
      });

      toast.success("Congratulations! You've finished the book.", {
        description: "This book has been marked as completed.",
      });

      // Delay navigation slightly to let user see the confetti
      setTimeout(() => {
        if (onNavigate) {
          onNavigate("collection");
        } else {
          onBack();
        }
      }, 2000);
    }
  };

  const handleHighlight = (color: string) => {
    if (selectedText) {
      const newHighlight: Highlight = {
        id: Date.now().toString(),
        text: selectedText,
        color,
        page: currentPage,
      };
      setHighlights([...highlights, newHighlight]);
      toast.success("Text highlighted");
      setShowHighlightMenu(false);
      setSelectedText("");
    }
  };

  const handleAddAnnotation = (note: string) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      text: note,
      page: currentPage,
      position: 0,
    };
    setAnnotations([...annotations, newAnnotation]);
    toast.success("Annotation added");
    setShowAnnotationDialog(false);
  };

  const handleAddBookmark = () => {
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      page: currentPage,
      label: `Page ${currentPage}`,
      color: "blue",
    };
    setBookmarks([...bookmarks, newBookmark]);
    toast.success("Bookmark added");
  };

  const toggleTTS = () => {
    setTtsPlaying(!ttsPlaying);
    if (!ttsPlaying) {
      const utterance = new SpeechSynthesisUtterance(pageText);
      utterance.rate = ttsSpeed;
      window.speechSynthesis.speak(utterance);
      toast.success("TTS Playing");

      utterance.onend = () => setTtsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      toast.success("TTS Paused");
    }
  };

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const lookupWord = (word: string) => {
    setDictionaryWord(word);
    setShowDictionary(true);
  };

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <p className="text-gray-500">Memuat buku...</p>
        <Button variant="outline" onClick={onBack}>
          Kembali ke Pustaka
        </Button>
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Hide in immersive mode */}
      {!immersiveMode && (
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="hidden md:block">
                <h1 className="text-sm font-semibold text-gray-900 dark:text-white max-w-[200px] truncate">
                  {currentBook.title}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {currentBook.pageCount} · {Math.round((currentPage / currentBook.pageCount) * 100)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              {/* TTS Controls */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTTS}
                className={ttsPlaying ? "text-blue-600" : ""}
                aria-label={ttsPlaying ? "Pause Text-to-Speech" : "Start Text-to-Speech"}
              >
                {ttsPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              {/* Bookmarks */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="View Bookmarks">
                    <Bookmark className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Bookmarks</SheetTitle>
                    <SheetDescription>
                      Lihat dan kelola semua bookmark yang telah Anda simpan
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                    <div className="space-y-2">
                      {bookmarks.map((bookmark) => (
                        <Card
                          key={bookmark.id}
                          className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setCurrentPage(bookmark.page)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {bookmark.label}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Page {bookmark.page}
                              </p>
                            </div>
                            <Badge variant="outline">{bookmark.color}</Badge>
                          </div>
                        </Card>
                      ))}
                      {bookmarks.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Belum ada bookmark
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* Table of Contents */}
              <Sheet open={showTableOfContents} onOpenChange={setShowTableOfContents}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Table of Contents"
                  >
                    <List className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Daftar Isi</SheetTitle>
                    <SheetDescription>
                      Navigasi cepat ke bab atau bagian tertentu
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                    <div className="space-y-1">
                      {bookContent?.chapters.map((chapter, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => {
                            setCurrentPage(chapter.pageStart);
                            setShowTableOfContents(false);
                          }}
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {chapter.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              Halaman {chapter.pageStart}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="More Options">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleAddBookmark}>
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    Add Bookmark
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Progress
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setImmersiveMode(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Immersive Mode
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Reader Settings */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Reader Settings">
                    <Settings className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Reader Settings</SheetTitle>
                    <SheetDescription>
                      Kustomisasi tampilan, tata letak, dan anotasi untuk pengalaman membaca optimal
                    </SheetDescription>
                  </SheetHeader>

                  <Tabs defaultValue="display" className="mt-6">
                    <div className="overflow-x-auto scrollbar-hide">
                      <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-3">
                        <TabsTrigger value="display" className="flex-shrink-0">Display</TabsTrigger>
                        <TabsTrigger value="reading" className="flex-shrink-0">Reading</TabsTrigger>
                        <TabsTrigger value="notes" className="flex-shrink-0">Notes</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="display" className="space-y-6 mt-4">
                      {/* Theme */}
                      <div>
                        <Label className="flex items-center gap-2 mb-3">
                          <Palette className="w-4 h-4" />
                          Theme
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(themes).map(([key, value]) => (
                            <Button
                              key={key}
                              variant={theme === key ? "default" : "outline"}
                              size="sm"
                              onClick={() => setTheme(key)}
                              className="w-full"
                            >
                              {value.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Font Family */}
                      <div>
                        <Label>Font Family</Label>
                        <Select value={fontFamily} onValueChange={setFontFamily}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fonts.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Font Size */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            Font Size
                          </Label>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {fontSize}px
                          </span>
                        </div>
                        <Slider
                          value={[fontSize]}
                          onValueChange={(value: number[]) => setFontSize(value[0])}
                          min={12}
                          max={32}
                          step={1}
                        />
                      </div>

                      {/* Line Height */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label>Line Height</Label>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {lineHeight.toFixed(1)}
                          </span>
                        </div>
                        <Slider
                          value={[lineHeight]}
                          onValueChange={(value: number[]) => setLineHeight(value[0])}
                          min={1.2}
                          max={2.5}
                          step={0.1}
                        />
                      </div>

                      {/* Brightness */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            Brightness
                          </Label>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {brightness}%
                          </span>
                        </div>
                        <Slider
                          value={[brightness]}
                          onValueChange={(value: number[]) => setBrightness(value[0])}
                          min={50}
                          max={150}
                          step={5}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="reading" className="space-y-6 mt-4">
                      {/* Reading Mode */}
                      <div>
                        <Label className="mb-3 block">Reading Mode</Label>
                        <RadioGroup value={readingMode} onValueChange={(v: string) => setReadingMode(v as "scroll" | "page")}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="scroll" id="scroll" />
                            <Label htmlFor="scroll">Scroll</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="page" id="page" />
                            <Label htmlFor="page">Paginated</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* TTS Speed */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label>TTS Speed</Label>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {ttsSpeed.toFixed(1)}x
                          </span>
                        </div>
                        <Slider
                          value={[ttsSpeed]}
                          onValueChange={(value: number[]) => setTtsSpeed(value[0])}
                          min={0.5}
                          max={2.0}
                          step={0.1}
                        />
                      </div>

                      {/* Anti-Piracy Protection */}
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Content Protection</Label>
                          <p className="text-xs text-gray-500 mt-1">
                            Prevent unauthorized distribution
                          </p>
                        </div>
                        <Switch
                          checked={protectionEnabled}
                          onCheckedChange={setProtectionEnabled}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="space-y-4 mt-4">
                      {/* Highlights */}
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-white mb-3">
                          Highlights ({highlights.length})
                        </h4>
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {highlights.map((highlight) => (
                              <Card key={highlight.id} className="p-3">
                                <div className={`p-2 rounded ${highlightColors.find(c => c.value === highlight.color)?.class}`}>
                                  <p className="text-sm">{highlight.text}</p>
                                </div>
                                {highlight.note && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                    Note: {highlight.note}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Page {highlight.page}</p>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>
                  </Tabs>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      )}

      {/* Reading Area */}
      <div
        className={`flex-1 ${currentTheme.bg} ${currentTheme.text} transition-all relative overflow-y-auto`}
        style={{ filter: `brightness(${brightness}%)` }}
        onClick={() => immersiveMode && setImmersiveMode(false)}
      >
        {/* Multi-layer Watermark Overlay */}
        {protectionEnabled && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Diagonal watermarks */}
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute whitespace-nowrap text-[10px] opacity-[0.03] dark:opacity-[0.05] select-none"
                style={{
                  transform: `rotate(-45deg)`,
                  top: `${(i * 8) % 100}%`,
                  left: `${(i * 12) % 100}%`,
                  color: theme === 'dark' ? '#fff' : '#000',
                }}
              >
                {watermark}
              </div>
            ))}

            {/* Corner watermarks */}
            <div className="absolute top-4 left-4 text-[8px] opacity-5 select-none">
              {userName} • {deviceId.slice(0, 8)}
            </div>
            <div className="absolute top-4 right-4 text-[8px] opacity-5 select-none">
              Session: {sessionId.slice(0, 12)}
            </div>
            <div className="absolute bottom-4 left-4 text-[8px] opacity-5 select-none">
              {new Date().toLocaleString()}
            </div>
            <div className="absolute bottom-4 right-4 text-[8px] opacity-5 select-none">
              LibraGO © Protected Content
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-6 py-8 md:py-12 relative z-10 min-h-[calc(100vh-140px)]">
          {/* Dynamic Watermark Header */}
          <div className="opacity-10 text-xs text-gray-500 mb-8 select-none text-center">
            {watermark}
          </div>

          <div
            className={`prose prose-lg max-w-none ${currentTheme.text} ${protectionEnabled ? 'anti-piracy-protected' : ''
              }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              fontFamily: fontFamily === "inter" ? "Inter" : fontFamily,
            }}
            onMouseUp={() => {
              if (!protectionEnabled) {
                const selection = window.getSelection();
                const text = selection?.toString().trim();
                if (text && text.length > 0) {
                  setSelectedText(text);
                  setShowHighlightMenu(true);
                }
              }
            }}
          >
            {/* Render Structured Content */}
            {!isTextAvailable ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Mode Teks Tidak Tersedia
                </h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Maaf, teks digital untuk halaman ini tidak tersedia atau dilindungi hak cipta.
                  Silakan gunakan tampilan pindaian (scanned view) untuk membaca.
                </p>
                <Button onClick={() => setViewMode("scan")}>
                  Beralih ke Tampilan Pindaian
                </Button>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{
                __html: pageText
                  .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                  .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                  .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>')
                  .replace(/\n\n/g, '<br/><br/>')
              }} />
            )}
          </div>

          {/* Page Number at bottom */}
          <div className="text-center mt-12 text-sm text-gray-500">
            Page {currentPage}
            <div className="text-xs text-gray-300 mt-1">Debug: IA ID = {currentBook.iaId}</div>
          </div>

          {/* Protection Status Indicator */}
          {protectionEnabled && (
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-xs opacity-40">
                🔒 Content Protected
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls - Bottom */}
      {!immersiveMode && (
        <div className="sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>

            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Page {currentPage}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round((currentPage / currentBook.pageCount) * 100)}% Completed
              </span>
            </div>

            {currentBook && currentPage >= currentBook.pageCount ? (
              <Button
                onClick={handleFinishBook}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Finish Book
                <Check className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  const nextPage = Math.min(currentBook?.pageCount || 1, currentPage + 1);
                  setCurrentPage(nextPage);
                }}
                disabled={!currentBook || currentPage >= currentBook.pageCount}
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Highlight Menu Popup */}
      {showHighlightMenu && selectedText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setShowHighlightMenu(false)}>
          <Card className="p-4" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                "{selectedText}"
              </p>
              <Separator />
              <div className="flex gap-2">
                {highlightColors.map((color) => (
                  <Button
                    key={color.value}
                    size="sm"
                    className={color.class}
                    onClick={() => handleHighlight(color.value)}
                  >
                    <Highlighter className="w-4 h-4" />
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowAnnotationDialog(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Note
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => lookupWord(selectedText)}>
                  <Search className="w-4 h-4 mr-2" />
                  Define
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


