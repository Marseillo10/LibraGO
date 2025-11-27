import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, Crown, Check, Sparkles, Smartphone, Building2, CreditCard, CheckCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { toast } from "sonner";
import { useBooks } from "../../context/BooksContext";

interface SubscriptionScreenProps {
  onBack: () => void;
  onSubscribe: () => void;
}

export function SubscriptionScreen({ onBack, onSubscribe, darkMode }: { onBack: () => void; onSubscribe: () => void; darkMode: boolean }) {
  const { updateProfile, userProfile } = useBooks();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const plans = [
    {
      id: "monthly",
      name: "Bulanan",
      price: 49000,
      period: "/bulan",
      savings: null,
    },
    {
      id: "yearly",
      name: "Tahunan",
      price: 399000,
      period: "/tahun",
      savings: "Hemat 32%",
      recommended: true,
    },
  ];

  const features = [
    "Akses unlimited ke 10,000+ buku dan jurnal",
    "Download buku untuk dibaca offline",
    "Tanpa iklan",
    "Akses eksklusif ke konten premium",
    "Sinkronisasi antar perangkat",
    "Dukungan prioritas 24/7",
    "Export sitasi ke Zotero & Mendeley",
    "Highlight dan catatan tanpa batas",
  ];

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubscribeClick = () => {
    if (userProfile.isPremium) {
      toast.info("Anda sudah berlangganan Premium!");
      return;
    }
    setShowPaymentDialog(true);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    setPaymentStatus('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setPaymentStatus('success');
    updateProfile({ isPremium: true });

    // Show success state for a moment before closing or let user close
    toast.success("Upgrade Berhasil! 👑", {
      description: "Selamat menikmati fitur Premium LibraGO.",
      duration: 5000,
    });
  };

  const handleClose = () => {
    if (paymentStatus === 'success') {
      onSubscribe(); // Navigate away or refresh
    }
    setShowPaymentDialog(false);
    setPaymentStatus('idle');
    setSelectedPaymentMethod("");
  };

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);

  return (
    <div className={`min-h-screen relative overflow-hidden ${darkMode ? "bg-transparent" : "bg-white"}`}>
      {/* ... (Background and Header remain same) ... */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544132998-ae26c2655274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3MlMjBzaGVsdmVzfGVufDF8fHx8MTc2MTczODQyNnww&ixlib=rb-4.1.0&q=80&w=1080')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-purple-900/90"></div>
      </div>

      <div className="absolute inset-0 opacity-10 z-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl" />
        <Sparkles className="absolute top-40 left-1/4 w-8 h-8 text-yellow-200 animate-pulse" />
        <Sparkles className="absolute bottom-40 right-1/3 w-6 h-6 text-orange-200 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="sticky top-0 z-20 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-white font-medium">Premium</h2>
        </div>
      </div>

      <div className="px-6 py-12 lg:px-12 relative z-10 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-white mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-2xl animate-bounce-slow">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="mb-4 flex items-center justify-center gap-2 drop-shadow-lg text-3xl md:text-4xl font-bold">
              <Sparkles className="w-8 h-8 text-yellow-300" />
              Upgrade ke Premium
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Dapatkan akses tanpa batas ke seluruh koleksi LibraGO dan nikmati pengalaman membaca terbaik.
            </p>
          </div>

          <Card className="p-8 mb-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-xl border-0">
            <h3 className="text-gray-900 dark:text-white mb-6 text-center text-xl font-semibold">
              Pilih Paket Langganan
            </h3>

            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${selectedPlan === plan.id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md transform scale-[1.02]"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.recommended && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1 shadow-sm">
                        Paling Populer
                      </Badge>
                    )}

                    <div className="flex items-center gap-4">
                      <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                      <Label
                        htmlFor={plan.id}
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {plan.name}
                          </h4>
                          {plan.savings && (
                            <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 font-medium">
                              {plan.savings}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(plan.price)}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {plan.period}
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          <Card className="p-8 mb-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-xl border-0">
            <h3 className="text-gray-900 dark:text-white mb-6 text-xl font-semibold">
              Fitur Premium
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full p-1 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{feature}</p>
                </div>
              ))}
            </div>
          </Card>

          <Button
            onClick={handleSubscribeClick}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 hover:from-yellow-500 hover:via-orange-500 hover:to-orange-600 text-white border-0 py-8 text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            size="lg"
          >
            <Crown className="w-6 h-6 mr-2" />
            {userProfile.isPremium ? "Perpanjang Langganan" : "Berlangganan Sekarang"}
          </Button>

          <p className="text-center text-blue-100 text-sm mt-6 font-medium opacity-80">
            Pembayaran aman dan dapat dibatalkan kapan saja
          </p>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={(open: boolean) => {
        if (!open && paymentStatus !== 'processing') {
          handleClose();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          {paymentStatus === 'success' ? (
            <div className="py-8 flex flex-col items-center text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Pembayaran Berhasil!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Selamat, akun Anda kini sudah Premium. Nikmati akses tanpa batas!
              </p>
              <Button
                onClick={handleClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Mulai Membaca
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Proses Pembayaran</DialogTitle>
                <DialogDescription>
                  Selesaikan pembayaran untuk mengaktifkan Premium
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Paket</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Premium {selectedPlanDetails?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(selectedPlanDetails?.price || 0)}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-base mb-3 block font-medium">Metode Pembayaran</Label>
                  <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="max-h-[240px] overflow-y-auto pr-2 scrollbar-thin">
                    <div className="space-y-2">
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">E-Wallet</p>
                        {paymentMethods.filter(m => m.type === 'e-wallet').map((method) => {
                          const Icon = method.icon;
                          return (
                            <div
                              key={method.id}
                              className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPaymentMethod === method.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                              onClick={() => setSelectedPaymentMethod(method.id)}
                            >
                              <RadioGroupItem value={method.id} id={method.id} />
                              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              <label htmlFor={method.id} className="flex-1 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200">
                                {method.name}
                              </label>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Transfer Bank</p>
                        {paymentMethods.filter(m => m.type === 'bank').map((method) => {
                          const Icon = method.icon;
                          return (
                            <div
                              key={method.id}
                              className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPaymentMethod === method.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                              onClick={() => setSelectedPaymentMethod(method.id)}
                            >
                              <RadioGroupItem value={method.id} id={method.id} />
                              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              <label htmlFor={method.id} className="flex-1 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200">
                                {method.name}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentDialog(false)}
                    className="flex-1"
                    disabled={paymentStatus === 'processing'}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handlePaymentConfirm}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                    disabled={!selectedPaymentMethod || paymentStatus === 'processing'}
                  >
                    {paymentStatus === 'processing' ? (
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

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  <Smartphone className="w-3 h-3" /> Pembayaran aman & instan
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
