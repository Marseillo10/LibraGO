export const cleanDescription = (text: string | undefined): string => {
    if (!text) return "";

    let cleaned = text;

    // Remove Markdown bold/italic (***, **, *)
    // We need to be careful not to remove single * used as bullet points if they are at start of line, 
    // but Open Library often uses them for emphasis like ***Title***.
    // This regex targets paired asterisks.
    cleaned = cleaned.replace(/(\*{1,3})(.*?)(\1)/g, "$2");

    // Remove Markdown headers (### Title)
    cleaned = cleaned.replace(/#{1,6}\s+(.*)/g, "$1");

    // Remove links [text](url) -> text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

    // Remove reference links like [1]: https://... or [1]
    cleaned = cleaned.replace(/\[\d+\]:?\s?http[s]?:\/\/\S+/g, "");
    cleaned = cleaned.replace(/\[\d+\]/g, "");

    // Remove "([source][1])" style links often found in OL
    cleaned = cleaned.replace(/\(\[source\]\[\d+\]\)/gi, "");

    // Remove specific Open Library artifacts like "([1])" if not caught above
    cleaned = cleaned.replace(/\(\[\d+\]\)/g, "");

    // Replace multiple newlines with double newline
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    // Normalize horizontal whitespace (replace multiple spaces/tabs with single space)
    // This helps text-justify work better by avoiding huge gaps from existing whitespace
    cleaned = cleaned.replace(/[ \t]+/g, " ");

    return cleaned.trim();
};

/**
 * Applies Bionic Reading formatting to a string of text or HTML.
 * It wraps the first part of each word in a <b> tag.
 * 
 * @param text The text or HTML content to process
 * @returns The processed content with Bionic Reading formatting
 */
export const applyBionicReading = (text: string): string => {
    if (!text) return "";

    // Helper to process a single text node content
    const processText = (content: string) => {
        return content.replace(/\b(\w+)\b/g, (word) => {
            // Skip very short words or numbers if desired, but standard bionic reading does all
            if (word.length === 1) return `<b>${word}</b>`;

            const boldLength = Math.ceil(word.length / 2);
            const boldPart = word.slice(0, boldLength);
            const normalPart = word.slice(boldLength);

            return `<b>${boldPart}</b>${normalPart}`;
        });
    };

    // If the text contains HTML tags, we need to be careful not to break them
    // This is a simple parser that splits by tags
    const parts = text.split(/(<[^>]+>)/g);

    return parts.map(part => {
        // If it starts with <, it's a tag, return as is
        if (part.startsWith('<')) {
            return part;
        }
        // Otherwise it's text, process it
        return processText(part);
    }).join('');
};
