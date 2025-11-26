import { Book } from "../utils/collections";

const OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";
const OPEN_LIBRARY_WORKS_URL = "https://openlibrary.org"; // Base for /works/{id}.json
const OPEN_LIBRARY_COVERS_URL = "https://covers.openlibrary.org/b/id";
const OPEN_LIBRARY_SUBJECTS_URL = "https://openlibrary.org/subjects";

export interface OpenLibraryDoc {
    key: string;
    title: string;
    author_name?: string[];
    cover_i?: number;
    first_publish_year?: number;
    number_of_pages_median?: number;
    subject?: string[];
    ratings_average?: number;
    ratings_count?: number;
    language?: string[];
    publisher?: string[];
    first_sentence?: string[];
    isbn?: string[];
}

export interface OpenLibraryWork {
    key: string;
    title: string;
    description?: string | { value: string };
    covers?: number[];
    subjects?: string[];
    created?: { value: string };
    first_publish_date?: string;
    authors?: { author: { key: string } }[];
    subject_places?: string[];
    subject_people?: string[];
    subject_times?: string[];
    first_sentence?: { value: string } | string;
    links?: { title: string; url: string }[];
    subtitle?: string;
    excerpts?: { text: string; comment?: string }[];
}

// Helper to get cover URL
const getCoverUrl = (coverId?: number, size: 'S' | 'M' | 'L' = 'L'): string => {
    if (!coverId) return "https://placehold.co/128x192?text=No+Cover";
    return `${OPEN_LIBRARY_COVERS_URL}/${coverId}-${size}.jpg`;
};

// Helper to transform Open Library Doc (Search Result) to Book
const transformOpenLibraryDoc = (doc: OpenLibraryDoc): Book => {
    const id = doc.key.replace("/works/", ""); // Extract ID from key "/works/OL..."

    return {
        id: id,
        title: doc.title,
        author: doc.author_name?.slice(0, 3).join(", ") || "Unknown Author",
        genre: doc.subject?.slice(0, 5) || ["Uncategorized"],
        progress: 0,
        rating: doc.ratings_average ? parseFloat(doc.ratings_average.toFixed(1)) : 0,
        ratingsCount: doc.ratings_count || 0,
        addedDate: new Date(),
        tags: [],
        isFavorite: false,
        pageCount: doc.number_of_pages_median || 0,
        currentPage: 0,
        description: doc.first_sentence?.[0] || "Description not available in search results.",
        publisher: doc.publisher?.[0],
        publishedDate: doc.first_publish_year?.toString(),
        language: doc.language?.[0],
        previewLink: `https://openlibrary.org${doc.key}`,
        image: getCoverUrl(doc.cover_i),
        iaId: undefined,
        isbn: doc.isbn?.[0],
        firstSentence: doc.first_sentence?.[0],
    } as Book;
};

// Helper to transform Open Library Work (Details) to Book
const transformOpenLibraryWork = (work: OpenLibraryWork, authorName?: string): Book => {
    const id = work.key.replace("/works/", "");

    let description = "No description available.";
    if (typeof work.description === 'string') {
        description = work.description;
    } else if (work.description?.value) {
        description = work.description.value;
    }

    return {
        id: id,
        title: work.title,
        subtitle: work.subtitle,
        author: authorName || "Unknown Author",
        genre: work.subjects?.slice(0, 5) || ["Uncategorized"],
        progress: 0,
        rating: 0,
        ratingsCount: 0,
        addedDate: new Date(),
        tags: [],
        isFavorite: false,
        pageCount: 0,
        currentPage: 0,
        description: description,
        publishedDate: work.first_publish_date,
        previewLink: `https://openlibrary.org${work.key}`,
        image: getCoverUrl(work.covers?.[0]),
        subjectPlaces: work.subject_places,
        subjectPeople: work.subject_people,
        subjectTimes: work.subject_times,
        firstSentence: typeof work.first_sentence === 'string' ? work.first_sentence : work.first_sentence?.value,
        links: work.links?.filter(l => l && l.url && l.title),
        excerpts: work.excerpts?.map(e => e.text).filter((t): t is string => !!t),
    } as Book;
};

