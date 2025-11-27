import React, { useState } from "react";
import { Heart, Coffee, Star, Zap, Crown, Users, Gift, ChevronRight, CreditCard, Wallet, Building2, Smartphone, Target, CheckCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

const SupportScreen = ({ darkMode }: { darkMode: boolean }) => {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const tiers = [
    {
      id: "coffee",
      name: "Buy Me a Coffee",
      icon: Coffee,
      amount: 10000,
      color: "from-amber-400 to-orange-500",
      benefits: [
        "Support pengembangan aplikasi",
        "Nama Anda di Hall of Fame",
        "Terima kasih personal dari developer",
      ],
    },
    {
      id: "supporter",
      name: "Supporter",
      icon: Heart,
      amount: 50000,
      color: "from-pink-400 to-rose-500",
      popular: true,
      benefits: [
        "Semua benefit Coffee tier",
        "Early access untuk fitur baru",
        "Badge Supporter di profil",
        "Priority support",
      ],
    },
    {
      id: "patron",
      name: "Patron",
      icon: Star,
      amount: 100000,
      color: "from-purple-400 to-indigo-500",
      benefits: [
        "Semua benefit Supporter tier",
        "Akses eksklusif ke development updates",
        "Vote untuk fitur yang akan dikembangkan",
        "Custom badge di profil",
        "Lifetime supporter status",
      ],
    },
    {
      id: "champion",
      name: "Champion",
      icon: Crown,
      amount: 250000,
      color: "from-yellow-400 to-amber-500",
      benefits: [
        "Semua benefit Patron tier",
        "Nama Anda di About page aplikasi",
        "1-on-1 video call dengan developer",
        "Custom feature request",
        "Akses ke private Discord channel",
      ],
    },
  ];

  const stats = {
    supporters: 1247,
    monthlyGoal: 10000000,
    currentMonthly: 6750000,
  };

  const goalProgress = (stats.currentMonthly / stats.monthlyGoal) * 100;

  const recentSupporters = [
    { name: "Ahmad R.", amount: 50000, tier: "supporter", date: "2 jam lalu" },
    { name: "Siti M.", amount: 100000, tier: "patron", date: "5 jam lalu" },
    { name: "Budi S.", amount: 10000, tier: "coffee", date: "1 hari lalu" },
    { name: "Diana P.", amount: 50000, tier: "supporter", date: "1 hari lalu" },
    { name: "Eko W.", amount: 250000, tier: "champion", date: "2 hari lalu" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const paymentMethods = [
    { id: "gopay", name: "GoPay", icon: Smartphone, type: "e-wallet" },
    { id: "ovo", name: "OVO", icon: Smartphone, type: "e-wallet" },
    { id: "dana", name: "DANA", icon: Smartphone, type: "e-wallet" },
    { id: "shopeepay", name: "ShopeePay", icon: Smartphone, type: "e-wallet" },
    { id: "bca", name: "BCA Virtual Account", icon: Building2, type: "bank" },
    { id: "mandiri", name: "Mandiri Virtual Account", icon: Building2, type: "bank" },
    { id: "bri", name: "BRI Virtual Account", icon: Building2, type: "bank" },
    { id: "bni", name: "BNI Virtual Account", icon: Building2, type: "bank" },
    { id: "credit-card", name: "Credit/Debit Card", icon: CreditCard, type: "card" },
  ];

  const handleSupport = (tierId: string, amount: number) => {
    setPaymentAmount(amount);
    setShowPaymentDialog(true);
  };

  const handleCustomSupport = () => {
    const amount = parseInt(customAmount);
    if (amount && amount >= 5000) {
      setPaymentAmount(amount);
      setShowPaymentDialog(true);
    } else {
      toast.error("Minimum donasi adalah Rp 5.000");
    }
  };

  const handlePaymentConfirm = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setShowPaymentDialog(false);
    setCustomAmount("");
    setSelectedPaymentMethod("");

    toast.success("Pembayaran Berhasil! 💖", {
      description: `Terima kasih atas dukungan ${formatCurrency(paymentAmount)}. Anda luar biasa!`,
      duration: 5000,
    });
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${darkMode ? "bg-transparent" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-white mb-3">
            Dukung LibraGO
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Bantu kami terus mengembangkan LibraGO menjadi platform e-book terbaik untuk Anda.
            Setiap dukungan sangat berarti! 💖
          </p>
        </div>

        {/* Monthly Goal */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="text-gray-900 dark:text-white">Target Bulanan</h3>
            </div>
            <Badge className="bg-blue-600">
              {stats.supporters.toLocaleString()} Supporters
            </Badge>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-gray-900 dark:text-white">
                {formatCurrency(stats.currentMonthly)} / {formatCurrency(stats.monthlyGoal)}
              </span>
            </div>
            <Progress value={goalProgress} className="h-3" />
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {goalProgress.toFixed(0)}% tercapai - {formatCurrency(stats.monthlyGoal - stats.currentMonthly)} lagi untuk mencapai target
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dana digunakan untuk server, pengembangan fitur baru, dan operasional aplikasi
          </p>
        </Card>

        <Tabs defaultValue="support" className="space-y-6">
          <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-3">
              <TabsTrigger value="support" className="flex-shrink-0">Dukung Kami</TabsTrigger>
              <TabsTrigger value="supporters" className="flex-shrink-0">Supporters</TabsTrigger>
              <TabsTrigger value="updates" className="flex-shrink-0">Updates</TabsTrigger>
            </TabsList>
          </div>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            {/* Tiers */}
            <div className="grid md:grid-cols-2 gap-6">
              {tiers.map((tier) => {
                const Icon = tier.icon;
                const isSelected = selectedTier === tier.id;

                return (
                  <Card
                    key={tier.id}
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg relative ${isSelected ? "ring-4 ring-blue-500" : ""
                      }`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        Most Popular
                      </Badge>
                    )}

                    <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-br ${tier.color} text-white mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-gray-900 dark:text-white mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-3xl text-gray-900 dark:text-white mb-4">
                      {formatCurrency(tier.amount)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">/bulan</span>
                    </p>

                    <ul className="space-y-2 mb-6">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${isSelected ? "" : "variant-outline"}`}
                      onClick={() => handleSupport(tier.id, tier.amount)}
                    >
                      Pilih Tier Ini
                    </Button>
                  </Card>
                );
              })}
            </div>

            {/* Custom Amount */}
            <Card className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">
                Atau Dukung dengan Nominal Custom
              </h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="custom-amount">Jumlah (minimum Rp 5.000)</Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="50000"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCustomSupport} className="gap-2">
                    <Gift className="w-5 h-5" />
                    Dukung
                  </Button>
                </div>
              </div>
            </Card>

            {/* Payment Methods */}
            <Card className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">
                Metode Pembayaran
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["GoPay", "OVO", "Dana", "ShopeePay", "BCA", "Mandiri", "BRI", "BNI"].map((method) => (
                  <Button
                    key={method}
                    variant="outline"
                    className="h-12"
                  >
                    {method}
                  </Button>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Supporters Tab */}
          <TabsContent value="supporters">
            <Card className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">
                Supporter Terbaru
              </h3>
              <div className="space-y-4">
                {recentSupporters.map((supporter, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {supporter.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          {supporter.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {supporter.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrency(supporter.amount)}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {supporter.tier}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <Card className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">
                Development Updates
              </h3>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-4">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">
                    29 Oktober 2024
                  </p>
                  <h4 className="text-gray-900 dark:text-white mb-2">
                    Fitur Baru: Reading Analytics & Goals
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Kami telah menambahkan fitur analytics lengkap dan goal tracking untuk membantu Anda mencapai target membaca!
                  </p>
                </div>

                <div className="border-l-4 border-green-600 pl-4">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">
                    15 Oktober 2024
                  </p>
                  <h4 className="text-gray-900 dark:text-white mb-2">
                    Peningkatan Performa
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading time berkurang 40% dan penggunaan memori lebih efisien.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-4">
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">
                    1 Oktober 2024
                  </p>
                  <h4 className="text-gray-900 dark:text-white mb-2">
                    Dark Mode Improvements
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Dark mode sekarang lebih nyaman di mata dengan contrast yang lebih baik.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Proses Pembayaran</DialogTitle>
            <DialogDescription>
              Pilih metode pembayaran untuk mendukung LibraGO
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Amount Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Pembayaran</span>
                <span className="text-2xl text-gray-900 dark:text-white">
                  {formatCurrency(paymentAmount)}
                </span>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <Label className="text-base mb-3 block">Metode Pembayaran</Label>
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <div className="space-y-2">
                  {/* E-Wallets */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">E-Wallet</p>
                    {paymentMethods.filter(m => m.type === 'e-wallet').map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <label htmlFor={method.id} className="flex-1 cursor-pointer text-sm">
                            {method.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bank Transfer */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Transfer Bank</p>
                    {paymentMethods.filter(m => m.type === 'bank').map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <label htmlFor={method.id} className="flex-1 cursor-pointer text-sm">
                            {method.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {/* Credit Card */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Kartu Kredit/Debit</p>
                    {paymentMethods.filter(m => m.type === 'card').map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <label htmlFor={method.id} className="flex-1 cursor-pointer text-sm">
                            {method.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Benefits Reminder */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex gap-2">
                <Heart className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900 dark:text-amber-100">
                  <p className="mb-1">Dengan dukungan Anda:</p>
                  <ul className="space-y-1 text-amber-800 dark:text-amber-200">
                    <li>• Server tetap online 24/7</li>
                    <li>• Pengembangan fitur baru</li>
                    <li>• Penambahan koleksi buku</li>
                    <li>• Support tim developer</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Batal
              </Button>
              <Button
                onClick={handlePaymentConfirm}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!selectedPaymentMethod || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Bayar Sekarang
                  </>
                )}
              </Button>
            </div>

            {/* Security Notice */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              🔒 Pembayaran aman dan terenkripsi
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportScreen;
