import { useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Mic, MicOff, AlertCircle, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useVoiceSearch } from "../hooks/useVoiceSearch";

interface VoiceSearchProps {
  onResult: (text: string) => void;
  onClose: () => void;
}

export function VoiceSearch({ onResult, onClose }: VoiceSearchProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    isSupported,
    reset
  } = useVoiceSearch();

  // Auto-start listening on mount
  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [startListening, stopListening]);

  // Handle final result
  // We'll use a manual trigger or a silence timeout in a real app, 
  // but for now let's let the user click "Stop" or "Search" to confirm, 
  // OR we can auto-submit if silence is detected (complex).
  // Simple approach: User speaks, sees text, clicks "Search" or we auto-submit on stop?
  // Let's auto-submit on stop if there is text.

  // Actually, the hook's `stopListening` just stops the engine. 
  // We might want to trigger `onResult` when the user explicitly says they are done 
  // or when we detect they stopped.
  // For this UI, let's have a "Done" button or just use the transcript.

  // Let's watch for isListening changing from true to false with a transcript?
  // Or just let the user click the microphone to stop and submit.

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        onResult(transcript);
      }
    } else {
      startListening();
    }
  };

  // If browser not supported
  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Card className="w-full max-w-md mx-4 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Browser Not Supported</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your browser does not support voice search. Please use Chrome, Edge, or Safari.
          </p>
          <Button onClick={onClose} className="w-full">Close</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 p-8 text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        {/* Animated Microphone */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{
              scale: isListening ? [1, 1.2, 1] : 1,
              boxShadow: isListening
                ? "0 0 20px 5px rgba(59, 130, 246, 0.5)"
                : "0 0 0px 0px rgba(0,0,0,0)"
            }}
            transition={{
              duration: 1.5,
              repeat: isListening ? Infinity : 0,
            }}
            className={`p-6 rounded-full transition-colors duration-300 ${isListening
              ? "bg-red-500"
              : "bg-blue-600"
              }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </motion.div>
        </div>

        {/* Status */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {error ? "Error" : isListening ? "Listening..." : "Microphone Off"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 min-h-[24px]">
          {error
            ? "Could not access microphone. Check permissions."
            : isListening
              ? "Speak now..."
              : "Tap to resume"}
        </p>

        {/* Transcript Display */}
        <div className="relative bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 min-h-[100px] flex items-center justify-center border border-gray-100 dark:border-gray-700">
          {transcript && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                reset();
                startListening();
              }}
              className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <p className="text-lg text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
            {transcript || interimTranscript || (
              <span className="text-gray-400 dark:text-gray-600 italic">
                {error ? "Permission denied" : "Your words will appear here..."}
              </span>
            )}
          </p>
        </div>

        {/* Waveform Animation (Visual Flair) */}
        {isListening && !error && (
          <div className="flex items-center justify-center gap-1.5 mb-8 h-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-blue-500 rounded-full"
                animate={{
                  height: ["20%", "100%", "20%"],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleToggle}
            className={`flex-1 h-12 text-base gap-2 ${isListening
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            disabled={!!error}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop & Search
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
