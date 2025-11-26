import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Sun, Moon, Type, BookOpen, Music, Shield, Sparkles, AlignLeft, AlignCenter, AlignRight, AlignJustify, X } from "lucide-react";
import { useReader } from "./ReaderContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";

export function ReaderSettings({ open, onOpenChange, onNavigatePage }: { open: boolean; onOpenChange: (open: boolean) => void; onNavigatePage: (page: number) => void }) {
    const {
        theme,
        fontSize,
        lineHeight,
        fontFamily,
        brightness,
        readingMode,
        backgroundEffects,
        ttsSpeed,
        contentProtection,
        highlights,
        bookmarks,
        bionicReading,
        textAlign,
        wordsPerPage,
        isItalic,
        ttsVoice,
        isContinuousReading,
        updateSettings,
        removeBookmark,
        removeHighlight,
    } = useReader();

    const themeGroups = {
        Light: [
            { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" />, color: 'bg-white border-slate-200 text-slate-800', style: { backgroundColor: '#ffffff', color: '#1f2937' } },
            { id: 'sepia', label: 'Sepia', color: 'bg-[#fbf5e9] border-[#e6dace] text-[#5b4636]', style: { backgroundColor: '#fbf5e9', color: '#5b4636' } },
            { id: 'e-ink', label: 'E-Ink', color: 'bg-gray-100 border-gray-300 text-black', style: { backgroundColor: '#f3f4f6', color: '#000000' } },
        ],
        Dark: [
            { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" />, color: 'bg-slate-900 border-slate-700 text-white', style: { backgroundColor: '#0f172a', color: '#ffffff' } },
            { id: 'night', label: 'Night', color: 'bg-[#1a1a1a] border-[#333] text-gray-300', style: { backgroundColor: '#1a1a1a', color: '#d1d5db' } },
        ]
    };

    const fonts: { value: FontFamily; label: string }[] = [
        { value: 'Inter', label: 'Inter (Sans)' },
        { value: 'Merriweather', label: 'Merriweather (Serif)' },
        { value: 'Roboto', label: 'Roboto (Sans)' },
        { value: 'Lora', label: 'Lora (Serif)' },
        { value: 'Georgia', label: 'Georgia (Serif)' },
        { value: 'Times New Roman', label: 'Times New Roman (Serif)' },
        { value: 'Arial', label: 'Arial (Sans)' },
        { value: 'Verdana', label: 'Verdana (Sans)' },
        { value: 'Open Dyslexic', label: 'Open Dyslexic' },
    ];

    const isDarkMode = theme === 'dark' || theme === 'night';

    const settingsThemeStyles = {
        light: { bg: '#ffffff', text: '#1f2937', border: '#e5e7eb', activeItem: '#3b82f6', activeText: '#ffffff', muted: '#f3f4f6' },
        dark: { bg: '#1e293b', text: '#f8fafc', border: '#334155', activeItem: '#3b82f6', activeText: '#ffffff', muted: '#0f172a' },
        sepia: { bg: '#fbf5e9', text: '#5b4636', border: '#e6dace', activeItem: '#8B5E3C', activeText: '#fbf5e9', muted: '#f5efe2' },
        night: { bg: '#000000', text: '#d4d4d4', border: '#262626', activeItem: '#2563eb', activeText: '#ffffff', muted: '#171717' },
        "e-ink": { bg: '#f3f4f6', text: '#000000', border: '#d1d5db', activeItem: '#000000', activeText: '#ffffff', muted: '#e5e7eb' }
    };

    const getSliderStyles = (t: ReaderTheme) => {
        switch (t) {
            case 'dark':
                return "[&_[data-slot=slider-track]]:!bg-gray-500 [&_[data-slot=slider-range]]:!bg-blue-400 [&_[data-slot=slider-thumb]]:!border-blue-400 [&_[data-slot=slider-thumb]]:!bg-white";
            case 'night':
                return "[&_[data-slot=slider-track]]:!bg-slate-400 [&_[data-slot=slider-range]]:!bg-blue-400 [&_[data-slot=slider-thumb]]:!border-blue-400 [&_[data-slot=slider-thumb]]:!bg-white";
            case 'sepia':
                return "[&_[data-slot=slider-track]]:bg-[#E6DCC6] [&_[data-slot=slider-range]]:bg-[#8B5E3C] [&_[data-slot=slider-thumb]]:border-[#8B5E3C] [&_[data-slot=slider-thumb]]:bg-[#F4ECD8]";
            case 'e-ink':
                return "[&_[data-slot=slider-track]]:bg-[#a3a3a3] [&_[data-slot=slider-range]]:bg-slate-900 [&_[data-slot=slider-thumb]]:border-slate-900 [&_[data-slot=slider-thumb]]:bg-white";
            default: // light
                return "[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-range]]:bg-blue-600 [&_[data-slot=slider-thumb]]:border-blue-600 [&_[data-slot=slider-thumb]]:bg-white";
        }
    };

    const getSwitchStyles = (t: ReaderTheme) => {
        switch (t) {
            case 'dark':
                return "data-[state=unchecked]:!bg-gray-500 data-[state=checked]:!bg-blue-400 [&_[data-slot=switch-thumb]]:bg-white";
            case 'night':
                return "data-[state=unchecked]:!bg-slate-400 data-[state=checked]:!bg-blue-500 [&_[data-slot=switch-thumb]]:bg-white";
            case 'sepia':
                return "data-[state=unchecked]:bg-[#E6DCC6] data-[state=checked]:bg-[#8B5E3C] [&_[data-slot=switch-thumb]]:bg-[#F4ECD8]";
            case 'e-ink':
                return "data-[state=unchecked]:bg-[#a3a3a3] data-[state=checked]:bg-slate-900 [&_[data-slot=switch-thumb]]:bg-white";
            default: // light
                return "data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-blue-600 [&_[data-slot=switch-thumb]]:bg-white";
        }
    };

    const currentThemeStyle = settingsThemeStyles[theme];
    const sliderClass = getSliderStyles(theme);
    const switchClass = getSwitchStyles(theme);

    const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);

    React.useEffect(() => {
        const getVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = getVoices;
        }
    }, []);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className={`w-[400px] sm:w-[600px] md:w-[700px] h-full overflow-y-auto transition-colors duration-300`}
                style={{
                    backgroundColor: currentThemeStyle.bg,
                    color: currentThemeStyle.text,
                    borderColor: currentThemeStyle.border
                }}
            >
                <SheetHeader className="mb-6">
                    <SheetTitle style={{ color: currentThemeStyle.text }}>Reader Settings</SheetTitle>
                    <SheetDescription style={{ color: currentThemeStyle.text, opacity: 0.7 }}>
                        Kustomisasi tampilan, tata letak, dan anotasi untuk pengalaman membaca optimal
                    </SheetDescription>
                </SheetHeader>

                <Tabs key={theme} defaultValue="display" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-6 p-1" style={{ backgroundColor: currentThemeStyle.muted }}>
                        <TabsTrigger value="display" className="tabs-trigger-custom">Display</TabsTrigger>
                        <TabsTrigger value="text" className="tabs-trigger-custom">Text</TabsTrigger>
                        <TabsTrigger value="layout" className="tabs-trigger-custom">Layout</TabsTrigger>
                        <TabsTrigger value="audio" className="tabs-trigger-custom">Audio</TabsTrigger>
                        <TabsTrigger value="notes" className="tabs-trigger-custom">Notes</TabsTrigger>
                    </TabsList>

                    {/* Add global style for active tab based on current theme */}
                    <style>{`
                        .tabs-trigger-custom[data-state=active] {
                            background-color: ${currentThemeStyle.activeItem} !important;
                            color: ${currentThemeStyle.activeText} !important;
                            font-weight: 600;
                        }
                    `}</style>

                    {/* DISPLAY TAB */}
                    <TabsContent value="display" className="space-y-6" style={{ color: currentThemeStyle.text, backgroundColor: 'transparent' }}>
                        {/* Theme Selection */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 font-medium" style={{ color: currentThemeStyle.text }}>
                                <Sparkles className="w-4 h-4" />
                                Theme
                            </Label>
                            <div className="space-y-4">
                                {Object.entries(themeGroups).map(([groupName, groupThemes]) => (
                                    <div key={groupName}>
                                        <Label className="text-sm font-medium text-gray-500" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>{groupName}</Label>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {groupThemes.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => updateSettings({ theme: t.id })}
                                                    style={{
                                                        ...t.style,
                                                        borderColor: theme === t.id ? currentThemeStyle.activeItem : currentThemeStyle.border,
                                                        boxShadow: theme === t.id ? `0 0 0 2px ${currentThemeStyle.activeItem}` : 'none'
                                                    }}
                                                    className={`
                                                        flex items-center justify-center gap-2 p-3 rounded-lg border transition-all
                                                        ${theme === t.id ? 'scale-105 shadow-md' : 'hover:opacity-90 hover:scale-105'}
                                                    `}
                                                >
                                                    {t.icon}
                                                    <span className="text-sm font-medium">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Background Effects */}
                        <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: currentThemeStyle.border }}>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-500" />
                                <div>
                                    <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Background Image & Effects</Label>
                                    <p className="text-xs" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>Apply animated background effects for immersive reading, especially in dark themes.</p>
                                </div>
                            </div>
                            <Switch
                                checked={backgroundEffects}
                                onCheckedChange={(c: boolean) => updateSettings({ backgroundEffects: c })}
                                className={switchClass}
                                disabled={!isDarkMode}
                            />
                        </div>

                        {/* Brightness */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Brightness</Label>
                                <span className="text-sm" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>
                                    {brightness}%
                                </span>
                            </div>
                            <Slider
                                value={[brightness]}
                                onValueChange={(value: number[]) => updateSettings({ brightness: value[0] })}
                                min={20}
                                max={100}
                                step={5}
                                className={sliderClass}
                            />
                        </div>
                    </TabsContent>

                    {/* TEXT TAB */}
                    <TabsContent value="text" className="space-y-6">
                        {/* Font Family */}
                        <div className="space-y-4">
                            <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Font Family</Label>
                            <Select value={fontFamily} onValueChange={(v: string) => updateSettings({ fontFamily: v as FontFamily })}>
                                <SelectTrigger className="w-full" style={{
                                    backgroundColor: 'transparent',
                                    color: currentThemeStyle.text,
                                    borderColor: currentThemeStyle.border
                                }}>
                                    <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                                <SelectContent style={{
                                    backgroundColor: currentThemeStyle.bg,
                                    color: currentThemeStyle.text,
                                    borderColor: currentThemeStyle.border
                                }}>
                                    {fonts.map((font) => (
                                        <SelectItem key={font.value} value={font.value} style={{ color: currentThemeStyle.text }}>
                                            {font.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Font Size */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Font Size</Label>
                                <span className="text-sm" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>{fontSize}px</span>
                            </div>
                            <Slider
                                value={[fontSize]}
                                onValueChange={(value: number[]) => updateSettings({ fontSize: value[0] })}
                                min={12}
                                max={32}
                                step={1}
                                className={sliderClass}
                            />
                        </div>

                        {/* Line Height */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Line Height</Label>
                                <span className="text-sm" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>
                                    {lineHeight}
                                </span>
                            </div>
                            <Slider
                                value={[lineHeight]}
                                onValueChange={(value: number[]) => updateSettings({ lineHeight: value[0] })}
                                min={1.0}
                                max={2.0}
                                step={0.1}
                                className={sliderClass}
                            />
                        </div>

                        {/* Text Alignment */}
                        <div className="space-y-3">
                            <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Text Alignment</Label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'left', icon: <AlignLeft className="w-4 h-4" /> },
                                    { value: 'center', icon: <AlignCenter className="w-4 h-4" /> },
                                    { value: 'right', icon: <AlignRight className="w-4 h-4" /> },
                                    { value: 'justify', icon: <AlignJustify className="w-4 h-4" /> },
                                ].map((align) => (
                                    <button
                                        key={align.value}
                                        onClick={() => updateSettings({ textAlign: align.value as any })}
                                        className={`p-3 rounded-lg border transition-all ${textAlign === align.value ? 'shadow-md scale-105' : 'hover:opacity-80'}`}
                                        style={{
                                            backgroundColor: textAlign === align.value ? currentThemeStyle.activeItem : 'transparent',
                                            color: textAlign === align.value ? currentThemeStyle.activeText : currentThemeStyle.text,
                                            borderColor: textAlign === align.value ? currentThemeStyle.activeItem : currentThemeStyle.border
                                        }}
                                    >
                                        {align.icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bionic Reading */}
                        <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: currentThemeStyle.border }}>
                            <div className="flex items-center gap-2">
                                <Type className="w-4 h-4 text-blue-500" />
                                <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Bionic Reading</Label>
                            </div>
                            <Switch
                                checked={bionicReading}
                                onCheckedChange={(c: boolean) => updateSettings({ bionicReading: c })}
                                className={switchClass}
                            />
                        </div>

                        {/* Italic */}
                        <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: currentThemeStyle.border }}>
                            <div className="flex items-center gap-2">
                                <Type className="w-4 h-4 text-blue-500" />
                                <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Italic</Label>
                            </div>
                            <Switch
                                checked={isItalic}
                                onCheckedChange={(c: boolean) => updateSettings({ isItalic: c })}
                                className={switchClass}
                            />
                        </div>
                    </TabsContent>

                    {/* LAYOUT TAB */}
                    <TabsContent value="layout" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium leading-none" style={{ color: currentThemeStyle.text }}>
                                Reading Mode
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateSettings({ readingMode: 'scroll' })}
                                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${readingMode === 'scroll' ? 'shadow-md scale-105' : 'hover:opacity-80'}`}
                                    style={{
                                        backgroundColor: readingMode === 'scroll' ? currentThemeStyle.activeItem : 'transparent',
                                        color: readingMode === 'scroll' ? currentThemeStyle.activeText : currentThemeStyle.text,
                                        borderColor: readingMode === 'scroll' ? currentThemeStyle.activeItem : currentThemeStyle.border
                                    }}
                                >
                                    Scroll
                                </button>
                                <button
                                    onClick={() => updateSettings({ readingMode: 'paginated' })}
                                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${readingMode === 'paginated' ? 'shadow-md scale-105' : 'hover:opacity-80'}`}
                                    style={{
                                        backgroundColor: readingMode === 'paginated' ? currentThemeStyle.activeItem : 'transparent',
                                        color: readingMode === 'paginated' ? currentThemeStyle.activeText : currentThemeStyle.text,
                                        borderColor: readingMode === 'paginated' ? currentThemeStyle.activeItem : currentThemeStyle.border
                                    }}
                                >
                                    Paginated
                                </button>
                            </div>
                        </div>

                        {/* Words Per Page */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2 font-medium" style={{ color: currentThemeStyle.text }}>
                                    <BookOpen className="w-4 h-4" /> 
                                    <div>
                                        Words Per Page
                                        <p className="text-xs" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>Set the maximum number of words to display on each page.</p>
                                    </div>
                                </Label>
                                <span className="text-sm" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>{wordsPerPage}</span>
                            </div>
                            <Slider
                                value={[wordsPerPage]}
                                onValueChange={(value: number[]) => updateSettings({ wordsPerPage: value[0] })}
                                min={50}
                                max={1000}
                                step={50}
                                className={sliderClass}
                            />
                        </div>
                    </TabsContent>

                    {/* AUDIO TAB */}
                    <TabsContent value="audio" className="space-y-6">
                        {/* TTS Speed */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2 font-medium" style={{ color: currentThemeStyle.text }}>
                                    <Music className="w-4 h-4" /> 
                                    <div>
                                        TTS Speed
                                        <p className="text-xs" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>Adjust the speed of the text-to-speech voice.</p>
                                    </div>
                                </Label>
                                <span className="text-sm" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>{ttsSpeed}x</span>
                            </div>
                            <Slider
                                value={[ttsSpeed]}
                                onValueChange={(value: number[]) => updateSettings({ ttsSpeed: value[0] })}
                                min={0.5}
                                max={2.0}
                                step={0.1}
                                className={sliderClass}
                            />
                        </div>

                        {/* TTS Voice */}
                        <div className="space-y-4">
                            <Label className="font-medium" style={{ color: currentThemeStyle.text }}>TTS Voice</Label>
                            <Select value={ttsVoice || ''} onValueChange={(v: string) => updateSettings({ ttsVoice: v })}>
                                <SelectTrigger className="w-full" style={{
                                    backgroundColor: 'transparent',
                                    color: currentThemeStyle.text,
                                    borderColor: currentThemeStyle.border
                                }}>
                                    <SelectValue placeholder="Select voice" />
                                </SelectTrigger>
                                <SelectContent style={{
                                    backgroundColor: currentThemeStyle.bg,
                                    color: currentThemeStyle.text,
                                    borderColor: currentThemeStyle.border
                                }}>
                                    {voices.map((voice) => (
                                        <SelectItem key={voice.name} value={voice.name} style={{ color: currentThemeStyle.text }}>
                                            {voice.name} ({voice.lang})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Continuous Reading */}
                        <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: currentThemeStyle.border }}>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                <div>
                                    <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Continuous Reading</Label>
                                    <p className="text-xs" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>Automatically play the next page</p>
                                </div>
                            </div>
                            <Switch
                                checked={isContinuousReading}
                                onCheckedChange={(c: boolean) => updateSettings({ isContinuousReading: c })}
                                className={switchClass}
                            />
                        </div>
                    </TabsContent>

                    {/* SECURITY TAB */}
                    <TabsContent value="security" className="space-y-6">
                        {/* Content Protection */}
                        <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: currentThemeStyle.border }}>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-500" />
                                <div>
                                    <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Content Protection</Label>
                                    <p className="text-xs" style={{ color: currentThemeStyle.text, opacity: 0.7 }}>Prevent screenshots and text copying to protect intellectual property.</p>
                                </div>
                            </div>
                            <Switch
                                checked={contentProtection}
                                onCheckedChange={(c: boolean) => updateSettings({ contentProtection: c })}
                                className={switchClass}
                            />
                        </div>
                    </TabsContent>

                    {/* NOTES TAB */}
                    <TabsContent value="notes" style={{ color: currentThemeStyle.text, backgroundColor: 'transparent' }}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Bookmarks ({bookmarks.length})</Label>
                            </div>
                            <ScrollArea className="h-[150px] mb-4">
                                {bookmarks.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        <p className="text-sm">No bookmarks yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {bookmarks.map((bookmark) => (
                                            <Card
                                                key={bookmark.id}
                                                className="p-3 flex justify-between items-center"
                                            >
                                                <div
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        onNavigatePage(bookmark.page);
                                                        onOpenChange(false);
                                                    }}
                                                >
                                                    <span className="text-sm font-medium">{bookmark.label}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">Page {bookmark.page}</span>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeBookmark(bookmark.id)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>

                            <div className="flex items-center justify-between">
                                <Label className="font-medium" style={{ color: currentThemeStyle.text }}>Highlights ({highlights.length})</Label>
                            </div>
                            <ScrollArea className="h-[150px] mb-4">
                                {highlights.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No highlights yet</p>
                                        <p className="text-xs mt-2">Select text to highlight</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {highlights.map((highlight) => (
                                            <Card key={highlight.id} className="p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className={`p-2 rounded mb-2 bg-${highlight.color}-100 dark:bg-${highlight.color}-900/20 border-l-4 border-${highlight.color}-500`}>
                                                            <p className="text-sm font-medium italic">"{highlight.text}"</p>
                                                        </div>
                                                        {highlight.note && (
                                                            <p className="text-xs text-muted-foreground mb-1">Note: {highlight.note}</p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">Page {highlight.page}</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => removeHighlight(highlight.id)}>
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet >
    );
}
