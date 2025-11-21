import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Check } from "lucide-react";

interface GenreSelectionScreenProps {
  onComplete: (selectedGenres: string[]) => void;
}

export function GenreSelectionScreen({ onComplete }: GenreSelectionScreenProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const genres = [
    { id: "programming", name: "Programming", emoji: "💻", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
    { id: "design", name: "Design", emoji: "🎨", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
    { id: "business", name: "Business", emoji: "💼", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" },
    { id: "science", name: "Science", emoji: "🔬", color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300" },
    { id: "ai-ml", name: "AI & Machine Learning", emoji: "🤖", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" },
    { id: "leadership", name: "Leadership", emoji: "👑", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
    { id: "self-improvement", name: "Self Improvement", emoji: "🌟", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300" },
    { id: "psychology", name: "Psychology", emoji: "🧠", color: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300" },
    { id: "history", name: "History", emoji: "📜", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" },
    { id: "fiction", name: "Fiction", emoji: "📚", color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" },
    { id: "biography", name: "Biography", emoji: "👤", color: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" },
    { id: "philosophy", name: "Philosophy", emoji: "🤔", color: "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300" },
  ];

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleContinue = () => {
    onComplete(selectedGenres);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-gray-900 dark:text-white mb-3">
            Pilih Genre Favorit Anda
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            Pilih minimal 3 genre untuk mendapatkan rekomendasi yang lebih personal
          </p>
          <Badge variant="outline" className="text-lg px-4 py-1">
            {selectedGenres.length} dipilih
          </Badge>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {genres.map((genre) => {
            const isSelected = selectedGenres.includes(genre.id);
            return (
              <Card
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
                className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                  isSelected
                    ? "ring-4 ring-blue-500 dark:ring-blue-400 shadow-lg"
                    : "hover:shadow-md"
                }`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{genre.emoji}</div>
                  <h3 className="text-sm text-gray-900 dark:text-white mb-2">
                    {genre.name}
                  </h3>
                  {isSelected && (
                    <div className="flex justify-center">
                      <div className="bg-blue-600 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={() => onComplete([])}
            className="flex-1"
          >
            Lewati
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedGenres.length < 3}
            className="flex-1"
          >
            Lanjutkan ({selectedGenres.length}/3+)
          </Button>
        </div>
      </div>
    </div>
  );
}
