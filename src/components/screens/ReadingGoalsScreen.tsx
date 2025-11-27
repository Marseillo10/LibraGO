import React, { useState } from "react";
import { Trophy, Target, Flame, Calendar, ChevronRight, Star, BookOpen, TrendingUp, Share2, Plus, Check, Trash2, Award } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useBooks, ReadingGoal } from "../../context/BooksContext";

const ReadingGoalsScreen = ({ darkMode }: { darkMode: boolean }) => {
  const { readingGoals, addGoal, deleteGoal, library } = useBooks();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    type: "books" as ReadingGoal["type"],
    target: 10,
    period: "monthly" as ReadingGoal["period"],
  });

  // Challenges - pre-made goals
  const handleClaimReward = (challengeId: number) => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#8b5cf6', '#ec4899']
    });

    toast.success("Reward claimed successfully!", {
      description: "Keep up the great work!",
    });
  };
  const challenges = [
    {
      id: "c1",
      title: "Reading Sprint",
      description: "Baca 5 buku dalam 30 hari",
      difficulty: "Medium",
      reward: "Badge: Speed Reader",
      icon: "⚡",
    },
    {
      id: "c2",
      title: "Genre Explorer",
      description: "Baca minimal 1 buku dari 10 genre berbeda",
      difficulty: "Hard",
      reward: "Badge: Genre Master",
      icon: "🌍",
    },
    {
      id: "c3",
      title: "Morning Reader",
      description: "Baca setiap pagi selama 7 hari berturut",
      difficulty: "Easy",
      reward: "Badge: Early Bird",
      icon: "🌅",
    },
    {
      id: "c4",
      title: "Page Turner",
      description: "Baca 1000 halaman dalam 1 bulan",
      difficulty: "Hard",
      reward: "Badge: Page Master",
      icon: "📚",
    },
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "books": return "Buku";
      case "pages": return "Halaman";
      case "time": return "Hari";
      case "genre": return "Genre";
      default: return type;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "daily": return "Harian";
      case "weekly": return "Mingguan";
      case "monthly": return "Bulanan";
      case "yearly": return "Tahunan";
      default: return period;
    }
  };

  const getEndDate = (period: ReadingGoal["period"]) => {
    const today = new Date();
    switch (period) {
      case "daily":
        return new Date(today.setDate(today.getDate() + 1)).toISOString().split("T")[0];
      case "weekly":
        return new Date(today.setDate(today.getDate() + 7)).toISOString().split("T")[0];
      case "monthly":
        return new Date(today.setMonth(today.getMonth() + 1)).toISOString().split("T")[0];
      case "yearly":
        return new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split("T")[0];
      default:
        return today.toISOString().split("T")[0];
    }
  };

  const handleCreateGoal = () => {
    const goal: ReadingGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      type: newGoal.type,
      target: newGoal.target,
      current: 0, // Initial progress is 0, will be calculated dynamically
      period: newGoal.period,
      startDate: new Date().toISOString().split("T")[0],
      endDate: getEndDate(newGoal.period),
      status: "active",
    };
    addGoal(goal);
    setIsCreateDialogOpen(false);
    setNewGoal({ title: "", type: "books", target: 10, period: "monthly" });
  };

  // Calculate dynamic progress for goals
  const getGoalProgress = (goal: ReadingGoal) => {
    if (goal.type === "books") {
      // Count books finished within the goal period
      const startDate = new Date(goal.startDate);
      const endDate = new Date(goal.endDate);

      const finishedBooks = library.filter(book => {
        if (book.progress !== 100 || !book.lastReadDate) return false;
        const readDate = new Date(book.lastReadDate);
        return readDate >= startDate && readDate <= endDate;
      });

      return finishedBooks.length;
    }
    // For other types, we might need more complex tracking (e.g. pages read log)
    // For now, return stored current value
    return goal.current;
  };

  const calculatePercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const activeGoals = readingGoals.filter(g => g.status === "active");
  const completedGoals = readingGoals.filter(g => g.status === "completed"); // This status update logic needs to be implemented in context or effect

  return (
    <div className={`min-h-screen p-4 md:p-8 ${darkMode ? "bg-transparent" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white">Target & Tantangan</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeGoals.length} target aktif
              </p>
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-5 h-5" />
                Buat Target Baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Target Baru</DialogTitle>
                <DialogDescription>
                  Buat target membaca baru untuk meningkatkan produktivitas Anda
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Judul Target</Label>
                  <Input
                    placeholder="Contoh: Baca 10 buku bulan ini"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tipe Target</Label>
                  <Select
                    value={newGoal.type}
                    onValueChange={(value: ReadingGoal["type"]) => setNewGoal({ ...newGoal, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="books">Jumlah Buku</SelectItem>
                      <SelectItem value="pages">Jumlah Halaman</SelectItem>
                      <SelectItem value="time">Hari Membaca</SelectItem>
                      <SelectItem value="genre">Genre Berbeda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Angka</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Periode</Label>
                  <Select
                    value={newGoal.period}
                    onValueChange={(value: ReadingGoal["period"]) => setNewGoal({ ...newGoal, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Harian</SelectItem>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                      <SelectItem value="yearly">Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateGoal} className="w-full" disabled={!newGoal.title}>
                  Buat Target
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="goals" className="space-y-6">
          <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-2">
              <TabsTrigger value="goals" className="flex-shrink-0">Target Saya</TabsTrigger>
              <TabsTrigger value="challenges" className="flex-shrink-0">Tantangan</TabsTrigger>
            </TabsList>
          </div>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Target Aktif</p>
                  <Target className="w-5 h-5" />
                </div>
                <p className="text-3xl">{activeGoals.length}</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white dark:from-green-600 dark:to-green-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Target Tercapai</p>
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-3xl">{completedGoals.length}</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white dark:from-purple-600 dark:to-purple-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Progress Rata-rata</p>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-3xl">
                  {activeGoals.length > 0 ? Math.round(
                    activeGoals.reduce((acc, g) => acc + calculatePercentage(getGoalProgress(g), g.target), 0) /
                    activeGoals.length
                  ) : 0}%
                </p>
              </Card>
            </div>

            {/* Active Goals */}
            <div className="space-y-4">
              <h3 className="text-gray-900 dark:text-white">Target Aktif</h3>
              {activeGoals.map((goal) => {
                const currentProgress = getGoalProgress(goal);
                const progressPercentage = calculatePercentage(currentProgress, goal.target);
                const daysLeft = getDaysRemaining(goal.endDate);

                return (
                  <Card key={goal.id} className="p-6 bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-gray-900 dark:text-white mb-2 truncate">{goal.title}</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{getPeriodLabel(goal.period)}</Badge>
                          <Badge variant="outline">{getTypeLabel(goal.type)}</Badge>
                          {daysLeft > 0 ? (
                            <Badge variant="outline" className="gap-1">
                              <Calendar className="w-3 h-3" />
                              {daysLeft} hari tersisa
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              Berakhir
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white">
                          {currentProgress} / {goal.target} {getTypeLabel(goal.type)}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {progressPercentage.toFixed(0)}% tercapai
                        {progressPercentage >= 100 && " 🎉"}
                      </p>
                    </div>
                  </Card>
                );
              })}

              {activeGoals.length === 0 && (
                <Card className="p-12 text-center bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
                  <Target className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-gray-900 dark:text-white mb-2">
                    Belum Ada Target
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Mulai buat target membaca untuk motivasi diri Anda
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Buat Target Pertama
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <div className="grid md:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="p-6 bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{challenge.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 dark:text-white mb-1">
                        {challenge.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {challenge.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge
                          variant={
                            challenge.difficulty === "Easy"
                              ? "outline"
                              : challenge.difficulty === "Medium"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {challenge.difficulty}
                        </Badge>
                        <Badge className="gap-1 bg-amber-500 hover:bg-amber-600">
                          <Award className="w-3 h-3" />
                          {challenge.reward}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    Ambil Tantangan
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReadingGoalsScreen;
