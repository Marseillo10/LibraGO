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
