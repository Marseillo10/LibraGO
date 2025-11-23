import React, { useState } from "react";
import { Clock, TrendingUp, BookOpen, Calendar, Award, Filter, BarChart3 } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useBooks } from "../../context/BooksContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const HistoryScreen = () => {
  const { library, readingStats, readingLogs, unlockedAchievements } = useBooks();
  const [timeRange, setTimeRange] = useState("month");

  // Derived History Data
  const readingHistory = library
    .filter(book => book.progress === 100)
    .sort((a, b) => new Date(b.lastReadDate || 0).getTime() - new Date(a.lastReadDate || 0).getTime());

  // Weekly reading data (Derived from readingLogs)
  const getWeeklyData = () => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      data.push({
        day: days[d.getDay()],
        pages: readingLogs[dateStr] || 0,
        fullDate: dateStr
      });
    }
    return data;
  };

  const weeklyData = getWeeklyData();

  // Monthly reading trend (Derived from readingLogs)
  // Note: Ideally we'd aggregate logs by month, but for now we'll use completed books per month from stats
  // or simulate it. Let's use a simple aggregation of books read.
  const getMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const today = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();

      // Format: YYYY-MM
      const monthPrefix = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;

      // Aggregate pages from readingLogs for this month
      let pagesCount = 0;
      Object.entries(readingLogs).forEach(([dateStr, pages]) => {
        if (dateStr.startsWith(monthPrefix)) {
          pagesCount += pages;
        }
      });

      data.push({
        month: months[monthIdx],
        pages: pagesCount
      });
    }
    return data;
  };

  const monthlyData = getMonthlyData();

  // Genre distribution (Derived from library)
  const genreCounts = library.reduce((acc, book) => {
    const genre = book.genre?.[0] || "Uncategorized";
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const genreData = Object.entries(genreCounts).map(([name, value], index) => ({
    name,
    value,
    color: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"][index % 5]
  }));

  // Achievements
  const achievements = [
    { id: "bookworm", title: "Bookworm", description: "Baca 10 buku", icon: "🐛" },
    { id: "speed_reader", title: "Speed Reader", description: "Selesaikan buku dalam 24 jam", icon: "⚡" }, // Logic not impl yet
    { id: "night_owl", title: "Night Owl", description: "Baca di malam hari 7 hari berturut", icon: "🦉" }, // Logic not impl yet
    { id: "genre_explorer", title: "Genre Explorer", description: "Baca 5 genre berbeda", icon: "🌍" }, // Logic not impl yet
    { id: "consistent", title: "Consistent", description: "Reading streak 30 hari", icon: "🔥" },
    { id: "century_club", title: "Century Club", description: "Baca 100 buku", icon: "💯" },
    { id: "first_step", title: "First Step", description: "Mulai membaca buku pertama", icon: "👣" },
    { id: "dedicated", title: "Dedicated", description: "Baca 50 halaman dalam sehari", icon: "💪" },
  ].map(ach => ({
    ...ach,
    unlocked: unlockedAchievements.includes(ach.id)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white">Riwayat & Statistik</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analisis kebiasaan membaca Anda
              </p>
            </div>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
              <SelectItem value="all">Semua Waktu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5" />
              <p className="text-sm opacity-90">Total Buku</p>
            </div>
            <p className="text-3xl mb-1">{readingStats.totalBooks}</p>
            <p className="text-xs opacity-75">{readingStats.booksThisMonth} bulan ini</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <p className="text-sm opacity-90">Total Halaman</p>
            </div>
            <p className="text-3xl mb-1">{readingStats.totalPages.toLocaleString()}</p>
            <p className="text-xs opacity-75">{readingStats.avgPagesPerDay} per hari</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <p className="text-sm opacity-90">Streak</p>
            </div>
            <p className="text-3xl mb-1">{readingStats.currentStreak}</p>
            <p className="text-xs opacity-75">Terpanjang: {readingStats.longestStreak} hari</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <p className="text-sm opacity-90">Waktu Baca</p>
            </div>
            <p className="text-3xl mb-1">{readingStats.totalTime.split(" ")[0]}</p>
            <p className="text-xs opacity-75">jam total</p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-3">
              <TabsTrigger value="overview" className="flex-shrink-0">Overview</TabsTrigger>
              <TabsTrigger value="history" className="flex-shrink-0">Riwayat</TabsTrigger>
              <TabsTrigger value="achievements" className="flex-shrink-0">Achievement</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Weekly Reading Chart */}
              <Card className="p-6">
                <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Halaman Dibaca Minggu Ini
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pages" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Monthly Trend */}
              <Card className="p-6">
                <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Tren Halaman Bulanan
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="pages" stroke="#8B5CF6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Genre Distribution */}
            <Card className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">Distribusi Genre</h3>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {genreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  {genreData.map((genre) => (
                    <div key={genre.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: genre.color }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {genre.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {genre.value} buku
                        </span>
                      </div>
                      <Progress
                        value={(genre.value / readingStats.totalBooks) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">Buku yang Telah Selesai</h3>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {readingHistory.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Belum ada buku yang selesai dibaca.</p>
                  ) : (
                    readingHistory.map((book) => (
                      <div
                        key={book.id}
                        className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-16 h-24 flex-shrink-0">
                          <ImageWithFallback
                            src={book.image}
                            alt={book.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-900 dark:text-white mb-1 truncate">{book.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                            {book.author}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {book.pageCount} halaman
                            </span>
                            {book.lastReadDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(book.lastReadDate).toLocaleDateString("id-ID")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {book.rating ? (
                            Array.from({ length: Math.round(book.rating) }).map((_, i) => (
                              <span key={i} className="text-yellow-500">★</span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">Belum ada rating</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`p-6 text-center transition-all ${achievement.unlocked
                    ? "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800"
                    : "opacity-60 grayscale"
                    }`}
                >
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <h4 className="text-gray-900 dark:text-white mb-2">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {achievement.description}
                  </p>
                  {achievement.unlocked ? (
                    <Badge className="bg-green-600">Unlocked</Badge>
                  ) : (
                    <Badge variant="outline">Locked</Badge>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HistoryScreen;
