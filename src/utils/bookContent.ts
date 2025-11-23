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
}

const LOREM_IPSUM = `
...
`;

export const generateBookContent = (book: Book): BookContent => {
    // If book has full content (Demo books), parse it
    if (book.fullContent) {
        const chapters: Chapter[] = [];
        // Split by markdown headers (e.g. # Chapter 1)
        // This is a simple parser for the demo content format
        const sections = book.fullContent.split(/^# /m).filter(s => s.trim().length > 0);

        let currentPage = 1;

        sections.forEach((section, index) => {
            const lines = section.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();

            // Estimate pages based on length (approx 1500 chars per page)
            const estimatedPages = Math.max(1, Math.ceil(content.length / 1500));

            chapters.push({
                id: `chapter-${index + 1}`,
                title: title,
                content: content,
                pageStart: currentPage,
                pageEnd: currentPage + estimatedPages - 1
            });

            currentPage += estimatedPages;
        });

        return {
            bookId: book.id,
            chapters,
            totalPages: currentPage - 1, // Total pages based on content length
        };
    }

    // Fallback for books without content (Google Books API results)
    const chapters: Chapter[] = [];
    let currentPage = 1;

    // Chapter 1: Introduction (based on description)
    const introPages = Math.max(2, Math.floor(book.pageCount * 0.05));
    chapters.push({
        id: "chapter-1",
        title: "Introduction",
        content: `
${book.description || "No description available."}

${book.previewLink ? `[Preview this book on Google Books](${book.previewLink})` : ""}

${LOREM_IPSUM}
    `.trim(),
        pageStart: currentPage,
        pageEnd: currentPage + introPages - 1,
    });
    currentPage += introPages;

    // Generate remaining chapters
    const numChapters = 10;
    const pagesPerChapter = Math.floor((book.pageCount - currentPage) / numChapters);

    for (let i = 1; i <= numChapters; i++) {
        const chapterPages = i === numChapters ? (book.pageCount - currentPage + 1) : pagesPerChapter;

        chapters.push({
            id: `chapter-${i + 1}`,
            title: `Chapter ${i}: ${getChapterTitle(i)}`,
            content: generateChapterContent(i),
            pageStart: currentPage,
            pageEnd: currentPage + chapterPages - 1,
        });

        currentPage += chapterPages;
    }

    return {
        bookId: book.id,
        chapters,
        totalPages: book.pageCount,
    };
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

const generateChapterContent = (index: number): string => {
    return `
## Section ${index}.1

${LOREM_IPSUM}

${LOREM_IPSUM}

## Section ${index}.2

${LOREM_IPSUM}

> "This is a key quote that might appear in this chapter to illustrate a point."

${LOREM_IPSUM}
  `.trim();
};

export const getPageContent = (bookContent: BookContent, page: number): string => {
    const chapter = bookContent.chapters.find(c => page >= c.pageStart && page <= c.pageEnd);

    if (!chapter) {
        return "End of book.";
    }

    // If it's a demo book (real content), paginate the text
    if (!chapter.content.includes(LOREM_IPSUM)) {
        const relativePage = page - chapter.pageStart;
        const totalChapterPages = chapter.pageEnd - chapter.pageStart + 1;

        // Simple character-based pagination
        const charsPerPage = 1500;
        const startIdx = relativePage * charsPerPage;
        const endIdx = Math.min(startIdx + charsPerPage, chapter.content.length);

        let pageText = chapter.content.substring(startIdx, endIdx);

        // Add title to first page of chapter
        if (relativePage === 0) {
            pageText = `# ${chapter.title}\n\n${pageText}`;
        } else {
            // Ensure we don't cut words in half (simple heuristic)
            // In a real app, we'd use a more sophisticated layout engine
            const lastSpace = pageText.lastIndexOf(' ');
            if (lastSpace > pageText.length - 100 && endIdx < chapter.content.length) {
                // Adjust to nearest word boundary if not at end
            }
        }

        return pageText;
    }

    // Fallback for dummy content
    const relativePage = page - chapter.pageStart;

    if (relativePage === 0) {
        return `# ${chapter.title}\n\n${chapter.content}`;
    }

    return `
### ${chapter.title} (continued)

*Page ${page}*

${LOREM_IPSUM}

${LOREM_IPSUM}
  `.trim();
};
