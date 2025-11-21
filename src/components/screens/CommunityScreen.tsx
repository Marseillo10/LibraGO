import React, { useState } from "react";
import { Users, MessageSquare, BookOpen, Heart, Share2, TrendingUp, Award, Plus } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { toast } from "sonner@2.0.3";

const CommunityScreen = () => {
  const [activeTab, setActiveTab] = useState("feed");

  const activityFeed = [
    {
      id: "1",
      user: { name: "Ahmad R.", avatar: "AR", isPremium: true },
      action: "selesai membaca",
      book: "Clean Code",
      timeAgo: "2 jam lalu",
      likes: 24,
      comments: 5,
      hasLiked: false,
    },
    {
      id: "2",
      user: { name: "Siti M.", avatar: "SM", isPremium: false },
      action: "memberikan rating 5⭐ untuk",
      book: "Design Patterns",
      timeAgo: "5 jam lalu",
      likes: 12,
      comments: 3,
      hasLiked: true,
    },
    {
      id: "3",
      user: { name: "Budi S.", avatar: "BS", isPremium: true },
      action: "mencapai reading streak 30 hari",
      timeAgo: "1 hari lalu",
      likes: 56,
      comments: 12,
      hasLiked: false,
    },
  ];

  const bookClubs = [
    {
      id: "1",
      name: "Programming Excellence",
      members: 1247,
      books: 45,
      description: "Diskusi seputar programming, software engineering, dan best practices",
      icon: "💻",
      isJoined: true,
    },
    {
      id: "2",
      name: "Design Thinking",
      members: 856,
      books: 32,
      description: "Belajar design, UX/UI, dan creative problem solving",
      icon: "🎨",
      isJoined: false,
    },
    {
      id: "3",
      name: "Leadership & Management",
      members: 642,
      books: 28,
      description: "Mengembangkan skill kepemimpinan dan manajemen tim",
      icon: "👑",
      isJoined: false,
    },
  ];

  const challenges = [
    {
      id: "1",
      title: "Oktober Reading Challenge",
      description: "Baca 5 buku di bulan Oktober",
      participants: 234,
      progress: 3,
      target: 5,
      endsIn: "2 hari",
      reward: "Badge: October Reader",
    },
    {
      id: "2",
      title: "Genre Explorer",
      description: "Baca buku dari 5 genre berbeda",
      participants: 189,
      progress: 2,
      target: 5,
      endsIn: "15 hari",
      reward: "Badge: Genre Master",
    },
  ];

  const trending = [
    { rank: 1, title: "Clean Code", author: "Robert C. Martin", readers: 1234 },
    { rank: 2, title: "Design Patterns", author: "Erich Gamma", readers: 987 },
    { rank: 3, title: "The Pragmatic Programmer", author: "Andrew Hunt", readers: 856 },
  ];

  const suggestedUsers = [
    { name: "Diana P.", avatar: "DP", books: 47, followers: 234, isFollowing: false },
    { name: "Eko W.", avatar: "EW", books: 62, followers: 456, isFollowing: false },
    { name: "Fira K.", avatar: "FK", books: 38, followers: 189, isFollowing: true },
  ];

  const handleLike = (id: string) => {
    toast.success("Post disukai");
  };

  const handleJoinClub = (clubId: string) => {
    toast.success("Berhasil bergabung dengan book club");
  };

  const handleFollow = (userName: string) => {
    toast.success(`Berhasil follow ${userName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white">Komunitas</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Terhubung dengan pembaca lainnya
              </p>
            </div>
          </div>

          <Button className="gap-2">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Buat Post</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
                <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-3">
                  <TabsTrigger value="feed" className="flex-shrink-0">Feed</TabsTrigger>
                  <TabsTrigger value="clubs" className="flex-shrink-0">Book Clubs</TabsTrigger>
                  <TabsTrigger value="challenges" className="flex-shrink-0">Challenges</TabsTrigger>
                </TabsList>
              </div>

              {/* Feed Tab */}
              <TabsContent value="feed" className="space-y-4 mt-6">
                {activityFeed.map((activity) => (
                  <Card key={activity.id} className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {activity.user.avatar}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-900 dark:text-white">
                            {activity.user.name}
                          </span>
                          {activity.user.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-1.5 py-0">
                              Premium
                            </Badge>
                          )}
                          <span className="text-gray-600 dark:text-gray-400">
                            {activity.action}
                          </span>
                        </div>

                        {activity.book && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                            <p className="text-gray-900 dark:text-white">
                              📚 {activity.book}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mb-3">
                          <span>{activity.timeAgo}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-2 ${activity.hasLiked ? "text-red-600" : ""}`}
                            onClick={() => handleLike(activity.id)}
                          >
                            <Heart className={`w-4 h-4 ${activity.hasLiked ? "fill-current" : ""}`} />
                            {activity.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageSquare className="w-4 h-4" />
                            {activity.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* Book Clubs Tab */}
              <TabsContent value="clubs" className="space-y-4 mt-6">
                {bookClubs.map((club) => (
                  <Card key={club.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{club.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-gray-900 dark:text-white mb-1">
                              {club.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {club.description}
                            </p>
                          </div>
                          {club.isJoined && (
                            <Badge className="bg-green-600">Joined</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {club.members.toLocaleString()} members
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {club.books} books
                          </span>
                        </div>

                        {!club.isJoined && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJoinClub(club.id)}
                          >
                            Join Club
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* Challenges Tab */}
              <TabsContent value="challenges" className="space-y-4 mt-6">
                {challenges.map((challenge) => (
                  <Card key={challenge.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-gray-900 dark:text-white mb-1">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {challenge.description}
                        </p>
                      </div>
                      <Badge variant="outline">{challenge.endsIn}</Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white">
                          {challenge.progress} / {challenge.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        {challenge.participants} participants
                      </div>
                      <Badge className="gap-1 bg-amber-500">
                        <Award className="w-3 h-3" />
                        {challenge.reward}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Books */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-gray-900 dark:text-white">Trending</h3>
              </div>
              <div className="space-y-3">
                {trending.map((book) => (
                  <div key={book.rank} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center">
                      {book.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {book.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {book.author}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {book.readers}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Suggested Users */}
            <Card className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">
                Suggested Users
              </h3>
              <div className="space-y-4">
                {suggestedUsers.map((user) => (
                  <div key={user.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.books} books · {user.followers} followers
                        </p>
                      </div>
                    </div>
                    {!user.isFollowing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFollow(user.name)}
                      >
                        Follow
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityScreen;
