import React, { useState } from "react";
import { Settings, User, Bell, Lock, Palette, Globe, Moon, Sun, Monitor, Eye, Download, Shield, LogOut, Trash2, Save } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Slider } from "../ui/slider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { toast } from "sonner";

interface UserData {
  name: string;
  email: string;
  isPremium: boolean;
  bio?: string;
  location?: string;
  birthDate?: string;
  joinDate?: string;
  level?: number;
  xp?: number;
  nextXp?: number;
  nextLevel?: number;
}

interface SettingsScreenProps {
  user: UserData;
  onUpdateProfile: (data: Partial<UserData>) => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (screen: string) => void;
}

import { useBooks } from "../../context/BooksContext";

// ... (imports remain the same)

const SettingsScreen = ({
  user: initialUser, // Ignore prop
  onUpdateProfile, // Ignore prop
  onLogout,
  darkMode,
  onToggleDarkMode,
  onNavigate,
}: SettingsScreenProps) => {
  const { userProfile, settings, updateSettings, updateProfile } = useBooks();

  // Account Settings
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);

  // Notification Settings
  const [notifications, setNotifications] = useState(settings.notifications);

  // Appearance Settings
  const [theme, setTheme] = useState(settings.theme);
  const [accentColor, setAccentColor] = useState("blue");

  // Reading Preferences
  const [readingPreferences, setReadingPreferences] = useState(settings.readingPreferences);

  // Privacy Settings
  const [privacy, setPrivacy] = useState(settings.privacy);

  // Data & Storage
  const [autoDownload, setAutoDownload] = useState(settings.download.autoDownload);
  const [downloadQuality, setDownloadQuality] = useState(settings.download.quality);

  const handleSaveProfile = () => {
    updateProfile({ name, email });
    toast.success("Profil berhasil diperbarui");
  };

  const handleLogout = () => {
    onLogout();
    toast.success("Berhasil logout");
  };

  const handleDeleteAccount = () => {
    toast.success("Akun berhasil dihapus");
    onLogout();
  };

  // Update settings when local state changes (debounced or on specific actions could be better, but direct update for now)
  // For simplicity in this refactor, we'll just update local state and assume "Save" buttons or effects would sync to context if we had a backend.
  // But since we have updateSettings in context, let's use it for toggles.

  const updateContextSettings = (newSettings: any) => {
    updateSettings(newSettings);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${darkMode ? "bg-transparent" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">Pengaturan</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kelola preferensi aplikasi Anda
            </p>
          </div>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          {/* Scrollable Tabs for Mobile */}
          <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5">
              <TabsTrigger value="account" className="flex-shrink-0">Akun</TabsTrigger>
              <TabsTrigger value="notifications" className="flex-shrink-0">Notifikasi</TabsTrigger>
              <TabsTrigger value="appearance" className="flex-shrink-0">Tampilan</TabsTrigger>
              <TabsTrigger value="reading" className="flex-shrink-0">Membaca</TabsTrigger>
              <TabsTrigger value="privacy" className="flex-shrink-0">Privasi</TabsTrigger>
            </TabsList>
          </div>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-gray-900 dark:text-white">Informasi Profil</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} className="gap-2">
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-gray-900 dark:text-white">Keamanan</h3>
                </div>

                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Lock className="w-4 h-4" />
                    Ubah Password
                  </Button>

                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Shield className="w-4 h-4" />
                    Aktifkan Two-Factor Authentication
                  </Button>

                  <Separator />

                  <div className="space-y-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start gap-2 text-red-600 hover:text-red-700">
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Logout dari akun?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Anda akan keluar dari semua perangkat.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout}>
                            Logout
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start gap-2 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                          Hapus Akun
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus akun permanen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Aksi ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                            Hapus Akun
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-gray-900 dark:text-white">Preferensi Notifikasi</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-books">Buku Baru</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notifikasi saat ada buku baru dari penulis favorit
                    </p>
                  </div>
                  <Switch
                    id="new-books"
                    checked={notifications.newBooks}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications({ ...notifications, newBooks: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminders">Pengingat Membaca</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Reminder untuk melanjutkan buku yang sedang dibaca
                    </p>
                  </div>
                  <Switch
                    id="reminders"
                    checked={notifications.readingReminders}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications({ ...notifications, readingReminders: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="achievements">Achievement</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notifikasi saat mendapatkan achievement baru
                    </p>
                  </div>
                  <Switch
                    id="achievements"
                    checked={notifications.achievements}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications({ ...notifications, achievements: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="social">Aktivitas Sosial</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Review, komentar, dan interaksi dari user lain
                    </p>
                  </div>
                  <Switch
                    id="social"
                    checked={notifications.socialActivity}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications({ ...notifications, socialActivity: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsletter">Newsletter</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tips membaca dan rekomendasi mingguan
                    </p>
                  </div>
                  <Switch
                    id="newsletter"
                    checked={notifications.newsletter}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications({ ...notifications, newsletter: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="premium-expiry">Subscription Premium</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Alert saat subscription akan berakhir
                    </p>
                  </div>
                  <Switch
                    id="premium-expiry"
                    checked={notifications.premiumExpiry}
                    onCheckedChange={(checked: boolean) =>
                      setNotifications({ ...notifications, premiumExpiry: checked })
                    }
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-5 h-5 text-blue-600" />
                  <h3 className="text-gray-900 dark:text-white">Tema</h3>
                </div>

                <RadioGroup value={theme} onValueChange={setTheme}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Sun className="w-5 h-5 text-amber-500" />
                        <div>
                          <Label htmlFor="light">Light Mode</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tema terang untuk siang hari
                          </p>
                        </div>
                      </div>
                      <RadioGroupItem value="light" id="light" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-blue-600" />
                        <div>
                          <Label htmlFor="dark">Dark Mode</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tema gelap untuk malam hari
                          </p>
                        </div>
                      </div>
                      <RadioGroupItem value="dark" id="dark" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-gray-600" />
                        <div>
                          <Label htmlFor="system">System</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ikuti pengaturan sistem
                          </p>
                        </div>
                      </div>
                      <RadioGroupItem value="system" id="system" />
                    </div>
                  </div>
                </RadioGroup>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-5 h-5 text-blue-600" />
                  <h3 className="text-gray-900 dark:text-white">Warna Aksen</h3>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: "blue", color: "bg-blue-600" },
                    { name: "purple", color: "bg-purple-600" },
                    { name: "green", color: "bg-green-600" },
                    { name: "orange", color: "bg-orange-600" },
                    { name: "pink", color: "bg-pink-600" },
                    { name: "red", color: "bg-red-600" },
                    { name: "teal", color: "bg-teal-600" },
                    { name: "amber", color: "bg-amber-600" },
                  ].map((colorOption) => (
                    <button
                      key={colorOption.name}
                      onClick={() => setAccentColor(colorOption.name)}
                      className={`h-12 rounded-lg ${colorOption.color} transition-all ${accentColor === colorOption.name
                        ? "ring-4 ring-offset-2 ring-blue-600 dark:ring-offset-slate-900"
                        : "hover:scale-105"
                        }`}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Reading Preferences Tab */}
          <TabsContent value="reading">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="text-gray-900 dark:text-white">Preferensi Membaca</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <Label>Ukuran Font: {readingPreferences.fontSize}px</Label>
                  <Slider
                    min={12}
                    max={24}
                    step={1}
                    value={[readingPreferences.fontSize]}
                    onValueChange={(value: number[]) =>
                      setReadingPreferences({ ...readingPreferences, fontSize: value[0] })
                    }
                    className="mt-2"
                  />
                </div>

                <Separator />

                <div>
                  <Label>Line Height: {readingPreferences.lineHeight}</Label>
                  <Slider
                    min={1.2}
                    max={2.0}
                    step={0.1}
                    value={[readingPreferences.lineHeight]}
                    onValueChange={(value: number[]) =>
                      setReadingPreferences({ ...readingPreferences, lineHeight: value[0] })
                    }
                    className="mt-2"
                  />
                </div>

                <Separator />

                <div>
                  <Label>Mode Membaca</Label>
                  <Select
                    value={readingPreferences.readingMode}
                    onValueChange={(value: string) =>
                      setReadingPreferences({ ...readingPreferences, readingMode: value as "scroll" | "paginated" })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paginated">Paginated (Halaman per Halaman)</SelectItem>
                      <SelectItem value="scroll">Scroll (Continuous)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <Label>Transisi Halaman</Label>
                  <Select
                    value={readingPreferences.pageTransition}
                    onValueChange={(value: string) =>
                      setReadingPreferences({ ...readingPreferences, pageTransition: value as "slide" | "curl" | "none" })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slide">Slide</SelectItem>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="curl">Page Curl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-bookmark">Auto Bookmark</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Simpan halaman terakhir secara otomatis
                    </p>
                  </div>
                  <Switch
                    id="auto-bookmark"
                    checked={readingPreferences.autoBookmark}
                    onCheckedChange={(checked: boolean) =>
                      setReadingPreferences({ ...readingPreferences, autoBookmark: checked })
                    }
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-gray-900 dark:text-white">Privacy & Keamanan</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile-public">Profil Publik</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Izinkan user lain melihat profil Anda
                      </p>
                    </div>
                    <Switch
                      id="profile-public"
                      checked={privacy.profilePublic}
                      onCheckedChange={(checked: boolean) =>
                        setPrivacy({ ...privacy, profilePublic: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-activity">Tampilkan Aktivitas Membaca</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Izinkan user lain melihat buku yang Anda baca
                      </p>
                    </div>
                    <Switch
                      id="show-activity"
                      checked={privacy.showReadingActivity}
                      onCheckedChange={(checked: boolean) =>
                        setPrivacy({ ...privacy, showReadingActivity: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="recommendations">Rekomendasi Personal</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gunakan data membaca untuk rekomendasi yang lebih baik
                      </p>
                    </div>
                    <Switch
                      id="recommendations"
                      checked={privacy.allowRecommendations}
                      onCheckedChange={(checked: boolean) =>
                        setPrivacy({ ...privacy, allowRecommendations: checked })
                      }
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Download className="w-5 h-5 text-blue-600" />
                  <h3 className="text-gray-900 dark:text-white">Data & Storage</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-download">Auto Download</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Download buku otomatis untuk offline reading
                      </p>
                    </div>
                    <Switch
                      id="auto-download"
                      checked={autoDownload}
                      onCheckedChange={setAutoDownload}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label>Kualitas Download</Label>
                    <Select value={downloadQuality} onValueChange={setDownloadQuality}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Hemat Storage)</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High (Kualitas Terbaik)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <Button variant="outline" className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Export Data Saya
                  </Button>

                  <Button variant="outline" className="w-full gap-2 text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                    Hapus Cache & Data Lokal
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsScreen;
