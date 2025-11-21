import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, BookOpen, Users, TrendingUp } from "lucide-react";
import { Separator } from "../ui/separator";
import { LibraGoLogo } from "../LibraGoLogo";
import { Badge } from "../ui/badge";
import { GoogleIcon, AppleIcon, FacebookIcon } from "../icons/SocialIcons";

interface LoginScreenProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
}

export function LoginScreen({ onLogin, onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    onLogin();
  };

  const stats = [
    { icon: BookOpen, label: "10K+ Buku", color: "text-blue-400" },
    { icon: Users, label: "50K+ Pembaca", color: "text-purple-400" },
    { icon: TrendingUp, label: "Rating 4.9", color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-gray-950 opacity-95" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <LibraGoLogo size="lg" showText={false} />
              <div>
                <h1 className="text-4xl text-white">LibraGO</h1>
                <p className="text-blue-400 text-sm">Your Digital Library</p>
              </div>
            </div>
            
            <h2 className="text-5xl text-white leading-tight">
              Baca Ribuan Buku
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Kapan Saja, Di Mana Saja
              </span>
            </h2>
            
            <p className="text-gray-400 text-lg max-w-md">
              Platform e-book terlengkap dengan fitur canggih untuk pengalaman membaca yang tak terlupakan.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <Icon className={`w-6 h-6 ${stat.color} mb-2`} />
                  <p className="text-white text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <span>Rekomendasi Personal dengan AI</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-400" />
              </div>
              <span>Pembaca dengan 20+ Fitur Canggih</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <span>Komunitas Pembaca Aktif</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-[480px]">
          <Card className="p-6 md:p-8 bg-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl">
            {/* Mobile Logo */}
            <div className="flex lg:hidden flex-col items-center mb-8">
              <LibraGoLogo size="md" showText={false} />
              <h1 className="text-white mt-4 mb-1 text-2xl">LibraGO</h1>
              <p className="text-gray-400 text-sm">Perpustakaan Digital Modern</p>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl text-white mb-2">Selamat Datang Kembali</h2>
              <p className="text-gray-400 text-sm">Masuk untuk melanjutkan membaca</p>
            </div>

            {/* SSO Options */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Button 
                variant="outline" 
                className="w-full bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                type="button"
              >
                <GoogleIcon className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                type="button"
              >
                <AppleIcon className="w-6 h-6" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                type="button"
              >
                <FacebookIcon className="w-5 h-5" />
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <Separator className="bg-gray-700" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 px-3 text-gray-400 text-xs">
                atau
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300 text-sm">Kata Sandi</label>
                  <button 
                    type="button" 
                    className="text-blue-400 text-xs hover:text-blue-300 transition-colors"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-11 mt-6 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-6">
              <span className="text-gray-400 text-sm">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Daftar Gratis
                </button>
              </span>
            </div>

            {/* Beta Badge */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10">
                <Sparkles className="w-3 h-3 mr-1" />
                Beta v2.0
              </Badge>
            </div>
          </Card>

          {/* Mobile Stats */}
          <div className="lg:hidden grid grid-cols-3 gap-3 mt-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 text-center">
                  <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                  <p className="text-white text-xs">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Blob Animation CSS */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}