import { Book } from "./collections";

export type CitationStyle = "APA" | "MLA" | "Chicago" | "Harvard";

/**
 * Generates a citation for a book in the specified style.
 * Defaults to APA if style is not supported or specified.
 */
export const generateCitation = (book: Book, style: CitationStyle = "APA"): string => {
    const author = book.author || "Unknown Author";
    const title = book.title || "Unknown Title";
    const yearMatch = book.publishedDate ? book.publishedDate.match(/\d{4}/) : null;
    const year = yearMatch ? yearMatch[0] : "n.d.";
    const publisher = book.publisher || "Publisher not identified";

    switch (style) {
        case "APA":
            // Author, A. A. (Year). Title of work. Publisher.
            return `${formatAuthorsAPA(author)} (${year}). ${title}. ${publisher}.`;
        case "MLA":
            // Author. Title of Source. Publisher, Publication Date.
            return `${formatAuthorsMLA(author)} ${title}. ${publisher}, ${year}.`;
        case "Chicago":
            // Author. Title of Book. Place of publication: Publisher, Year.
            // Note: Place of publication is often missing in Open Library data, so we omit it or use "n.p."
            return `${formatAuthorsChicago(author)} ${title}. ${publisher}, ${year}.`;
        case "Harvard":
            // Author, A.A. (Year) Title of book. Place of publication: Publisher.
            return `${formatAuthorsHarvard(author)} (${year}) ${title}. ${publisher}.`;
        default:
            return `${formatAuthorsAPA(author)} (${year}). ${title}. ${publisher}.`;
    }
};

/**
 * Formats author names for APA style.
 * Input: "John Doe" or "John Doe, Jane Smith"
 * Output: "Doe, J." or "Doe, J., & Smith, J."
 */
const formatAuthorsAPA = (authorString: string): string => {
    if (!authorString || authorString === "Unknown Author") return "Unknown Author";

    const authors = authorString.split(",").map(a => a.trim());
    if (authors.length === 0) return "Unknown Author";

    const formattedAuthors = authors.map(name => {
        const parts = name.split(" ");
        const lastName = parts[parts.length - 1];
        const initials = parts.slice(0, parts.length - 1).map(p => p[0] + ".").join(" ");
        return `${lastName}, ${initials}`;
    });

    if (formattedAuthors.length === 1) return formattedAuthors[0];
    if (formattedAuthors.length > 20) return `${formattedAuthors.slice(0, 19).join(", ")}, ... ${formattedAuthors[formattedAuthors.length - 1]}`;

    const lastAuthor = formattedAuthors.pop();
    return `${formattedAuthors.join(", ")}, & ${lastAuthor}`;
};

const formatAuthorsMLA = (authorString: string): string => {
    if (!authorString || authorString === "Unknown Author") return "Unknown Author.";
    // Simplified MLA formatting
    return authorString + ".";
}

const formatAuthorsChicago = (authorString: string): string => {
    if (!authorString || authorString === "Unknown Author") return "Unknown Author.";
    return authorString + ".";
}

const formatAuthorsHarvard = (authorString: string): string => {
    if (!authorString || authorString === "Unknown Author") return "Unknown Author";
    return authorString;
}


/**
 * Generates RIS content for a book.
 * RIS is a standard format supported by Zotero, Mendeley, EndNote, etc.
 */
export const generateRIS = (book: Book): string => {
    const lines = [
        "TY  - BOOK",
        `TI  - ${book.title}`,
        `AU  - ${book.author}`, // RIS supports multiple AU lines, but we have a string. Ideally split.
        `PY  - ${book.publishedDate ? (book.publishedDate.match(/\d{4}/)?.[0] || "") : ""}`,
        `PB  - ${book.publisher || ""}`,
        `SN  - ${book.isbn || ""}`,
        `UR  - ${book.previewLink || ""}`,
        "ER  - "
    ];

    // Handle multiple authors if possible
    if (book.author && book.author !== "Unknown Author") {
        // Remove the single AU line added above
        const auIndex = lines.findIndex(l => l.startsWith("AU  -"));
        if (auIndex !== -1) lines.splice(auIndex, 1);

        const authors = book.author.split(",").map(a => a.trim());
        authors.forEach(a => {
            lines.splice(2, 0, `AU  - ${a}`);
        });
    }

    return lines.join("\n");
};

/**
 * Triggers a download of the RIS file.
 */
export const downloadRIS = (book: Book, filename?: string) => {
    const content = generateRIS(book);
    const blob = new Blob([content], { type: "application/x-research-info-systems" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_citation.ris`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
