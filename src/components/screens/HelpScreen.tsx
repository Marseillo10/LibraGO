import React, { useState } from "react";
import { HelpCircle, Search, MessageCircle, Book, Mail, Phone, FileText, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const HelpScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
    email: "",
  });

  const faqData: FAQItem[] = [
    {
      id: "1",
      category: "Akun",
      question: "Bagaimana cara membuat akun LibraGO?",
      answer: "Anda dapat membuat akun dengan mengklik tombol 'Daftar' di halaman login. Isi formulir dengan nama, email, dan password. Anda juga bisa mendaftar menggunakan akun Google, Facebook, atau Apple.",
    },
    {
      id: "2",
      category: "Akun",
      question: "Lupa password, bagaimana cara reset?",
      answer: "Klik 'Lupa Password' di halaman login, masukkan email Anda, dan kami akan mengirimkan link reset password ke email Anda. Link berlaku selama 24 jam.",
    },
    {
      id: "3",
      category: "Subscription",
      question: "Apa perbedaan akun gratis dan premium?",
      answer: "Akun Premium memberikan akses ke semua buku premium, tanpa iklan, offline reading unlimited, sync antar device, dan fitur advanced seperti highlighting & notes yang unlimited. Akun gratis memiliki keterbatasan akses konten dan fitur.",
    },
    {
      id: "4",
      category: "Subscription",
      question: "Bagaimana cara upgrade ke Premium?",
      answer: "Buka menu Subscription dari sidebar atau profile, pilih paket yang sesuai (Monthly atau Yearly), dan lakukan pembayaran. Anda bisa membayar via credit card, e-wallet, atau transfer bank.",
    },
    {
      id: "5",
      category: "Subscription",
      question: "Apakah bisa cancel subscription?",
      answer: "Ya, Anda bisa cancel subscription kapan saja dari menu Subscription. Akses premium Anda akan tetap aktif hingga akhir periode billing, setelah itu akan otomatis kembali ke akun gratis.",
    },
    {
      id: "6",
      category: "Membaca",
      question: "Bagaimana cara download buku untuk offline?",
      answer: "Klik ikon download di detail buku atau reader. Buku yang sudah didownload bisa diakses dari menu 'Downloads' di koleksi Anda, dan bisa dibaca tanpa koneksi internet.",
    },
    {
      id: "7",
      category: "Membaca",
      question: "Bagaimana cara mengatur ukuran font dan tema reader?",
      answer: "Buka reader, klik ikon pengaturan (gear icon) di pojok kanan atas. Anda bisa mengatur font size, font family, line spacing, theme (light/dark/sepia), dan margin.",
    },
    {
      id: "8",
      category: "Membaca",
      question: "Apakah progress membaca saya akan tersimpan?",
      answer: "Ya, progress membaca otomatis tersimpan dan akan di-sync ke semua device yang login dengan akun yang sama. Anda bisa lanjut membaca dari device mana saja.",
    },
    {
      id: "9",
      category: "Fitur",
      question: "Bagaimana cara membuat highlight dan notes?",
      answer: "Saat membaca, select text yang ingin di-highlight, lalu pilih warna highlight. Untuk menambahkan note, klik ikon note setelah highlight. Semua highlight dan notes bisa diakses dari menu Highlights di detail buku.",
    },
    {
      id: "10",
      category: "Fitur",
      question: "Apa itu Reading Goals dan bagaimana cara menggunakannya?",
      answer: "Reading Goals adalah fitur untuk set target membaca Anda (misalnya 50 buku per tahun). Buka menu Goals, buat target baru, dan aplikasi akan tracking progress Anda secara otomatis.",
    },
    {
      id: "11",
      category: "Fitur",
      question: "Bagaimana cara export citation untuk paper?",
      answer: "Di detail buku, klik tombol 'Cite', pilih format citation (APA, MLA, Chicago), dan copy atau export ke Zotero/Mendeley. Fitur ini berguna untuk mahasiswa dan peneliti.",
    },
    {
      id: "12",
      category: "Teknis",
      question: "Aplikasi tidak bisa login, apa yang harus dilakukan?",
      answer: "Pastikan koneksi internet stabil, clear browser cache, atau coba browser lain. Jika masih bermasalah, hubungi support dengan melampirkan screenshot error message.",
    },
    {
      id: "13",
      category: "Teknis",
      question: "Buku tidak bisa dibuka atau error saat membaca?",
      answer: "Coba refresh halaman atau re-download buku. Pastikan storage device Anda cukup. Jika masih error, laporkan ke support dengan menyebutkan judul buku dan jenis error.",
    },
  ];

  const categories = Array.from(new Set(faqData.map(faq => faq.category)));

  const filteredFAQs = faqData.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitSupport = () => {
    if (!supportForm.subject || !supportForm.message || !supportForm.email) {
      toast.error("Mohon lengkapi semua field");
      return;
    }
    toast.success("Pesan terkirim! Tim kami akan merespons dalam 1x24 jam");
    setSupportForm({ subject: "", message: "", email: "" });
  };

  const quickLinks = [
    { title: "Tutorial Pemula", icon: Book, description: "Panduan lengkap untuk memulai" },
    { title: "Video Tutorial", icon: FileText, description: "Tutorial video step-by-step" },
    { title: "Community Forum", icon: MessageCircle, description: "Diskusi dengan user lain" },
    { title: "API Documentation", icon: ExternalLink, description: "Untuk developer" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-gray-900 dark:text-white mb-2">Pusat Bantuan</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Temukan jawaban untuk pertanyaan Anda atau hubungi tim support
          </p>
        </div>

        {/* Search */}
        <Card className="p-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Cari pertanyaan atau topik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link, index) => (
            <Card
              key={index}
              className="p-4 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <link.icon className="w-5 h-5 text-blue-600 group-hover:text-white" />
                </div>
                <div>
                  <h4 className="text-sm text-gray-900 dark:text-white mb-1">
                    {link.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {link.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-2">
              <TabsTrigger value="faq" className="flex-shrink-0">FAQ</TabsTrigger>
              <TabsTrigger value="contact" className="flex-shrink-0">Hubungi Kami</TabsTrigger>
            </TabsList>
          </div>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card className="p-6">
              <h3 className="text-gray-900 dark:text-white mb-4">
                Pertanyaan yang Sering Diajukan
              </h3>

              {searchQuery && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Ditemukan {filteredFAQs.length} hasil untuk "{searchQuery}"
                </p>
              )}

              <Accordion type="single" collapsible className="space-y-2">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-start gap-3 text-left">
                        <Badge variant="outline" className="mt-1 flex-shrink-0">
                          {faq.category}
                        </Badge>
                        <span className="text-gray-900 dark:text-white">
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-400 pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    Tidak ditemukan FAQ yang sesuai dengan pencarian Anda
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Form */}
              <Card className="p-6">
                <h3 className="text-gray-900 dark:text-white mb-4">Kirim Pesan</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={supportForm.email}
                      onChange={(e) =>
                        setSupportForm({ ...supportForm, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Topik pertanyaan Anda"
                      value={supportForm.subject}
                      onChange={(e) =>
                        setSupportForm({ ...supportForm, subject: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea
                      id="message"
                      placeholder="Jelaskan masalah atau pertanyaan Anda..."
                      rows={6}
                      value={supportForm.message}
                      onChange={(e) =>
                        setSupportForm({ ...supportForm, message: e.target.value })
                      }
                    />
                  </div>

                  <Button onClick={handleSubmitSupport} className="w-full gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Kirim Pesan
                  </Button>
                </div>
              </Card>

              {/* Contact Info */}
              <div className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-gray-900 dark:text-white mb-4">Kontak Langsung</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-white mb-1">
                          Email Support
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          support@librago.com
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Response time: 1x24 jam
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-white mb-1">
                          Live Chat
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Senin - Jumat: 09:00 - 18:00 WIB
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          Mulai Chat
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Phone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-900 dark:text-white mb-1">
                          Telepon
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          +62 21 1234 5678
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Senin - Jumat: 09:00 - 17:00 WIB
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <h4 className="text-gray-900 dark:text-white mb-2">
                    Premium Support
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Member premium mendapatkan priority support dengan response time lebih cepat
                    dan dedicated account manager.
                  </p>
                  <Button variant="outline" className="w-full">
                    Upgrade ke Premium
                  </Button>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelpScreen;
