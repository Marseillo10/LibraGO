import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowLeft, Crown, Check, Sparkles } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

interface SubscriptionScreenProps {
  onBack: () => void;
  onSubscribe: () => void;
}

export function SubscriptionScreen({ onBack, onSubscribe }: SubscriptionScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState("yearly");

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Library Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544132998-ae26c2655274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3MlMjBzaGVsdmVzfGVufDF8fHx8MTc2MTczODQyNnww&ixlib=rb-4.1.0&q=80&w=1080')`
        }}
      >
        {/* Dark overlay untuk readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-purple-900/90"></div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl" />
        <Sparkles className="absolute top-40 left-1/4 w-8 h-8 text-yellow-200 animate-pulse" />
        <Sparkles className="absolute bottom-40 right-1/3 w-6 h-6 text-orange-200 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
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
          <h2 className="text-white">Premium</h2>
        </div>
      </div>

      <div className="px-6 py-12 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center text-white mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-2xl">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="mb-4 flex items-center justify-center gap-2 drop-shadow-lg">
              <Sparkles className="w-8 h-8" />
              Upgrade ke Premium
            </h1>
            <p className="text-blue-100 text-lg">
              Dapatkan akses tanpa batas ke seluruh koleksi LibraGO
            </p>
          </div>

          {/* Plan Selection */}
          <Card className="p-8 mb-8">
            <h3 className="text-gray-900 dark:text-white mb-6 text-center">
              Pilih Paket Langganan
            </h3>

            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.recommended && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                        Paling Populer
                      </Badge>
                    )}

                    <div className="flex items-center gap-4">
                      <RadioGroupItem value={plan.id} id={plan.id} />
                      <Label
                        htmlFor={plan.id}
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-gray-900 dark:text-white mb-1">
                            {plan.name}
                          </h4>
                          {plan.savings && (
                            <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300">
                              {plan.savings}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 dark:text-white">
                            {formatPrice(plan.price)}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
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

          {/* Features */}
          <Card className="p-8 mb-8">
            <h3 className="text-gray-900 dark:text-white mb-6">
              Fitur Premium
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-1 shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Subscribe Button */}
          <Button
            onClick={onSubscribe}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 hover:from-yellow-500 hover:via-orange-500 hover:to-orange-600 text-white border-0 py-6"
            size="lg"
          >
            <Crown className="w-5 h-5 mr-2" />
            Berlangganan Sekarang
          </Button>

          <p className="text-center text-blue-100 text-sm mt-6">
            Pembayaran aman dan dapat dibatalkan kapan saja
          </p>
        </div>
      </div>
    </div>
  );
}
