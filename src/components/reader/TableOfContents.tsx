import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { useReader } from "./ReaderContext";
import { Chapter } from "../../utils/bookContent";

interface TableOfContentsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chapters: Chapter[];
    onNavigatePage: (page: number) => void;
    currentPage: number;
}

export function TableOfContents({ open, onOpenChange, chapters, onNavigatePage, currentPage }: TableOfContentsProps) {
    const { theme } = useReader();

    const themeStyles = {
        light: { bg: '#ffffff', text: '#0f172a', border: '#e2e8f0', activeItem: '#eff6ff', activeText: '#2563eb', hover: '#f8fafc' },
        dark: { bg: '#1e293b', text: '#f8fafc', border: '#334155', activeItem: '#1e40af', activeText: '#ffffff', hover: '#334155' },
        sepia: { bg: '#F4ECD8', text: '#433422', border: '#D7C9AA', activeItem: '#E6DCC6', activeText: '#8B5E3C', hover: '#E6DCC6' },
        night: { bg: '#000000', text: '#d4d4d4', border: '#262626', activeItem: '#262626', activeText: '#ffffff', hover: '#171717' },
        "e-ink": { bg: '#ffffff', text: '#000000', border: '#000000', activeItem: '#e5e5e5', activeText: '#000000', hover: '#f5f5f5' }
    };

    const currentThemeStyle = themeStyles[theme];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="w-[300px] sm:w-[400px] h-full overflow-hidden flex flex-col transition-colors duration-300"
                style={{
                    backgroundColor: currentThemeStyle.bg,
                    color: currentThemeStyle.text,
                    borderColor: currentThemeStyle.border
                }}
            >
                <SheetHeader className="mb-4">
                    <SheetTitle style={{ color: currentThemeStyle.text }}>Table of Contents</SheetTitle>
                    <SheetDescription style={{ color: currentThemeStyle.text, opacity: 0.7 }}>
                        Navigate through chapters
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-1 pb-6">
                        {chapters.map((chapter) => {
                            const isActive = currentPage >= chapter.pageStart && currentPage <= chapter.pageEnd;
                            return (
                                <button
                                    key={chapter.id}
                                    onClick={() => {
                                        onNavigatePage(chapter.pageStart);
                                        onOpenChange(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-md transition-colors text-sm font-medium flex justify-between items-center group hover:opacity-80`}
                                    style={{
                                        backgroundColor: isActive ? currentThemeStyle.activeItem : 'transparent',
                                        color: isActive ? currentThemeStyle.activeText : currentThemeStyle.text,
                                    }}
                                >
                                    <span className="truncate mr-2">{chapter.title}</span>
                                    <span className={`text-xs opacity-60 ${isActive ? '' : 'group-hover:opacity-100'}`}>
                                        Page {chapter.pageStart}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
