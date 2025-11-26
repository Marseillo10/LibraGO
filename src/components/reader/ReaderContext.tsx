import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBooks } from '../../context/BooksContext';

export type ReaderTheme = 'light' | 'dark' | 'sepia' | 'night' | 'e-ink';
export type ReadingMode = 'scroll' | 'paginated';
export type FontFamily = 'Inter' | 'Merriweather' | 'Roboto' | 'Lora' | 'Georgia' | 'Times New Roman' | 'Arial' | 'Verdana' | 'Open Dyslexic';
export type ViewMode = 'text' | 'scan';

export interface Highlight {
    id: string;
    text: string;
    color: string;
    note?: string;
    page: number;
}

export interface Bookmark {
    id: string;
    page: number;
    label: string;
    color: string;
}

export interface Annotation {
    id: string;
    text: string;
    page: number;
    position: number;
}

export interface ReaderSettings {
    theme: ReaderTheme;
    fontSize: number;
    lineHeight: number;
    fontFamily: FontFamily;
    brightness: number;
    readingMode: ReadingMode;
    backgroundEffects: boolean;
    ttsSpeed: number;
    ttsVoice: string | null;
    contentProtection: boolean;
    bionicReading: boolean;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    wordsPerPage: number;
    isItalic: boolean;
    isContinuousReading: boolean;
}

interface ReaderContextType {

    // State

    highlights: Highlight[];

    bookmarks: Bookmark[];

    annotations: Annotation[];

    viewMode: ViewMode;

    setViewMode: (mode: ViewMode) => void;

    isTextAvailable: boolean;

    setIsTextAvailable: (avail: boolean) => void;



    // Actions

    addHighlight: (highlight: Highlight) => void;

    removeHighlight: (id: string) => void;

    addBookmark: (bookmark: Bookmark) => void;

    removeBookmark: (id: string) => void;

    addAnnotation: (annotation: Annotation) => void;

}



const ReaderContext = createContext<ReaderContextType | undefined>(undefined);



export function ReaderProvider({ children }: { children: React.ReactNode }) {

    const { readerSettings, updateReaderSettings } = useBooks(); // Use readerSettings from BooksContext



    const [highlights, setHighlights] = useState<Highlight[]>(() => {
        const saved = localStorage.getItem('librago-reader-highlights');
        return saved ? JSON.parse(saved) : [];
    });
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
        const saved = localStorage.getItem('librago-reader-bookmarks');
        return saved ? JSON.parse(saved) : [];
    });
    const [annotations, setAnnotations] = useState<Annotation[]>(() => {
        const saved = localStorage.getItem('librago-reader-annotations');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('librago-reader-highlights', JSON.stringify(highlights));
    }, [highlights]);

    useEffect(() => {
        localStorage.setItem('librago-reader-bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        localStorage.setItem('librago-reader-annotations', JSON.stringify(annotations));
    }, [annotations]);

    const [viewMode, setViewMode] = useState<ViewMode>('text');

    const [isTextAvailable, setIsTextAvailable] = useState(true);



    const addHighlight = (highlight: Highlight) => {

        setHighlights(prev => [...prev, highlight]);

    };



    const removeHighlight = (id: string) => {

        setHighlights(prev => prev.filter(h => h.id !== id));

    };



    const addBookmark = (bookmark: Bookmark) => {

        setBookmarks(prev => [...prev, bookmark]);

    };



    const removeBookmark = (id: string) => {

        setBookmarks(prev => prev.filter(b => b.id !== id));

    };



    const addAnnotation = (annotation: Annotation) => {

        setAnnotations(prev => [...prev, annotation]);

    };



    return (

        <ReaderContext.Provider value={{

            ...readerSettings,

            updateSettings: updateReaderSettings, // Map to updateReaderSettings from BooksContext

            highlights,

            bookmarks,

            annotations,

            viewMode,

            setViewMode,

            isTextAvailable,

            setIsTextAvailable,

            addHighlight,

            removeHighlight,

            addBookmark,

            removeBookmark,

            addAnnotation

        }}>

            {children}

        </ReaderContext.Provider>

    );

}



export const useReader = () => {

    const context = useContext(ReaderContext);

    if (context === undefined) {

        throw new Error('useReader must be used within a ReaderProvider');

    }

    return context;

};


