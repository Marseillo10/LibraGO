import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Share2, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { toPng } from 'html-to-image';

interface ShareQuoteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quote: string;
    bookTitle: string;
    author: string;
}

const THEMES = [
    { id: 'classic', name: 'Classic', bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
    { id: 'dark', name: 'Dark', bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-800' },
    { id: 'blue', name: 'Ocean', bg: 'bg-gradient-to-br from-blue-500 to-cyan-400', text: 'text-white', border: 'border-transparent' },
    { id: 'sunset', name: 'Sunset', bg: 'bg-gradient-to-br from-orange-400 to-pink-500', text: 'text-white', border: 'border-transparent' },
    { id: 'forest', name: 'Forest', bg: 'bg-gradient-to-br from-green-600 to-emerald-400', text: 'text-white', border: 'border-transparent' },
    { id: 'purple', name: 'Royal', bg: 'bg-gradient-to-br from-purple-600 to-indigo-500', text: 'text-white', border: 'border-transparent' },
];

export function ShareQuoteDialog({ open, onOpenChange, quote, bookTitle, author }: ShareQuoteDialogProps) {
    const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleCopyText = () => {
        navigator.clipboard.writeText(`"${quote}" - ${bookTitle} by ${author}`);
        toast.success("Quote copied to clipboard!");
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            setIsGenerating(true);
            const dataUrl = await toPng(cardRef.current, { cacheBust: true });
            const link = document.createElement('a');
            link.download = `quote-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Image downloaded!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate image");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!cardRef.current) return;

        try {
            setIsGenerating(true);
            const dataUrl = await toPng(cardRef.current, { cacheBust: true });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], "quote.png", { type: "image/png" });

            if (navigator.share) {
                await navigator.share({
                    title: `Quote from ${bookTitle}`,
                    text: `"${quote}" - ${bookTitle} by ${author}`,
                    files: [file]
                });
                toast.success("Shared successfully!");
            } else {
                // Fallback
                handleCopyText();
            }
        } catch (err) {
            console.error(err);
            // Fallback if sharing fails (e.g. not supported or cancelled)
            // Don't show error if user cancelled
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Quote</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Preview Card */}
                    <div className="flex justify-center">
                        <div
                            ref={cardRef}
                            className={`w-full aspect-square max-w-[300px] p-8 rounded-xl shadow-lg flex flex-col justify-center items-center text-center relative overflow-hidden ${selectedTheme.bg} ${selectedTheme.text} border ${selectedTheme.border}`}
                        >
                            <div className="relative z-10">
                                <p className="text-4xl mb-4 opacity-30 font-serif">"</p>
                                <p className="text-lg font-medium leading-relaxed mb-6 font-serif italic">
                                    {quote}
                                </p>
                                <div className="text-sm opacity-90 font-sans">
                                    <p className="font-bold">{bookTitle}</p>
                                    <p className="opacity-75">{author}</p>
                                </div>
                            </div>

                            {/* Watermark */}
                            <div className="absolute bottom-3 right-4 text-[10px] opacity-50 font-sans">
                                LibraGO
                            </div>
                        </div>
                    </div>

                    {/* Theme Selector */}
                    <div>
                        <label className="text-sm font-medium mb-3 block">Choose Theme</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedTheme(theme)}
                                    className={`w-10 h-10 rounded-full flex-shrink-0 border-2 transition-all ${theme.bg} ${selectedTheme.id === theme.id ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                    aria-label={theme.name}
                                >
                                    {selectedTheme.id === theme.id && (
                                        <Check className={`w-5 h-5 m-auto ${theme.text}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handleCopyText} className="w-full sm:w-auto">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                    </Button>
                    <Button variant="outline" onClick={handleDownload} disabled={isGenerating} className="w-full sm:w-auto">
                        <Download className="w-4 h-4 mr-2" />
                        Save Image
                    </Button>
                    <Button onClick={handleShare} disabled={isGenerating} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
