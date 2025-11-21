import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, BookOpen, Star, Crown, Users, TrendingUp, X, Archive, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";
import { SwipeableListItem, SWIPE_ACTIONS } from "../SwipeableListItem";
import { PullToRefresh } from "../PullToRefresh";
import { toast } from "sonner@2.0.3";

interface Notification {
  id: string;
  type: "book" | "achievement" | "premium" | "social" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  icon?: string;
}

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "book",
      title: "Buku Baru dari Penulis Favorit",
      message: "Robert C. Martin merilis buku baru 'Clean Agile'",
      timestamp: "2 jam yang lalu",
      isRead: false,
    },
    {
      id: "2",
      type: "achievement",
      title: "Achievement Unlocked! 🎉",
      message: "Anda telah membaca 10 buku bulan ini",
      timestamp: "5 jam yang lalu",
      isRead: false,
    },
    {
      id: "3",
      type: "premium",
      title: "Subscription Akan Berakhir",
      message: "Premium subscription Anda akan berakhir dalam 7 hari",
      timestamp: "1 hari yang lalu",
      isRead: true,
    },
    {
      id: "4",
      type: "social",
      title: "Review Baru",
      message: "3 orang memberikan review pada buku yang Anda rekomendasikan",
      timestamp: "2 jam yang lalu",
      isRead: false,
    },
    {
      id: "5",
      type: "book",
      title: "Reminder: Lanjutkan Membaca",
      message: "Anda belum melanjutkan 'Design Patterns' selama 3 hari",
      timestamp: "3 hari yang lalu",
      isRead: false,
    },
    {
      id: "6",
      type: "system",
      title: "Update Aplikasi Tersedia",
      message: "LibraGO v2.1.0 dengan fitur baru telah tersedia",
      timestamp: "5 hari yang lalu",
      isRead: true,
    },
    {
      id: "7",
      type: "social",
      title: "Follower Baru",
      message: "5 pengguna baru mengikuti aktivitas membaca Anda",
      timestamp: "3 jam yang lalu",
      isRead: false,
    },
    {
      id: "8",
      type: "social",
      title: "Komentar di Diskusi",
      message: "Ada 8 komentar baru di thread diskusi 'Best Programming Books 2024'",
      timestamp: "6 jam yang lalu",
      isRead: true,
    },
    {
      id: "9",
      type: "book",
      title: "Rekomendasi Buku",
      message: "Berdasarkan riwayat Anda, kami merekomendasikan 'Refactoring' oleh Martin Fowler",
      timestamp: "12 jam yang lalu",
      isRead: true,
    },
    {
      id: "10",
      type: "achievement",
      title: "Streak 30 Hari! 🔥",
      message: "Selamat! Anda telah membaca berturut-turut selama 30 hari",
      timestamp: "1 hari yang lalu",
      isRead: true,
    },
    {
      id: "11",
      type: "social",
      title: "Teman Menyelesaikan Buku",
      message: "Ahmad Rizki menyelesaikan 'The Pragmatic Programmer' dan memberikan rating 5 bintang",
      timestamp: "1 hari yang lalu",
      isRead: true,
    },
    {
      id: "12",
      type: "premium",
      title: "Diskon Premium 50%",
      message: "Dapatkan diskon 50% untuk perpanjangan subscription premium minggu ini!",
      timestamp: "2 hari yang lalu",
      isRead: true,
    },
    {
      id: "13",
      type: "social",
      title: "Mention di Forum",
      message: "Siti Nurhaliza menyebutkan Anda di diskusi 'Clean Code Best Practices'",
      timestamp: "8 jam yang lalu",
      isRead: false,
    },
    {
      id: "14",
      type: "book",
      title: "Buku Wishlist Tersedia",
      message: "'Domain-Driven Design' yang ada di wishlist Anda sekarang tersedia",
      timestamp: "3 hari yang lalu",
      isRead: true,
    },
    {
      id: "15",
      type: "achievement",
      title: "Master Reader 📚",
      message: "Anda telah menyelesaikan 50 buku tahun ini!",
      timestamp: "4 hari yang lalu",
      isRead: true,
    },
    {
      id: "16",
      type: "social",
      title: "Like pada Review",
      message: "12 orang menyukai review Anda tentang 'The Clean Coder'",
      timestamp: "5 jam yang lalu",
      isRead: false,
    },
    {
      id: "17",
      type: "social",
      title: "Teman Baru",
      message: "Budi Santoso dan 3 orang lainnya ingin berteman dengan Anda",
      timestamp: "1 hari yang lalu",
      isRead: true,
    },
    {
      id: "18",
      type: "social",
      title: "Bergabung ke Klub Buku",
      message: "Anda telah diterima di klub buku 'Tech Book Club Indonesia'",
      timestamp: "2 hari yang lalu",
      isRead: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState("all");
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position to show/hide scroll indicators
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftScroll(scrollLeft > 10);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Hide scroll hint after first scroll or 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowScrollHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    
    // Check on window resize
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleScrollHintDismiss = () => {
    setShowScrollHint(false);
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "book":
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case "achievement":
        return <Star className="w-5 h-5 text-yellow-500" />;
      case "premium":
        return <Crown className="w-5 h-5 text-amber-500" />;
      case "social":
        return <Users className="w-5 h-5 text-green-600" />;
      case "system":
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notifikasi dihapus');
  };

  const archiveNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notifikasi diarsipkan');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('Semua notifikasi dihapus');
  };

  const handleRefresh = async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Notifikasi diperbarui');
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    return n.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadByType = {
    book: notifications.filter(n => n.type === "book" && !n.isRead).length,
    achievement: notifications.filter(n => n.type === "achievement" && !n.isRead).length,
    premium: notifications.filter(n => n.type === "premium" && !n.isRead).length,
    social: notifications.filter(n => n.type === "social" && !n.isRead).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white">Notifikasi</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount} notifikasi belum dibaca
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Tandai Semua</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Hapus Semua</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs - Scrollable on Mobile with Visual Indicators */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="relative">
            {/* Left Scroll Indicator */}
            {showLeftScroll && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-blue-50 via-blue-50/80 dark:from-gray-900 dark:via-gray-900/80 to-transparent z-10 flex items-center cursor-pointer lg:hidden active:opacity-70 transition-opacity"
                onClick={scrollLeft}
              >
                <ChevronLeft className="w-5 h-5 text-blue-600 dark:text-blue-400 ml-1 animate-pulse pointer-events-none" />
              </div>
            )}
            
            {/* Right Scroll Indicator with Hint Animation */}
            {showRightScroll && (
              <div 
                className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-blue-50 via-blue-50/80 dark:from-gray-900 dark:via-gray-900/80 to-transparent z-10 flex items-center justify-end cursor-pointer lg:hidden active:opacity-70 transition-opacity"
                onClick={scrollRight}
              >
                <ChevronRight className={`w-5 h-5 text-blue-600 dark:text-blue-400 mr-1 pointer-events-none ${
                  showScrollHint ? 'animate-bounce' : 'animate-pulse'
                }`} />
              </div>
            )}

            {/* Scroll Hint Tooltip - Shows on first load */}
            {showScrollHint && showRightScroll && (
              <div className="absolute -top-14 right-2 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg shadow-xl z-20 lg:hidden animate-bounce cursor-pointer transition-all hover:bg-blue-700"
                   onClick={handleScrollHintDismiss}>
                <div className="flex items-center gap-1.5">
                  <span className="whitespace-nowrap">👉 Swipe untuk kategori lain</span>
                </div>
                <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-blue-600 transform rotate-45"></div>
              </div>
            )}

            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide -mx-6 px-6 scroll-smooth"
              onScroll={handleScrollHintDismiss}
            >
              <TabsList className="inline-flex w-auto min-w-full lg:grid lg:w-full lg:grid-cols-6">
              <TabsTrigger value="all" className="relative flex-shrink-0">
                Semua
                {unreadCount > 0 && (
                  <Badge className="ml-1 px-1.5 py-0 text-xs h-5 min-w-[20px]">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-shrink-0">
                Belum Dibaca
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs h-5 min-w-[20px]">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="book" className="flex-shrink-0">
                Buku
                {unreadByType.book > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs h-5 min-w-[20px]">{unreadByType.book}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="achievement" className="flex-shrink-0">
                Achievement
                {unreadByType.achievement > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs h-5 min-w-[20px]">{unreadByType.achievement}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="premium" className="flex-shrink-0">
                Premium
                {unreadByType.premium > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs h-5 min-w-[20px]">{unreadByType.premium}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="social" className="flex-shrink-0">
                Sosial
                {unreadByType.social > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs h-5 min-w-[20px]">{unreadByType.social}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            </div>
          </div>
        </Tabs>

        {/* Notifications List with Pull to Refresh */}
        <PullToRefresh onRefresh={handleRefresh}>
          <ScrollArea className="h-[calc(100vh-280px)]">
            {filteredNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-gray-900 dark:text-white mb-2">
                  Tidak Ada Notifikasi
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Anda tidak memiliki notifikasi {activeTab !== "all" ? `di kategori ${activeTab}` : ""}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const notificationCard = (
                    <Card
                      className={`p-4 transition-all ${
                        !notification.isRead
                          ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                          : "bg-white dark:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <div className={`p-2 rounded-lg ${
                            !notification.isRead 
                              ? "bg-white dark:bg-gray-700" 
                              : "bg-gray-100 dark:bg-gray-700/50"
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`${
                              !notification.isRead 
                                ? "text-gray-900 dark:text-white" 
                                : "text-gray-700 dark:text-gray-300"
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2 lg:hidden" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {notification.timestamp}
                          </p>
                        </div>

                        {/* Desktop Actions (no swipe) */}
                        <div className="hidden lg:flex flex-col gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markAsRead(notification.id)}
                              title="Tandai sudah dibaca"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => archiveNotification(notification.id)}
                            title="Arsipkan"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => deleteNotification(notification.id)}
                            title="Hapus notifikasi"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );

                  return (
                    <React.Fragment key={notification.id}>
                      {/* Mobile: Swipeable */}
                      <div className="lg:hidden">
                        <SwipeableListItem
                          leftActions={[
                            !notification.isRead ? SWIPE_ACTIONS.markRead(() => markAsRead(notification.id)) : SWIPE_ACTIONS.archive(() => archiveNotification(notification.id)),
                          ]}
                          rightActions={[
                            SWIPE_ACTIONS.delete(() => deleteNotification(notification.id)),
                          ]}
                        >
                          {notificationCard}
                        </SwipeableListItem>
                      </div>
                      {/* Desktop: Non-swipeable */}
                      <div className="hidden lg:block">
                        {notificationCard}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default NotificationScreen;
