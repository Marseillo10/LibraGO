import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { MobileScreenWrapper } from "../MobileScreenWrapper";
import { PullToRefresh } from "../PullToRefresh";
import {
  Crown,
  User,
  Bell,
  Lock,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Moon,
  Globe,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Camera,
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Shield,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { toast } from "sonner@2.0.3";

interface ProfileScreenProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onUpgrade: () => void;
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
}

export function ProfileScreen({
  darkMode,
  onToggleDarkMode,
  onUpgrade,
  onLogout,
  onNavigate,
}: ProfileScreenProps) {
  const [language, setLanguage] = useState("id");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showNotifDialog, setShowNotifDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Edit Profile States
  const [name, setName] = useState("Dr. Alisa Prasetyo");
  const [email, setEmail] = useState("alisa.prasetyo@university.edu");
  const [bio, setBio] = useState("Peneliti dan pengajar di bidang Computer Science. Gemar membaca buku teknologi dan pengembangan diri.");
  const [location, setLocation] = useState("Jakarta, Indonesia");
  const [birthDate, setBirthDate] = useState("1990-05-15");
  
  // Notification Settings
  const [notifSettings, setNotifSettings] = useState({
    emailNotif: true,
    pushNotif: true,
    bookUpdates: true,
    newReleases: true,
    readingReminders: true,
    communityActivity: false,
    promotions: true,
  });
  
  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showReadingActivity: true,
    showFavorites: false,
    allowMessages: true,
    showAchievements: true,
  });

  const user = {
    name,
    email,
    bio,
    location,
    birthDate,
    isPremium: false,
    joinDate: "Januari 2024",
    level: 12,
    nextLevel: 15,
    xp: 2450,
    nextXp: 3000,
  };

  const stats = [
    { label: "Buku Dibaca", value: "47", icon: BookOpen, color: "text-blue-600" },
    { label: "Halaman", value: "12,450", icon: FileText, color: "text-purple-600" },
    { label: "Jam Baca", value: "238", icon: TrendingUp, color: "text-amber-600" },
    { label: "Pencapaian", value: "24", icon: Award, color: "text-green-600" },
  ];

  const achievements = [
    { id: 1, name: "Speed Reader", icon: "⚡", unlocked: true },
    { id: 2, name: "Night Owl", icon: "🦉", unlocked: true },
    { id: 3, name: "Bookworm", icon: "📚", unlocked: true },
    { id: 4, name: "Reviewer", icon: "⭐", unlocked: false },
    { id: 5, name: "Collector", icon: "💎", unlocked: false },
    { id: 6, name: "Influencer", icon: "🎯", unlocked: false },
  ];

  const handleSaveProfile = () => {
    // Simulate save
    toast.success("Profil berhasil diperbarui!");
    setShowEditDialog(false);
  };

  const handleSaveNotifications = () => {
    toast.success("Pengaturan notifikasi berhasil disimpan!");
    setShowNotifDialog(false);
  };

  const handleSavePrivacy = () => {
    toast.success("Pengaturan privasi berhasil disimpan!");
    setShowPrivacyDialog(false);
  };

  const handleNavigateToScreen = (screen: string) => {
    if (onNavigate) {
      onNavigate(screen);
    } else {
      toast.info(`Navigasi ke ${screen}`);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call to refresh profile data
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast.success("Profil berhasil diperbarui!");
  };

  const menuItems = [
    {
      icon: User,
      label: "Edit Profil",
      action: () => setShowEditDialog(true),
    },
    {
      icon: Bell,
      label: "Pengaturan Notifikasi",
      action: () => setShowNotifDialog(true),
    },
    {
      icon: Lock,
      label: "Privasi & Keamanan",
      action: () => setShowPrivacyDialog(true),
    },
    {
      icon: Target,
      label: "Target & Tantangan",
      action: () => handleNavigateToScreen("goals"),
    },
    {
      icon: Heart,
      label: "Dukung Kami",
      action: () => handleNavigateToScreen("support"),
    },
    {
      icon: HelpCircle,
      label: "Bantuan & Dukungan",
      action: () => handleNavigateToScreen("help"),
    },
    {
      icon: FileText,
      label: "Syarat & Ketentuan",
      action: () => toast.info("Membuka Syarat & Ketentuan..."),
    },
  ];

  return (
    <>
      <MobileScreenWrapper>
        <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-20 lg:pb-8">
            <div className="px-4 md:px-6 py-6 md:py-8 lg:px-12">
              <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-gray-900 dark:text-white mb-2">Profil Saya</h1>
                    <p className="text-gray-600 dark:text-gray-400">Kelola profil dan pengaturan akun Anda</p>
                  </div>
                  {/* Refresh Button - Desktop Only */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="hidden lg:flex"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

          {/* Profile Card */}
          <Card className="p-6 mb-6 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/10 border-2">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-3xl">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <button 
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
                  onClick={() => toast.info("Fitur upload foto akan segera hadir!")}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h2 className="text-2xl text-gray-900 dark:text-white">
                    {user.name}
                  </h2>
                  {user.isPremium && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 w-fit">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <Badge variant="outline" className="w-fit">
                    Level {user.level}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    Bergabung {user.joinDate}
                  </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Progress ke Level {user.nextLevel}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {user.xp} / {user.nextXp} XP
                    </span>
                  </div>
                  <Progress value={(user.xp / user.nextXp) * 100} className="h-2" />
                </div>
              </div>

              <Button
                onClick={() => setShowEditDialog(true)}
                variant="outline"
                className="w-full md:w-auto gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profil
              </Button>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.label} 
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-center mb-2">
                      <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg text-gray-900 dark:text-white">
                  Pencapaian
                </h3>
                <p className="text-xs text-gray-500 mt-1 lg:hidden">
                  Geser untuk melihat lebih banyak →
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleNavigateToScreen("goals")}
              >
                Lihat Semua
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {/* Mobile: Horizontal Scroll */}
            <div className="lg:hidden overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              <div className="flex gap-4 min-w-max">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`text-center p-4 rounded-lg transition-all flex-shrink-0 w-24 active:scale-95 ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 opacity-50"
                    }`}
                    onClick={() => {
                      if (achievement.unlocked) {
                        toast.success(`${achievement.icon} ${achievement.name} unlocked!`);
                      } else {
                        toast.info(`Terus baca untuk unlock ${achievement.name}!`);
                      }
                    }}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <p className="text-xs text-gray-900 dark:text-white leading-tight">
                      {achievement.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: Grid */}
            <div className="hidden lg:grid grid-cols-6 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`text-center p-3 rounded-lg transition-all hover:scale-105 cursor-pointer ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800"
                      : "bg-gray-100 dark:bg-gray-800 opacity-50"
                  }`}
                  onClick={() => {
                    if (achievement.unlocked) {
                      toast.success(`${achievement.icon} ${achievement.name} unlocked!`);
                    } else {
                      toast.info(`Terus baca untuk unlock ${achievement.name}!`);
                    }
                  }}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <p className="text-xs text-gray-900 dark:text-white">
                    {achievement.name}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Premium Banner (if not premium) */}
          {!user.isPremium && (
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 mb-6 border-0 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
              
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <Crown className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl mb-2">Upgrade ke Premium</h3>
                  <p className="text-blue-100 text-sm mb-3">
                    Dapatkan akses unlimited ke 10,000+ buku, fitur eksklusif, dan bebas iklan
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-white/20 text-white border-white/30">✨ Unlimited Books</Badge>
                    <Badge className="bg-white/20 text-white border-white/30">🎯 Advanced Analytics</Badge>
                    <Badge className="bg-white/20 text-white border-white/30">🚫 No Ads</Badge>
                  </div>
                </div>
                <Button
                  onClick={onUpgrade}
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg w-full sm:w-auto"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Sekarang
                </Button>
              </div>
            </Card>
          )}

          {/* Settings */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg text-gray-900 dark:text-white mb-4">
              Pengaturan Umum
            </h3>

            <div className="space-y-1">
              {/* Language Selection */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    Bahasa
                  </span>
                </div>
                <Select value={language} onValueChange={(val) => {
                  setLanguage(val);
                  toast.success(`Bahasa diubah ke ${val === 'id' ? 'Indonesia' : 'English'}`);
                }}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇮🇩</span>
                        <span>Indonesia</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇺🇸</span>
                        <span>English</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="zh">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇨🇳</span>
                        <span>中文</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ja">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇯🇵</span>
                        <span>日本語</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="text-gray-900 dark:text-white">
                      Mode Gelap
                    </div>
                    <p className="text-xs text-gray-500">
                      Nyaman untuk mata di malam hari
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={() => {
                    onToggleDarkMode();
                    toast.success(darkMode ? "Mode terang diaktifkan" : "Mode gelap diaktifkan");
                  }}
                />
              </div>

              <Separator className="my-2" />

              {/* Menu Items */}
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </Card>

          {/* Logout Button */}
          <Button
            onClick={() => {
              if (confirm("Apakah Anda yakin ingin keluar?")) {
                onLogout();
                toast.success("Berhasil keluar dari akun");
              }
            }}
            variant="outline"
            className="w-full text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950 h-12"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Keluar dari Akun
          </Button>
              </div>
            </div>
          </div>
        </PullToRefresh>
      </MobileScreenWrapper>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
            <DialogDescription>
              Perbarui informasi profil Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap Anda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan tentang diri Anda..."
                rows={3}
              />
              <p className="text-xs text-gray-500">
                {bio.length} / 200 karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Kota, Negara"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Tanggal Lahir</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveProfile}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={showNotifDialog} onOpenChange={setShowNotifDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pengaturan Notifikasi</DialogTitle>
            <DialogDescription>
              Kelola preferensi notifikasi Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {[
              { key: 'emailNotif', label: 'Notifikasi Email', desc: 'Terima notifikasi via email' },
              { key: 'pushNotif', label: 'Push Notification', desc: 'Notifikasi push di browser' },
              { key: 'bookUpdates', label: 'Update Buku', desc: 'Buku baru dari penulis favorit' },
              { key: 'newReleases', label: 'Rilis Terbaru', desc: 'Buku baru yang dirilis' },
              { key: 'readingReminders', label: 'Pengingat Membaca', desc: 'Reminder untuk melanjutkan membaca' },
              { key: 'communityActivity', label: 'Aktivitas Komunitas', desc: 'Update dari teman dan komunitas' },
              { key: 'promotions', label: 'Promosi & Penawaran', desc: 'Diskon dan penawaran spesial' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.desc}
                  </p>
                </div>
                <Switch
                  checked={notifSettings[item.key as keyof typeof notifSettings]}
                  onCheckedChange={(checked) =>
                    setNotifSettings({ ...notifSettings, [item.key]: checked })
                  }
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveNotifications}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Settings Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Privasi & Keamanan</DialogTitle>
            <DialogDescription>
              Kontrol siapa yang dapat melihat informasi Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {[
              { key: 'profilePublic', label: 'Profil Publik', desc: 'Siapa saja dapat melihat profil Anda', icon: Eye },
              { key: 'showReadingActivity', label: 'Tampilkan Aktivitas Membaca', desc: 'Teman dapat melihat apa yang Anda baca', icon: BookOpen },
              { key: 'showFavorites', label: 'Tampilkan Favorit', desc: 'Publik dapat melihat buku favorit Anda', icon: Heart },
              { key: 'allowMessages', label: 'Izinkan Pesan', desc: 'Pengguna lain dapat mengirim pesan', icon: MessageSquare },
              { key: 'showAchievements', label: 'Tampilkan Pencapaian', desc: 'Pencapaian Anda terlihat publik', icon: Award },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings[item.key as keyof typeof privacySettings]}
                    onCheckedChange={(checked) =>
                      setPrivacySettings({ ...privacySettings, [item.key]: checked })
                    }
                  />
                </div>
              );
            })}

            <Separator />

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex gap-2">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900 dark:text-amber-100">
                  <p className="mb-1">Tip Keamanan:</p>
                  <p className="text-amber-800 dark:text-amber-200">
                    Untuk privasi maksimal, matikan semua opsi di atas. Data Anda tetap aman dan hanya Anda yang dapat mengaksesnya.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrivacyDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSavePrivacy}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
