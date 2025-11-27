import { Book } from "./collections";

export interface Chapter {
    id: string;
    title: string;
    content: string;
    pageStart: number;
    pageEnd: number;
}

export interface BookContent {
    bookId: string;
    chapters: Chapter[];
    totalPages: number;
    wordsPerPage: number;
    // Store the split content to avoid re-calculating
    paginatedContent: string[][];
}

const LOREM_IPSUM = `
...
`;

const paginateText = (text: string, wordsPerPage: number): string[] => {
    const words = text.split(/\s+/);
    const pages: string[] = [];
    let currentPage: string[] = [];

    for (const word of words) {
        currentPage.push(word);
        if (currentPage.length >= wordsPerPage) {
            pages.push(currentPage.join(' '));
            currentPage = [];
        }
    }

    if (currentPage.length > 0) {
        pages.push(currentPage.join(' '));
    }

    return pages;
};


export const generateBookContent = (book: Book, wordsPerPage: number = 250): BookContent => {
    const chapters: Chapter[] = [];
    const paginatedContent: string[][] = [];
    let currentPageIndex = 1;

    // Use full content if available (demo books)
    if (book.fullContent) {
        const sections = book.fullContent.split(/^# /m).filter(s => s.trim().length > 0);

        sections.forEach((section, index) => {
            const lines = section.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            const pages = paginateText(content, wordsPerPage);
            
            const pageStart = currentPageIndex;
            const pageEnd = currentPageIndex + pages.length - 1;

            chapters.push({
                id: `chapter-${index + 1}`,
                title: title,
                content: content, // Keep original content for reference
                pageStart,
                pageEnd,
            });
            paginatedContent.push(pages);
            currentPageIndex += pages.length;
        });

    } else {
        // Fallback for books without pre-loaded content
        // Generate placeholder content based on description and lorem ipsum
        const numChapters = 10;
        const estimatedTotalWords = (book.pageCount || 100) * 250; // Standard estimate
        const placeholderContent = Array(numChapters).fill(LOREM_IPSUM).join('\n\n');
        const fullText = `${book.description || ''}\n\n${placeholderContent}`;
        const pages = paginateText(fullText, wordsPerPage);
        
        const totalGeneratedPages = pages.length;
        const pagesPerChapter = Math.max(1, Math.floor(totalGeneratedPages / numChapters));

        for (let i = 0; i < numChapters; i++) {
            const pageStart = currentPageIndex;
            const isLastChapter = i === numChapters - 1;
            
            const chapterPageCount = isLastChapter 
                ? totalGeneratedPages - (pageStart - 1)
                : pagesPerChapter;

            const pageEnd = pageStart + chapterPageCount - 1;
            
            const chapterPages = pages.slice(pageStart - 1, pageEnd);
            const chapterContent = chapterPages.join('\n\n');

            chapters.push({
                id: `chapter-${i + 1}`,
                title: i === 0 ? "Introduction" : `Chapter ${i}: ${getChapterTitle(i)}`,
                content: chapterContent,
                pageStart,
                pageEnd,
            });
            paginatedContent.push(chapterPages);
            currentPageIndex += chapterPageCount;
        }
    }
    
    return {
        bookId: book.id,
        chapters,
        totalPages: Math.max(1, currentPageIndex - 1),
        wordsPerPage,
        paginatedContent,
    };
};

export const getPageContent = (bookContent: BookContent, page: number): string => {
    if (page < 1 || page > bookContent.totalPages) {
        return "Invalid page number.";
    }

    const chapterIndex = bookContent.chapters.findIndex(c => page >= c.pageStart && page <= c.pageEnd);
    
    if (chapterIndex === -1) {
        return "End of book.";
    }

    const chapter = bookContent.chapters[chapterIndex];
    const chapterPages = bookContent.paginatedContent[chapterIndex];

    if (!chapterPages) {
        return "Error loading chapter content."
    }

    const relativePage = page - chapter.pageStart;

    let pageText = chapterPages[relativePage] || "This page is empty.";

    // Add title to first page of chapter
    if (relativePage === 0) {
        pageText = `# ${chapter.title}\n\n${pageText}`;
    }

    return pageText;
};


const getChapterTitle = (index: number): string => {
    const titles = [
        "The Beginning",
        "The Journey",
        "The Challenge",
        "The Discovery",
        "The Conflict",
        "The Resolution",
        "The Aftermath",
        "Reflections",
        "New Horizons",
        "Conclusion"
    ];
    return titles[index - 1] || `Part ${index}`;
};

// This function is no longer needed as we paginate the full text
// const generateChapterContent = (index: number): string => { ... };

export const calculateTotalPages = (book: Book, wordsPerPage: number): number => {
    // This provides a quick estimate without generating full content.
    // Useful for UI elements before the reader is fully loaded.
    let totalWords = 0;
    if (book.fullContent) {
        totalWords = book.fullContent.split(/\s+/).length;
    } else {
        // Use the standard estimation for books without full content
        totalWords = (book.pageCount || 100) * 250;
    }
    return Math.max(1, Math.ceil(totalWords / wordsPerPage));
}