export const getBookPageContent = async (iaId: string, page: number): Promise<string | null> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`https://api.archivelab.org/books/${iaId}/pages/${page}/ocr`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return data.text || null;
    } catch (error) {
        // Don't log abort errors as they are expected timeouts
        if (error instanceof Error && error.name === 'AbortError') {
            console.warn(`OCR fetch timed out for book ${iaId} page ${page}`);
            return null;
        }
        console.error("Error fetching book page content:", error);
        return null;
    }
};

export const api = {
    // ... (keep searchBooks)
    searchBooks: async (query: string, maxResults = 40, page = 1, sort?: string, includeLowQuality = false): Promise<{ docs: Book[], numFound: number, rawCount: number }> => {
        try {
            // Request isbn field to fetch descriptions later
            const fields = "key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject,language,publisher,ratings_average,ratings_count,ratings_sortable,first_sentence,isbn";
            let url = `${OPEN_LIBRARY_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=${maxResults}&page=${page}&fields=${fields}`;

            if (sort) {
                // Map Google Books sort to Open Library sort
                const sortMap: Record<string, string> = {
                    "newest": "new",
                    "oldest": "old",
                    "rating": "rating",
                    "random": "random"
                };
                const olSort = sortMap[sort] || "";
                if (olSort) {
                    url += `&sort=${olSort}`;
                }
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!data.docs) return { docs: [], numFound: 0, rawCount: 0 };

            const rawCount = data.docs.length;
            let books = data.docs.map(transformOpenLibraryDoc);

            // Quality Filter: Remove books without cover or author UNLESS includeLowQuality is true
            if (!includeLowQuality) {
                books = books.filter((book: Book) => {
                    const hasCover = book.image && book.image !== "https://placehold.co/128x192?text=No+Cover";
                    const hasAuthor = book.author && book.author !== "Unknown Author";
                    return hasCover && hasAuthor;
                });
            }

            // Deduplication: Remove duplicates based on Title + Author (fuzzy match)
            const uniqueBooks: Book[] = [];
            const seenKeys = new Set<string>();

            books.forEach((book: Book) => {
                // Create a unique key based on normalized title and author
                const normalizedTitle = book.title.toLowerCase().replace(/[^\w\s]/g, "").trim();
                const normalizedAuthor = book.author.toLowerCase().replace(/[^\w\s]/g, "").split(",")[0].trim(); // Use first author
                const key = `${normalizedTitle}|${normalizedAuthor}`;

                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueBooks.push(book);
                }
            });

            books = uniqueBooks.slice(0, maxResults); // Limit back to requested size

            // Bulk fetch descriptions using ISBNs
            const isbnMap: Record<string, string> = {}; // Map ISBN to Book ID (Open Library Key)
            const isbnsToFetch: string[] = [];

            data.docs.forEach((doc: any) => {
                if (doc.isbn && doc.isbn.length > 0) {
                    // Use the first ISBN for the lookup
                    const isbn = doc.isbn[0];
                    const bookId = doc.key.replace("/works/", "");
                    // Only fetch for books that survived filtering
                    if (books.some((b: Book) => b.id === bookId)) {
                        isbnMap[isbn] = bookId;
                        isbnsToFetch.push(`ISBN:${isbn}`);
                    }
                }
            });

            if (isbnsToFetch.length > 0) {
                try {
                    // Open Library API allows multiple bibkeys, comma separated
                    // Limit to ~20-30 to avoid URL length issues if needed, but 40 results might be okay if ISBNs are short
                    // Let's chunk it just in case, though 40 ISBNs is roughly 40*18 = 720 chars, which is fine.
                    const bibkeys = isbnsToFetch.join(",");
                    const detailsUrl = `https://openlibrary.org/api/books?bibkeys=${bibkeys}&jscmd=details&format=json`;

                    const detailsResponse = await fetch(detailsUrl);
                    const detailsData = await detailsResponse.json();

                    // Update books with descriptions from detailsData
                    Object.keys(detailsData).forEach(key => {
                        const isbn = key.replace("ISBN:", "");
                        const bookId = isbnMap[isbn];
                        const details = detailsData[key];

                        if (bookId && details.details && details.details.description) {
                            const book = books.find((b: Book) => b.id === bookId);
                            if (book) {
                                let description = "";
                                if (typeof details.details.description === 'string') {
                                    description = details.details.description;
                                } else if (details.details.description.value) {
                                    description = details.details.description.value;
                                }

                                if (description) {
                                    book.description = description;
                                }
                            }
                        }
                    });
                } catch (detailsError) {
                    console.warn("Failed to bulk fetch descriptions:", detailsError);
                }
            }

            return { docs: books, numFound: data.numFound || 0, rawCount };
        } catch (error) {
            console.error("Failed to search books:", error);
            return { docs: [], numFound: 0, rawCount: 0 };
        }
    },

    getBookDetails: async (id: string): Promise<Book | null> => {
        // First check if it's a demo book
        const demoBooks = api.getDemoBooks();
        const demoBook = demoBooks.find(b => b.id === id);
        if (demoBook) {
            return demoBook;
        }

        try {
            // Fetch Work details
            const workUrl = `${OPEN_LIBRARY_WORKS_URL}/works/${id}.json`;
            const response = await fetch(workUrl);

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const workData: OpenLibraryWork = await response.json();

            // Fetch author name if available
            let authorName = "Unknown Author";
            if (workData.authors && workData.authors.length > 0) {
                try {
                    const authorKey = workData.authors[0].author.key;
                    const authorResponse = await fetch(`https://openlibrary.org${authorKey}.json`);
                    if (authorResponse.ok) {
                        const authorData = await authorResponse.json();
                        authorName = authorData.name;
                    }
                } catch (e) {
                    console.warn("Failed to fetch author details", e);
                }
            }

            const book = transformOpenLibraryWork(workData, authorName);

            // Parallel requests: Fetch Editions (for read link) AND Search (for rating)
            const [editionsResponse, searchResult] = await Promise.all([
                fetch(`${OPEN_LIBRARY_WORKS_URL}/works/${id}/editions.json?limit=20`),
                api.searchBooks(`key:/works/${id}`, 1) // Search by key to get rating
            ]);

            const ratingResults = searchResult.docs;

            // Process Ratings & Metadata from Search Result
            if (ratingResults && ratingResults.length > 0) {
                const ratingBook = ratingResults[0];
                book.rating = ratingBook.rating;
                book.ratingsCount = ratingBook.ratingsCount;

                // Fallback/Enhance metadata from search result (often has aggregated data like median page count)
                if (!book.pageCount && ratingBook.pageCount) {
                    book.pageCount = ratingBook.pageCount;
                }
                if (!book.publisher && ratingBook.publisher) {
                    book.publisher = ratingBook.publisher;
                }
                if (!book.publishedDate && ratingBook.publishedDate) {
                    book.publishedDate = ratingBook.publishedDate;
                }
                if (!book.firstSentence && ratingBook.firstSentence) {
                    book.firstSentence = ratingBook.firstSentence;
                }
                if (!book.isbn && ratingBook.isbn) {
                    book.isbn = ratingBook.isbn;
                }

                // Fallback to search result description (first_sentence) if main description is missing
                if (book.description === "No description available." &&
                    ratingBook.description &&
                    ratingBook.description !== "Description not available in search results.") {
                    book.description = ratingBook.description;
                }
            }

            // Process Editions
            try {
                const editionsData = await editionsResponse.json();

                if (editionsData.entries) {
                    // Find an edition that has an Internet Archive identifier ('ia' or 'ocaid')
                    // and ideally is not restricted (though API doesn't always say, 'ia' usually means there's a scan)
                    const readableEdition = editionsData.entries.find((entry: any) => entry.ia || entry.ocaid);

                    if (readableEdition) {
                        const iaId = readableEdition.ia || readableEdition.ocaid;
                        console.log(`Found readable edition for ${id}: ${iaId}`);
                        // Store the IA ID for the embedded reader
                        book.iaId = iaId;
                        // Construct the Read link using the edition key
                        // Example: https://openlibrary.org/books/OL123M/read
                        book.readLink = `https://openlibrary.org${readableEdition.key}/read`;
                    } else {
                        console.log(`No readable edition found for ${id}`);
                    }

                    // Extract ISBN from any edition if not already set
                    if (!book.isbn) {
                        const editionWithIsbn = editionsData.entries.find((e: any) => e.isbn_13 || e.isbn_10);
                        if (editionWithIsbn) {
                            book.isbn = editionWithIsbn.isbn_13?.[0] || editionWithIsbn.isbn_10?.[0];
                        }
                    }

                    // Extract Publisher if not set
                    if (!book.publisher) {
                        const editionWithPublisher = editionsData.entries.find((e: any) => e.publishers && e.publishers.length > 0);
                        if (editionWithPublisher) {
                            book.publisher = editionWithPublisher.publishers[0];
                        }
                    }

                    // Extract Page Count if not set
                    if (!book.pageCount) {
                        const editionWithPages = editionsData.entries.find((e: any) => e.number_of_pages);
                        if (editionWithPages) {
                            book.pageCount = editionWithPages.number_of_pages;
                        }
                    }
                }
            } catch (editionError) {
                console.warn("Failed to fetch editions for read link:", editionError);
            }

            return book;
        } catch (error) {
            console.error("Failed to get book details:", error);
            return null;
        }
    },

    getTrendingBooks: async (): Promise<Book[]> => {
        try {
            // Use search API to get books with ratings
            // Searching for "subject:fiction" sorted by rating or random to get interesting books
            // We use a broad search to simulate "trending" but with real data
            const { docs } = await api.searchBooks("subject:fiction", 12, 1, "rating");
            return docs;
        } catch (error) {
            console.error("Failed to get trending books:", error);
            return [];
        }
    },

    getRecommendations: async (): Promise<Book[]> => {
        try {
            // Use search API to get books with ratings for recommendations
            // Searching for "subject:psychology" (or other interesting subjects)
            const { docs } = await api.searchBooks("subject:psychology", 6, 1, "rating");
            return docs;
        } catch (error) {
            console.error("Failed to get recommendations:", error);
            return [];
        }
    },

    getBookDescription: async (id: string): Promise<string | null> => {
        try {
            const response = await fetch(`${OPEN_LIBRARY_WORKS_URL}/works/${id}.json`);
            if (!response.ok) return null;
            const work = await response.json();

            let description = null;
            if (typeof work.description === 'string') {
                description = work.description;
            } else if (work.description?.value) {
                description = work.description.value;
            }

            return description;
        } catch (error) {
            console.warn(`Failed to fetch description for ${id}`, error);
            return null;
        }
    },

    getDemoBooks: (): Book[] => {
        return [
            {
                id: "demo_alice",
                title: "Alice's Adventures in Wonderland",
                author: "Lewis Carroll",
                genre: ["Classic", "Fantasy"],
                progress: 0,
                rating: 4.8,
                addedDate: new Date(),
                tags: ["Demo", "Classic"],
                isFavorite: false,
                pageCount: 120,
                currentPage: 0,
                description: "Alice's Adventures in Wonderland (commonly shortened to Alice in Wonderland) is an 1865 novel written by English author Charles Lutwidge Dodgson under the pseudonym Lewis Carroll. It tells of a young girl named Alice who falls through a rabbit hole into a subterranean fantasy world populated by peculiar, anthropomorphic creatures.",
                image: "https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg",
                fullContent: `
# Chapter I. Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it was no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be too late!” (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering how in the world she was to get out again.

The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.

Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next. First, she tried to look down and make out what she was coming to, but it was too dark to see anything; then she looked at the sides of the well, and noticed that they were filled with cupboards and book-shelves; here and there she saw maps and pictures hung upon pegs. She took down a jar from one of the shelves as she passed; it was labelled “ORANGE MARMALADE”, but to her great disappointment it was empty: she did not like to drop the jar for fear of killing somebody, so managed to put it into one of the cupboards as she fell past it.

“Well!” thought Alice to herself, “after such a fall as this, I shall think nothing of tumbling down stairs! How brave they’ll all think me at home! Why, I wouldn’t say anything about it, even if I fell off the top of the house!” (Which was very likely true.)

Down, down, down. Would the fall NEVER come to an end! “I wonder how many miles I’ve fallen by this time?” she said aloud. “I must be getting somewhere near the centre of the earth. Let me see: that would be four thousand miles down, I think—” (for, you see, Alice had learnt several things of this sort in her lessons in the schoolroom, and though this was not a VERY good opportunity for showing off her knowledge, as there was no one to listen to her, still it was good practice to say it over) “—yes, that’s about the right distance—but then I wonder what Latitude or Longitude I’ve got to?” (Alice had no idea what Latitude was, or Longitude either, but thought they were nice grand words to say.)

Presently she began again. “I wonder if I shall fall right through the earth! How funny it’ll seem to come out among the people that walk with their heads downward! The Antipathies, I think—” (she was rather glad there was no one listening, this time, as it didn’t sound at all the right word) “—but I shall have to ask them what the name of the country is, you know. Please, Ma’am, is this New Zealand or Australia?” (and she tried to curtsey as she spoke—fancy curtseying as you’re falling through the air! Do you think you could manage it?) “And what an ignorant little girl she’ll think me for asking! No, it’ll never do to ask: perhaps I shall see it written up somewhere.”

Down, down, down. There was nothing else to do, so Alice soon began talking again. “Dinah’ll miss me very much to-night, I should think!” (Dinah was the cat.) “I hope they’ll remember her saucer of milk at tea-time. Dinah my dear! I wish you were down here with me! There are no mice in the air, I’m afraid, but you might catch a bat, and that’s very like a mouse, you know. But do cats eat bats, I wonder?” And here Alice began to get rather sleepy, and went on saying to herself, in a dreamy sort of way, “Do cats eat bats? Do cats eat bats?” and sometimes, “Do bats eat cats?” for, you see, as she couldn’t answer either question, it didn’t much matter which way she put it. She felt that she was dozing off, and had just begun to dream that she was walking hand in hand with Dinah, and saying to her very earnestly, “Now, Dinah, tell me the truth: did you ever eat a bat?” when suddenly, thump! thump! down she came upon a heap of sticks and dry leaves, and the fall was over.

Alice was not a bit hurt, and she jumped up on her feet in a moment. She looked up, but it was all dark overhead; before her was another long passage, and the White Rabbit was still in sight, hurrying down it. There was not a moment to be lost: away went Alice like the wind, and was just in time to hear it say, as it turned a corner, “Oh my ears and whiskers, how late it’s getting!” She was close behind it when she turned the corner, but the Rabbit was no longer to be seen: she found herself in a long, low hall, which was lit up by a row of lamps hanging from the roof.

There were doors all round the hall, but they were all locked; and when Alice had been all the way down one side and up the other, trying every door, she walked sadly down the middle, wondering how she was ever to get out again.

Suddenly she came upon a little three-legged table, all made of solid glass; there was nothing on it except a tiny golden key, and Alice’s first thought was that it might belong to one of the doors of the hall; but, alas! either the locks were too large, or the key was too small, but at any rate it would not open any of them. However, on the second time round, she came upon a low curtain she had not noticed before, and behind it was a little door about fifteen inches high: she tried the little golden key in the lock, and to her great delight it fitted!

Alice opened the door and found that it led into a small passage, not much larger than a rat-hole: she knelt down and looked along the passage into the loveliest garden you ever saw. How she longed to get out of that dark hall, and wander about among those beds of bright flowers and those cool fountains, but she could not even get her head through the doorway; “and even if my head would go through,” thought poor Alice, “it would be of very little use without my shoulders. Oh, how I wish I could shut up like a telescope! I think I could, if I only knew how to begin.” For, you see, so many out-of-the-way things had happened lately, that Alice had begun to think that very few things indeed were really impossible.

There seemed to be no use in waiting by the little door, so she went back to the table, half hoping she might find another key on it, or at any rate a book of rules for shutting people up like telescopes: this time she found a little bottle on it, (“which certainly was not here before,” said Alice,) and round the neck of the bottle was a paper label, with the words “DRINK ME” beautifully printed on it in large letters.

It was all very well to say “Drink me,” but the wise little Alice was not going to do THAT in a hurry. “No, I’ll look first,” she said, “and see whether it’s marked ‘poison’ or not;” for she had read several nice little histories about children who had got burnt, and eaten up by wild beasts and other unpleasant things, all because they WOULD not remember the simple rules their friends had taught them: such as, that a red-hot poker will burn you if you hold it too long; and that if you cut your finger VERY deeply with a knife, it usually bleeds; and she had never forgotten that, if you drink much from a bottle marked “poison,” it is almost certain to disagree with you, sooner or later.

However, this bottle was NOT marked “poison,” so Alice ventured to taste it, and finding it very nice, (it had, in fact, a sort of mixed flavour of cherry-tart, custard, pine-apple, roast turkey, toffee, and hot buttered toast,) she very soon finished it off.

*      *      *      *      *      *      *

    *      *      *      *      *      *

*      *      *      *      *      *      *

“What a curious feeling!” said Alice; “I must be shutting up like a telescope.”

And so it was indeed: she was now only ten inches high, and her face brightened up at the thought that she was now the right size for going through the little door into that lovely garden. First, however, she waited for a few minutes to see if she was going to shrink any further: she felt a little nervous about this; “for it might end, you know,” said Alice to herself, “in my going out altogether, like a candle. I wonder what I should be like then?” And she tried to fancy what the flame of a candle is like after the candle is blown out, for she could not remember ever having seen such a thing.

After a while, finding that nothing more happened, she decided on going into the garden at once; but, alas for poor Alice! when she got to the door, she found she had forgotten the little golden key, and when she went back to the table for it, she found she could not possibly reach it: she could see it quite plainly through the glass, and she tried her best to climb up one of the legs of the table, but it was too slippery; and when she had tired herself out with trying, the poor little thing sat down and cried.

“Come, there’s no use in crying like that!” said Alice to herself, rather sharply; “I advise you to leave off this minute!” She generally gave herself very good advice, (though she very seldom followed it), and sometimes she scolded herself so severely as to bring tears into her eyes; and once she remembered trying to box her own ears for having cheated herself in a game of croquet she was playing against herself, for this curious child was very fond of pretending to be two people. “But it’s no use now,” thought poor Alice, “to pretend to be two people! Why, there’s hardly enough of me left to make ONE respectable person!”

Soon her eye fell on a little glass box that was lying under the table: she opened it, and found in it a very small cake, on which the words “EAT ME” were beautifully marked in currants. “Well, I’ll eat it,” said Alice, “and if it makes me grow larger, I can reach the key; and if it makes me grow smaller, I can creep under the door; so either way I’ll get into the garden, and I don’t care which happens!”

She ate a little bit, and said anxiously to herself, “Which way? Which way?”, holding her hand on the top of her head to feel which way it was growing, and she was quite surprised to find that she remained the same size: to be sure, this generally happens when one eats cake, but Alice had got so much into the way of expecting nothing but out-of-the-way things to happen, that it seemed quite dull and stupid for life to go on in the common way.

So she set to work, and very soon finished off the cake.

*      *      *      *      *      *      *

    *      *      *      *      *      *

*      *      *      *      *      *      *
`
            },
            {
                id: "demo_pride",
                title: "Pride and Prejudice",
                author: "Jane Austen",
                genre: ["Classic", "Romance"],
                progress: 0,
                rating: 4.7,
                addedDate: new Date(),
                tags: ["Demo", "Classic"],
                isFavorite: false,
                pageCount: 300,
                currentPage: 0,
                description: "Pride and Prejudice is an 1813 novel of manners by Jane Austen. The novel follows the character development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.",
                image: "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
                fullContent: `
# Chapter 1

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”

Mr. Bennet replied that he had not.

“But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”

Mr. Bennet made no answer.

“Do you not want to know who has taken it?” cried his wife impatiently.

“You want to tell me, and I have no objection to hearing it.”

This was invitation enough.

“Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.”

“What is his name?”

“Bingley.”

“Is he married or single?”

“Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!”

“How so? How can it affect them?”

“My dear Mr. Bennet,” replied his wife, “how can you be so tiresome! You must know that I am thinking of his marrying one of them.”

“Is that his design in settling here?”

“Design! Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes.”

“I see no occasion for that. You and the girls may go, or you may send them by themselves, which perhaps will be still better, for as you are as handsome as any of them, Mr. Bingley may like you the best of the party.”

“My dear, you flatter me. I certainly have had my share of beauty, but I do not pretend to be anything extraordinary now. When a woman has five grown-up daughters, she ought to give over thinking of her own beauty.”

“In such cases, a woman has not often much beauty to think of.”

“But, my dear, you must indeed go and see Mr. Bingley when he comes into the neighbourhood.”

“It is more than I engage for, I assure you.”

“But consider your daughters. Only think what an establishment it would be for one of them. Sir William and Lady Lucas are determined to go, merely on that account, for in general, you know, they visit no newcomers. Indeed you must go, for it will be impossible for us to visit him if you do not.”

“You are over-scrupulous, surely. I dare say Mr. Bingley will be very glad to see you; and I will send a few lines by you to assure him of my hearty consent to his marrying whichever he chooses of the girls; though I must throw in a good word for my little Lizzy.”

“I desire you will do no such thing. Lizzy is not a bit better than the others; and I am sure she is not half so handsome as Jane, nor half so good-humoured as Lydia. But you are always giving her the preference.”

“They have none of them much to recommend them,” replied he; “they are all silly and ignorant like other girls; but Lizzy has something more of quickness than her sisters.”

“Mr. Bennet, how can you abuse your own children in such a way? You take delight in vexing me. You have no compassion for my poor nerves.”

“You mistake me, my dear. I have a high respect for your nerves. They are my old friends. I have heard you mention them with consideration these last twenty years at least.”

“Ah, you do not know what I suffer.”

“But I hope you will get over it, and live to see many young men of four thousand a year come into the neighbourhood.”

“It will be no use to us, if twenty such should come, since you will not visit them.”

“Depend upon it, my dear, that when there are twenty, I will visit them all.”

Mr. Bennet was so odd a mixture of quick parts, sarcastic humour, reserve, and caprice, that the experience of three-and-twenty years had been insufficient to make his wife understand his character. Her mind was less difficult to develop. She was a woman of mean understanding, little information, and uncertain temper. When she was discontented, she fancied herself nervous. The business of her life was to get her daughters married; its solace was visiting and news.
`
            }
        ];
    }
};
