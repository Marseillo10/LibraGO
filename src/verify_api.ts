
import { api } from './services/api';

async function verify() {
    console.log("Fetching details for A Game of Thrones (OL257943W)...");
    try {
        const book = await api.getBookDetails("OL257943W");
        if (book) {
            console.log("--- Book Details ---");
            console.log("Title:", book.title);
            console.log("ISBN:", book.isbn);
            console.log("Subtitle:", book.subtitle);
            console.log("Links:", book.links?.length);
            console.log("Excerpts:", book.excerpts?.length);
            console.log("Page Count:", book.pageCount);
            console.log("Publisher:", book.publisher);
            console.log("First Sentence:", book.firstSentence);
            console.log("People:", book.subjectPeople?.slice(0, 5));
            console.log("Places:", book.subjectPlaces?.slice(0, 5));
            console.log("Times:", book.subjectTimes?.slice(0, 5));

            if (book.links && book.links.length > 0) {
                console.log("\nSUCCESS: New fields (Links) are present.");
            } else {
                console.log("\nFAILURE: Some new fields are missing.");
            }
        } else {
            console.log("Book not found.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

verify();
