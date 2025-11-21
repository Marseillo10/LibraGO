import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap, Heart } from "lucide-react";
import { Separator } from "../ui/separator";
import { LibraGoLogo } from "../LibraGoLogo";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner@2.0.3";
import { GoogleIcon, AppleIcon, FacebookIcon } from "../icons/SocialIcons";

interface RegisterScreenProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
}

export function RegisterScreen({ onRegister, onNavigateToLogin }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Kata sandi tidak cocok!");
      return;
    }
    
    if (!agreedToTerms) {
      toast.error("Anda harus menyetujui syarat & ketentuan");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Akun berhasil dibuat!");
    setIsLoading(false);
    onRegister();
  };

  const benefits = [
    { icon: Shield, label: "Gratis selamanya", color: "text-blue-400" },
    { icon: Zap, label: "Akses 10,000+ buku", color: "text-purple-400" },
    { icon: Heart, label: "Sinkronisasi otomatis", color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-gray-950 opacity-95" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        
        {/* Left Side - Benefits (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <LibraGoLogo size="lg" showText={false} />
              <div>
                <h1 className="text-4xl text-white">LibraGO</h1>
                <p className="text-purple-400 text-sm">Your Digital Library</p>
              </div>
            </div>
            
            <h2 className="text-5xl text-white leading-tight">
              Mulai Petualangan
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Membaca Anda
              </span>
            </h2>
            
            <p className="text-gray-400 text-lg max-w-md">
              Bergabung dengan 50,000+ pembaca yang telah menemukan dunia pengetahuan tak terbatas.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700`}>
                    <Icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <span className="text-white text-lg">{benefit.label}</span>
                </div>
              );
            })}
          </div>

          {/* Testimonial */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30">
            <p className="text-gray-300 italic mb-4">
              "LibraGO mengubah cara saya membaca. Fitur-fiturnya luar biasa dan koleksinya sangat lengkap!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
              <div>
                <p className="text-white text-sm">Sarah Wijaya</p>
                <p className="text-gray-400 text-xs">Mahasiswa UI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-[480px]">
          <Card className="p-6 md:p-8 bg-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl">
            {/* Mobile Logo */}
            <div className="flex lg:hidden flex-col items-center mb-8">
              <LibraGoLogo size="md" showText={false} />
              <h1 className="text-white mt-4 mb-1 text-2xl">LibraGO</h1>
              <p className="text-gray-400 text-sm">Daftar gratis sekarang</p>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl text-white mb-2">Buat Akun Baru</h2>
              <p className="text-gray-400 text-sm">Gratis selamanya, tanpa kartu kredit</p>
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
                atau dengan email
              </span>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Dr. Alisa Prasetyo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-purple-500 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-purple-500 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-purple-500 h-11"
                    required
                    minLength={8}
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

              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus-visible:ring-purple-500 h-11"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                  Saya setuju dengan{" "}
                  <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Syarat & Ketentuan</span> dan{" "}
                  <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Kebijakan Privasi</span>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-11 mt-6 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Membuat akun...
                  </>
                ) : (
                  <>
                    Daftar Gratis
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <span className="text-gray-400 text-sm">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  Masuk
                </button>
              </span>
            </div>

            {/* Beta Badge */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <Badge variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10">
                <Sparkles className="w-3 h-3 mr-1" />
                Gratis Selamanya
              </Badge>
            </div>
          </Card>

          {/* Mobile Benefits */}
          <div className="lg:hidden space-y-3 mt-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-center gap-3 bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                  <Icon className={`w-5 h-5 ${benefit.color}`} />
                  <span className="text-white text-sm">{benefit.label}</span>
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