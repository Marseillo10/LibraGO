import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, BookOpen, Star, Crown, Users, TrendingUp, X, Archive, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";
import { SwipeableListItem, SWIPE_ACTIONS } from "../SwipeableListItem";
import { PullToRefresh } from "../PullToRefresh";
import { toast } from "sonner";
import { useBooks, Notification } from "../../context/BooksContext";
import { EmptyState } from "../EmptyState";
import { ErrorState } from "../ErrorState";
import { NotificationSkeleton } from "../skeletons/NotificationSkeleton";

const NotificationScreen = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    deleteNotification
  } = useBooks();

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

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Randomly simulate error for testing
      if (Math.random() > 0.9) throw new Error("Gagal memuat notifikasi");
      toast.success('Notifikasi diperbarui');
    } catch (err) {
      setError("Gagal memuat notifikasi. Silakan coba lagi.");
      toast.error("Terjadi kesalahan");
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Gagal Memuat Notifikasi"
        description={error}
        onRetry={handleRefresh}
        onHome={() => window.location.href = "/"}
      />
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white">Notifikasi</h1>
              {unreadCount > 0 && !isLoading && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount} notifikasi belum dibaca
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllNotificationsRead}
                className="gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Tandai Semua</span>
              </Button>
            )}
            {notifications.length > 0 && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearNotifications}
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
                <ChevronRight className={`w-5 h-5 text-blue-600 dark:text-blue-400 mr-1 pointer-events-none ${showScrollHint ? 'animate-bounce' : 'animate-pulse'
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
            {isLoading ? (
              <NotificationSkeleton />
            ) : filteredNotifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="Tidak Ada Notifikasi"
                description={`Anda tidak memiliki notifikasi ${activeTab !== "all" ? `di kategori ${activeTab}` : ""}`}
                tips={["Ikuti penulis favorit Anda untuk mendapatkan update terbaru", "Bergabung dengan klub buku untuk diskusi menarik"]}
              />
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const notificationCard = (
                    <Card
                      className={`p-4 transition-all ${!notification.isRead
                        ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                        : "bg-white dark:bg-gray-800/50"
                        }`}
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <div className={`p-2 rounded-lg ${!notification.isRead
                            ? "bg-white dark:bg-gray-700"
                            : "bg-gray-100 dark:bg-gray-700/50"
                            }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`${!notification.isRead
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                              } truncate pr-2`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2 lg:hidden" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
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
                              onClick={() => markNotificationRead(notification.id)}
                              title="Tandai sudah dibaca"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
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
                            !notification.isRead ? SWIPE_ACTIONS.markRead(() => markNotificationRead(notification.id)) : SWIPE_ACTIONS.archive(() => deleteNotification(notification.id)),
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
