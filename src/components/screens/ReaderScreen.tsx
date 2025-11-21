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
import { toast } from "sonner@2.0.3";
import {
  ArrowLeft,
  Settings,
  BookmarkPlus,
  Type,
  Sun,
  Moon,
  Minus,
  Plus,
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

interface ReaderScreenProps {
  onBack: () => void;
  userName: string;
  userEmail: string;
}

export function ReaderScreen({ onBack, userName, userEmail }: ReaderScreenProps) {
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("sepia");
  const [brightness, setBrightness] = useState(100);
  const [currentPage, setCurrentPage] = useState(234);
  
  // Anti-Piracy
  const [deviceId] = useState(() => generateDeviceFingerprint());
  const [sessionId] = useState(() => generateSessionId());

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
    light: { bg: "bg-white", text: "text-gray-900" },
    dark: { bg: "bg-gray-900", text: "text-gray-100" },
    sepia: { bg: "bg-amber-50", text: "text-gray-900" },
  };

  const currentTheme = themes[theme as keyof typeof themes];

  const bookContent = `Chapter 1: Building Abstractions with Procedures

The acts of the mind, wherein it exerts its power over simple ideas, are chiefly these three: 1. Combining several simple ideas into one compound one, and thus all complex ideas are made. 2. The second is bringing two ideas, whether simple or complex, together, and setting them by one another so as to take a view of them at once, without uniting them into one, by which it gets all its ideas of relations. 3. The third is separating them from all other ideas that accompany them in their real existence: this is called abstraction, and thus all its general ideas are made.

We are about to study the idea of a computational process. Computational processes are abstract beings that inhabit computers. As they evolve, processes manipulate other abstract things called data. The evolution of a process is directed by a pattern of rules called a program. People create programs to direct processes.

A computational process is indeed much like a sorcerer's idea of a spirit. It cannot be seen or touched. It is not composed of matter at all. However, it is very real. It can perform intellectual work. It can answer questions. It can affect the world by disbursing money at a bank or by controlling a robot arm in a factory.`;

  return (
    <div
      className={`min-h-screen ${currentTheme.bg} transition-colors`}
      style={{
        filter: `brightness(${brightness}%)`,
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Halaman {currentPage} dari 350</p>
            </div>
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">
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
                        onValueChange={(value) => setFontSize(value[0])}
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
                      onValueChange={(value) => setBrightness(value[0])}
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
            style={{ width: `${(currentPage / 350) * 100}%` }}
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
          <div className="whitespace-pre-line">{bookContent}</div>
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
            {currentPage} / 350
          </span>
          <Button
            onClick={() => setCurrentPage(Math.min(350, currentPage + 1))}
            disabled={currentPage === 350}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Halaman Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
