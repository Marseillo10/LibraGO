import { Card } from "./ui/card";
import { BookOpen, Clock, Target, TrendingUp, Award, Flame, Star, CheckCircle2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
  bgColor: string;
}

interface DashboardStatsProps {
  booksRead: number;
  readingStreak: number;
  monthlyGoal: number;
  monthlyProgress: number;
  totalPages: number;
  achievements: number;
  darkMode?: boolean;
}

export function DashboardStats({
  booksRead,
  readingStreak,
  monthlyGoal,
  monthlyProgress,
  totalPages,
  achievements,
  darkMode = false,
}: DashboardStatsProps) {
  const stats: Stat[] = [
    {
      label: "Buku Dibaca",
      value: booksRead,
      icon: <BookOpen className="w-5 h-5" />,
      trend: 12,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-gray-900/80 backdrop-blur-md border border-blue-100 dark:border-blue-800",
    },
    {
      label: "Streak Harian",
      value: `${readingStreak} hari`,
      icon: <Flame className="w-5 h-5" />,
      trend: 5,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-gray-900/80 backdrop-blur-md border border-orange-100 dark:border-orange-800",
    },
    {
      label: "Target Bulan Ini",
      value: `${monthlyProgress}/${monthlyGoal}`,
      icon: <Target className="w-5 h-5" />,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-gray-900/80 backdrop-blur-md border border-green-100 dark:border-green-800",
    },
    {
      label: "Total Halaman",
      value: totalPages.toLocaleString(),
      icon: <Clock className="w-5 h-5" />,
      trend: 8,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-gray-900/80 backdrop-blur-md border border-purple-100 dark:border-purple-800",
    },
  ];

  const progressPercentage = (monthlyProgress / monthlyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 hover:shadow-lg transition-all cursor-pointer ${stat.bgColor}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${stat.color}`}>
                  {stat.icon}
                </div>
                {stat.trend && (
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{stat.trend}%
                  </Badge>
                )}
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Monthly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className={`p-6 backdrop-blur-md border ${darkMode ? "bg-gray-900/80 border-blue-800/50" : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100"}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900 dark:text-white mb-1">
                Progress Bulan Ini
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {monthlyProgress} dari {monthlyGoal} buku
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(progressPercentage)}%
              </div>
              {progressPercentage >= 100 ? (
                <Badge className="bg-green-500 mt-1">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Target Tercapai!
                </Badge>
              ) : (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {monthlyGoal - monthlyProgress} buku lagi
                </p>
              )}
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3" />

          {/* Milestones */}
          <div className="flex justify-between mt-3 text-xs text-gray-600 dark:text-gray-400">
            <span>0</span>
            <span className={progressPercentage >= 25 ? "text-blue-600 dark:text-blue-400 font-medium" : ""}>
              25%
            </span>
            <span className={progressPercentage >= 50 ? "text-blue-600 dark:text-blue-400 font-medium" : ""}>
              50%
            </span>
            <span className={progressPercentage >= 75 ? "text-blue-600 dark:text-blue-400 font-medium" : ""}>
              75%
            </span>
            <span className={progressPercentage >= 100 ? "text-green-600 dark:text-green-400 font-medium" : ""}>
              {monthlyGoal}
            </span>
          </div>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className={`p-6 backdrop-blur-md border ${darkMode ? "bg-gray-900/80 border-amber-800/50" : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-full">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 dark:text-white mb-1">
                Pencapaian
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {achievements} achievement terbuka
              </p>
            </div>
            <div className="text-right">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.min(5, achievements)
                      ? "text-amber-500 fill-amber-500"
                      : "text-gray-300 dark:text-gray-600"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/30">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Atur Target
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Target baca bulanan
            </p>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/30">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Lihat Statistik
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Analisis lengkap
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
