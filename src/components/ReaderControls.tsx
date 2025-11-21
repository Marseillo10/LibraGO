import { useState } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { 
  Type, 
  Sun, 
  Moon, 
  Bookmark, 
  Palette,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Minus,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReaderControlsProps {
  isVisible: boolean;
  onClose: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
  theme: 'light' | 'dark' | 'sepia';
  onThemeChange: (theme: 'light' | 'dark' | 'sepia') => void;
  onBookmark: () => void;
  progress: number;
  onProgressChange: (value: number) => void;
  currentPage: number;
  totalPages: number;
}

export function ReaderControls({
  isVisible,
  onClose,
  fontSize,
  onFontSizeChange,
  brightness,
  onBrightnessChange,
  theme,
  onThemeChange,
  onBookmark,
  progress,
  onProgressChange,
  currentPage,
  totalPages,
}: ReaderControlsProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'display' | 'progress'>('text');

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Controls Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl z-50 max-w-2xl mx-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'text'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Type className="w-5 h-5 mx-auto mb-1" />
                Teks
              </button>
              <button
                onClick={() => setActiveTab('display')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'display'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Palette className="w-5 h-5 mx-auto mb-1" />
                Tampilan
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'progress'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Bookmark className="w-5 h-5 mx-auto mb-1" />
                Progress
              </button>
            </div>

            {/* Content */}
            <div className="p-6 pb-8 space-y-6">
              {/* Text Tab */}
              {activeTab === 'text' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Font Size */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ukuran Font
                      </label>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {fontSize}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
                        className="shrink-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Slider
                        value={[fontSize]}
                        onValueChange={([value]) => onFontSizeChange(value)}
                        min={12}
                        max={32}
                        step={2}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onFontSizeChange(Math.min(32, fontSize + 2))}
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p 
                      className="text-gray-900 dark:text-gray-100 leading-relaxed"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      "Membaca adalah jendela dunia. Dengan membaca, kita bisa menjelajah ke mana saja tanpa batasan."
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Display Tab */}
              {activeTab === 'display' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Theme Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Tema Baca
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => onThemeChange('light')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'light'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                        <div className="text-sm font-medium">Terang</div>
                      </button>
                      <button
                        onClick={() => onThemeChange('dark')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Moon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <div className="text-sm font-medium">Gelap</div>
                      </button>
                      <button
                        onClick={() => onThemeChange('sepia')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'sepia'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Bookmark className="w-6 h-6 mx-auto mb-2 text-amber-700" />
                        <div className="text-sm font-medium">Sepia</div>
                      </button>
                    </div>
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kecerahan
                      </label>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(brightness * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sun className="w-4 h-4 text-gray-400 shrink-0" />
                      <Slider
                        value={[brightness]}
                        onValueChange={([value]) => onBrightnessChange(value)}
                        min={0.3}
                        max={1}
                        step={0.1}
                        className="flex-1"
                      />
                      <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Page Info */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {currentPage} / {totalPages}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Halaman • {Math.round(progress)}% selesai
                    </div>
                  </div>

                  {/* Progress Slider */}
                  <div>
                    <Slider
                      value={[progress]}
                      onValueChange={([value]) => onProgressChange(value)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Awal</span>
                      <span>Akhir</span>
                    </div>
                  </div>

                  {/* Bookmark Button */}
                  <Button
                    onClick={onBookmark}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Bookmark className="w-5 h-5 mr-2" />
                    Tandai Halaman Ini
                  </Button>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {totalPages - currentPage}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Halaman tersisa
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        ~{Math.ceil((totalPages - currentPage) / 30)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Sesi membaca
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
