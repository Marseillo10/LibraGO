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
  Columns,
  Book,
  Palette,
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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { toast } from "sonner@2.0.3";

interface ReaderScreenProps {
  onBack: () => void;
  userName: string;
  userEmail: string;
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

export function EnhancedReaderScreen({ onBack, userName, userEmail }: ReaderScreenProps) {
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [theme, setTheme] = useState("sepia");
  const [brightness, setBrightness] = useState(100);
  const [currentPage, setCurrentPage] = useState(234);
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
  
  // Anti-Piracy State
  const [deviceId] = useState(() => generateDeviceFingerprint());
  const [sessionId] = useState(() => generateSessionId());
  const [protectionEnabled, setProtectionEnabled] = useState(true);
  
  const [highlights, setHighlights] = useState<Highlight[]>([
    { id: "1", text: "Computational processes are abstract beings", color: "yellow", page: 234 },
    { id: "2", text: "People create programs to direct processes", color: "blue", note: "Important concept", page: 234 },
  ]);
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    { id: "1", page: 10, label: "Introduction", color: "red" },
    { id: "2", page: 45, label: "Chapter 2 Start", color: "blue" },
    { id: "3", page: 234, label: "Current Position", color: "green" },
  ]);
  
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: "1", text: "This explains the fundamental concept well", page: 234, position: 100 },
  ]);

  // Enhanced watermark with anti-piracy
  const watermarkConfig: WatermarkConfig = {
    userName,
    userEmail,
    deviceId,
    timestamp: new Date().toLocaleString(),
    bookId: "book_sicp_001",
    sessionId,
  };
  
  const watermark = createWatermark(watermarkConfig);
  
  // Initialize anti-piracy protection
  useEffect(() => {
    if (!protectionEnabled) return;
    
    const userSession: UserSession = {
      userId: userEmail,
      userName,
      userEmail,
      deviceId,
      sessionId,
      timestamp: Date.now(),
      isPremium: true,
    };
    
    // Initialize all anti-piracy measures
    const cleanup = initAntiPiracy(userSession);
    
    // Show protection active toast
    toast.success("Content Protection Active", {
      description: "This content is protected against unauthorized distribution",
      duration: 3000,
    });
    
    return cleanup;
  }, [protectionEnabled, userName, userEmail, deviceId, sessionId]);

  const themes = {
    light: { bg: "bg-white", text: "text-gray-900", name: "Light" },
    dark: { bg: "bg-gray-900", text: "text-gray-100", name: "Dark" },
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

  const tableOfContents = [
    { id: "1", title: "Chapter 1: Building Abstractions", page: 1 },
    { id: "2", title: "1.1 The Elements of Programming", page: 10 },
    { id: "3", title: "1.2 Procedures and Processes", page: 45 },
    { id: "4", title: "Chapter 2: Building Data Abstractions", page: 100 },
    { id: "5", title: "2.1 Introduction to Data", page: 110 },
  ];

  const bookContent = `Chapter 1: Building Abstractions with Procedures

The acts of the mind, wherein it exerts its power over simple ideas, are chiefly these three: 1. Combining several simple ideas into one compound one, and thus all complex ideas are made. 2. The second is bringing two ideas, whether simple or complex, together, and setting them by one another so as to take a view of them at once, without uniting them into one, by which it gets all its ideas of relations. 3. The third is separating them from all other ideas that accompany them in their real existence: this is called abstraction, and thus all its general ideas are made.

We are about to study the idea of a computational process. Computational processes are abstract beings that inhabit computers. As they evolve, processes manipulate other abstract things called data. The evolution of a process is directed by a pattern of rules called a program. People create programs to direct processes.

A computational process is indeed much like a sorcerer's idea of a spirit. It cannot be seen or touched. It is not composed of matter at all. However, it is very real. It can perform intellectual work. It can answer questions. It can affect the world by disbursing money at a bank or by controlling a robot arm in a factory.`;

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
    toast.success(ttsPlaying ? "TTS Paused" : "TTS Playing");
  };

  const lookupWord = (word: string) => {
    setDictionaryWord(word);
    setShowDictionary(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Hide in immersive mode */}
      {!immersiveMode && (
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of 350 · {Math.round((currentPage / 350) * 100)}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* TTS Controls */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTTS}
                className={ttsPlaying ? "text-blue-600" : ""}
              >
                {ttsPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              {/* Bookmarks */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
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
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* Table of Contents */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTableOfContents(true)}
              >
                <List className="w-5 h-5" />
              </Button>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
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
                  <Button variant="ghost" size="icon">
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
                          onValueChange={(value) => setFontSize(value[0])}
                          min={12}
                          max={28}
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
                          onValueChange={(value) => setLineHeight(value[0])}
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
                          onValueChange={(value) => setBrightness(value[0])}
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
                        <RadioGroup value={readingMode} onValueChange={(v) => setReadingMode(v as any)}>
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

                      {/* Page View */}
                      <div>
                        <Label className="mb-3 block">Page View</Label>
                        <RadioGroup value={pageView} onValueChange={(v) => setPageView(v as any)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single" id="single" />
                            <Label htmlFor="single">Single Page</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="double" id="double" />
                            <Label htmlFor="double">Double Page (Tablet)</Label>
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
                          onValueChange={(value) => setTtsSpeed(value[0])}
                          min={0.5}
                          max={2.0}
                          step={0.1}
                        />
                      </div>

                      {/* Auto Bookmark */}
                      <div className="flex items-center justify-between">
                        <Label>Auto Bookmark</Label>
                        <Switch defaultChecked />
                      </div>

                      {/* Blue Light Filter */}
                      <div className="flex items-center justify-between">
                        <Label>Blue Light Filter</Label>
                        <Switch />
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

                      {/* Annotations */}
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-white mb-3">
                          Annotations ({annotations.length})
                        </h4>
                        <ScrollArea className="h-32">
                          <div className="space-y-2">
                            {annotations.map((annotation) => (
                              <Card key={annotation.id} className="p-3">
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {annotation.text}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Page {annotation.page}</p>
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
        className={`flex-1 ${currentTheme.bg} ${currentTheme.text} transition-all relative`}
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
        
        <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
          {/* Dynamic Watermark Header */}
          <div className="opacity-10 text-xs text-gray-500 mb-8 select-none">
            {watermark}
          </div>

          <div
            className={`prose prose-lg max-w-none ${currentTheme.text} ${
              protectionEnabled ? 'anti-piracy-protected' : ''
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
            {bookContent.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6">{paragraph}</p>
            ))}
          </div>

          {/* Page Number at bottom */}
          <div className="text-center mt-12 text-sm text-gray-500">
            {currentPage}
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

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((currentPage / 350) * 100)}%
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(350, currentPage + 1))}
              disabled={currentPage === 350}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Highlight Menu Popup */}
      {showHighlightMenu && selectedText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setShowHighlightMenu(false)}>
          <Card className="p-4" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
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
                <Button size="sm" variant="outline" className="flex-1">
                  <Languages className="w-4 h-4 mr-2" />
                  Translate
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Table of Contents Dialog */}
      <Dialog open={showTableOfContents} onOpenChange={setShowTableOfContents}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table of Contents</DialogTitle>
            <DialogDescription>
              Navigasi cepat ke bagian tertentu dalam buku
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {tableOfContents.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setCurrentPage(item.page);
                    setShowTableOfContents(false);
                  }}
                >
                  <span className="flex-1 text-left">{item.title}</span>
                  <span className="text-sm text-gray-500">p.{item.page}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dictionary Dialog */}
      <Dialog open={showDictionary} onOpenChange={setShowDictionary}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dictionary: {dictionaryWord}</DialogTitle>
            <DialogDescription>
              Definisi dan arti kata yang dipilih
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm mb-2">Definition</h4>
              <p className="text-gray-600 dark:text-gray-400">
                [Dictionary definition would be fetched from API]
              </p>
            </div>
            <div>
              <h4 className="text-sm mb-2">Examples</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                <li>Example usage 1</li>
                <li>Example usage 2</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Annotation Dialog */}
      <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Annotation</DialogTitle>
            <DialogDescription>
              Tambahkan catatan atau komentar untuk teks yang dipilih
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selected Text</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                {selectedText}
              </p>
            </div>
            <div>
              <Label>Your Note</Label>
              <Textarea
                placeholder="Add your thoughts..."
                className="mt-2"
                rows={4}
                id="annotation-text"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                const textarea = document.getElementById("annotation-text") as HTMLTextAreaElement;
                handleAddAnnotation(textarea.value);
                textarea.value = "";
              }}
            >
              Save Annotation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
