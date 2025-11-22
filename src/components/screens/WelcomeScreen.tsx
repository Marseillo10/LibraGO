import React, { useState } from "react";
import { Button } from "../ui/button";
import { LibraGoLogo } from "../LibraGoLogo";
import { BookOpen, Target, Users, Sparkles, ChevronRight } from "lucide-react";
import { Progress } from "../ui/progress";

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Selamat Datang di LibraGO",
      description: "Platform e-book premium dengan koleksi ribuan buku berkualitas",
      icon: BookOpen,
      gradient: "from-blue-500 to-blue-700",
    },
    {
      title: "Baca Dimana Saja, Kapan Saja",
      description: "Sinkronisasi otomatis di semua perangkat Anda dengan offline mode",
      icon: Sparkles,
      gradient: "from-purple-500 to-purple-700",
    },
    {
      title: "Capai Target Membaca Anda",
      description: "Set reading goals, track progress, dan dapatkan achievements",
      icon: Target,
      gradient: "from-green-500 to-green-700",
    },
    {
      title: "Bergabung dengan Komunitas",
      description: "Diskusi, share, dan temukan rekomendasi dari pembaca lainnya",
      icon: Users,
      gradient: "from-orange-500 to-orange-700",
    },
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <LibraGoLogo size="lg" showText={true} />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            {currentStep + 1} dari {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${currentStepData.gradient} text-white mb-6 animate-in fade-in zoom-in duration-500`}>
            <Icon className="w-12 h-12" />
          </div>

          <h1 className="text-gray-900 dark:text-white mb-4 animate-in slide-in-from-bottom-4 duration-500">
            {currentStepData.title}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg animate-in slide-in-from-bottom-4 duration-700">
            {currentStepData.description}
          </p>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                ? "w-8 bg-blue-600"
                : index < currentStep
                  ? "w-2 bg-blue-400"
                  : "w-2 bg-gray-300 dark:bg-gray-700"
                }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {currentStep < steps.length - 1 && (
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Lewati
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 gap-2"
          >
            {currentStep < steps.length - 1 ? "Lanjut" : "Mulai"}
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
