import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { motion } from "motion/react";

interface VoiceSearchProps {
  onResult: (text: string) => void;
  onClose: () => void;
}

export function VoiceSearch({ onResult, onClose }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  useEffect(() => {
    // Simulate voice recognition
    if (isListening) {
      const timer = setTimeout(() => {
        const mockResults = [
          "Clean Code by Robert Martin",
          "Design Patterns",
          "The Pragmatic Programmer",
          "Refactoring by Martin Fowler",
        ];
        const result = mockResults[Math.floor(Math.random() * mockResults.length)];
        setTranscript(result);
        setIsListening(false);
        onResult(result);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isListening, onResult]);

  const startListening = () => {
    setIsListening(true);
    setTranscript("");
    setInterimTranscript("Listening...");
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 p-8 text-center">
        {/* Animated Microphone */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{
              scale: isListening ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isListening ? Infinity : 0,
            }}
            className={`p-6 rounded-full ${
              isListening
                ? "bg-gradient-to-br from-red-500 to-pink-500"
                : "bg-gradient-to-br from-blue-500 to-purple-500"
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
        <h3 className="text-gray-900 dark:text-white mb-2">
          {isListening ? "Listening..." : "Voice Search"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {isListening
            ? "Speak the book title or author name"
            : "Tap the button to start voice search"}
        </p>

        {/* Transcript */}
        {(transcript || interimTranscript) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              {transcript || interimTranscript}
            </p>
          </div>
        )}

        {/* Waveform Animation */}
        {isListening && (
          <div className="flex items-center justify-center gap-1 mb-6 h-12">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 bg-blue-600 rounded-full"
                animate={{
                  height: ["20%", "100%", "20%"],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
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
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`flex-1 gap-2 ${
              isListening ? "bg-red-600 hover:bg-red-700" : ""
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start
              </>
            )}
          </Button>
        </div>

        {/* Tips */}
        {!isListening && (
          <div className="mt-6 text-left">
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
              💡 Tips:
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Speak clearly and at normal pace</li>
              <li>• Say book title or author name</li>
              <li>• Works best in quiet environment</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
