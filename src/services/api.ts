import { Book, Edition } from "../utils/collections";

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

// Helper for fetch with retry
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<Response> => {
    try {
        const response = await fetch(url, options);
        if (response.status === 503 || response.status === 429) {
            if (retries > 0) {
                console.warn(`Retrying ${url} after ${backoff}ms (Status: ${response.status})`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Retrying ${url} after ${backoff}ms (Error: ${error})`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
    }
};

export const api = {
    // Search Books
    searchBooks: async (query: string, maxResults = 40, page = 1, sort?: string, includeLowQuality = false): Promise<{ docs: Book[], numFound: number, rawCount: number }> => {
        try {
            // Request isbn field to fetch descriptions later
            const fields = "key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject,language,publisher,ratings_average,ratings_count,first_sentence,isbn";
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

            const response = await fetchWithRetry(url);
            if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);
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

                    const detailsResponse = await fetchWithRetry(detailsUrl);
                    if (detailsResponse.ok) {
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
                    }
                } catch (descError) {
                    console.warn("Failed to fetch bulk descriptions:", descError);
                }
            }

            return { docs: books, numFound: data.numFound, rawCount };
        } catch (error) {
            console.error("Failed to search books:", error);
            return { docs: [], numFound: 0, rawCount: 0 };
        }
    },

    getBookDetails: async (id: string): Promise<Book> => {
        try {
            // Handle Demo Books with Real Data
            let workId = id;
            let isDemo = false;
            let demoContent = "";

            if (id === "demo_alice") {
                workId = "OL151411W"; // Alice's Adventures in Wonderland
                isDemo = true;
            } else if (id === "demo_pride") {
                workId = "OL66554W"; // Pride and Prejudice
                isDemo = true;
            }

            // Fetch the main work details
            const response = await fetch(`${OPEN_LIBRARY_WORKS_URL}/works/${workId}.json`);
            if (!response.ok) {
                throw new Error('Failed to fetch book details');
            }
            const data: OpenLibraryWork = await response.json();

            // Fetch author details
            let authorName = "Unknown Author";
            if (data.authors && data.authors.length > 0) {
                try {
                    const authorId = data.authors[0].author.key.replace("/authors/", "");
                    const authorResponse = await fetch(`${OPEN_LIBRARY_WORKS_URL}/authors/${authorId}.json`);
                    if (authorResponse.ok) {
                        const authorData = await authorResponse.json();
                        authorName = authorData.name || "Unknown Author";
                    }
                } catch (e) {
                    console.warn("Failed to fetch author details", e);
                }
            }

            // Transform to our Book interface
            const book = transformOpenLibraryWork(data);
            book.author = authorName;

            // If it was a demo book, restore the demo ID and content
            if (isDemo) {
                const demoBooks = api.getDemoBooks();
                const demoBook = demoBooks.find(b => b.id === id);
                if (demoBook) {
                    book.id = id;
                    book.fullContent = demoBook.fullContent;
                    book.image = demoBook.image;
                    book.openLibraryId = demoBook.openLibraryId;
                    // Do NOT reset progress here, let it be handled by context/storage
                }
            }

            // Parallel requests: Fetch Editions, Search (for rating), and Ratings (breakdown)
            const [editionsResponse, searchResult, ratingsResponse] = await Promise.all([
                fetch(`${OPEN_LIBRARY_WORKS_URL}/works/${workId}/editions.json?limit=20`),
                api.searchBooks(`key:/works/${workId}`, 1),
                fetch(`${OPEN_LIBRARY_WORKS_URL}/works/${workId}/ratings.json`)
            ]);

            let editions: Edition[] = [];
            if (editionsResponse.ok) {
                const editionsData = await editionsResponse.json();
                editions = (editionsData.entries || []).map((entry: any) => ({
                    key: entry.key,
                    title: entry.title,
                    publisher: entry.publishers?.[0],
                    publishDate: entry.publish_date,
                    language: entry.languages?.[0]?.key?.split("/").pop(),
                    isbn: entry.isbn_13?.[0] || entry.isbn_10?.[0],
                    cover: (entry.covers && entry.covers[0])
                        ? `https://covers.openlibrary.org/b/id/${entry.covers[0]}-M.jpg`
                        : undefined
                }));
            }

            let ratingCounts = {};
            if (ratingsResponse.ok) {
                const ratingsData = await ratingsResponse.json();
                ratingCounts = ratingsData.counts || {};
            }

            // Fetch Bookshelves (Reader Activity)
            let communityReviews: any[] = [];
            try {
                const bookshelvesResponse = await fetch(`${OPEN_LIBRARY_WORKS_URL}/works/${workId}/bookshelves.json`);
                if (bookshelvesResponse.ok) {
                    const bookshelvesData = await bookshelvesResponse.json();
                    const counts = bookshelvesData.counts || {};

                    const wantToRead = counts.want_to_read || 0;
                    const currentlyReading = counts.currently_reading || 0;
                    const alreadyRead = counts.already_read || 0;
                    const totalActivity = wantToRead + currentlyReading + alreadyRead;

                    if (totalActivity > 0) {
                        communityReviews.push({
                            category: "Aktivitas Pembaca",
                            count: totalActivity,
                            items: [
                                { label: "Ingin Baca", percentage: `${Math.round((wantToRead / totalActivity) * 100)}%` },
                                { label: "Sedang Baca", percentage: `${Math.round((currentlyReading / totalActivity) * 100)}%` },
                                { label: "Sudah Baca", percentage: `${Math.round((alreadyRead / totalActivity) * 100)}%` }
                            ]
                        });
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch bookshelves", e);
            }

            // Enhance with search result data (rating, etc.)
            if (searchResult.docs && searchResult.docs.length > 0) {
                const searchDoc = searchResult.docs[0];
                if (!book.rating && searchDoc.rating) book.rating = searchDoc.rating;
                if (!book.ratingsCount && searchDoc.ratingsCount) book.ratingsCount = searchDoc.ratingsCount;
                if (!book.isbn && searchDoc.isbn) book.isbn = searchDoc.isbn;
                if (!book.publisher && searchDoc.publisher) book.publisher = searchDoc.publisher;
                if (!book.pageCount && searchDoc.pageCount) book.pageCount = searchDoc.pageCount;
                if ((!book.description || book.description === "No description available") && searchDoc.description) {
                    book.description = searchDoc.description;
                }
                // Extract IA ID if available in search result
                if (searchDoc.iaId) book.iaId = searchDoc.iaId;

                // Fix: Ensure author is populated from search result if missing in work details
                if (searchDoc.author && (book.author === "Unknown Author" || !book.author)) {
                    book.author = searchDoc.author;
                }
            }

            // Populate editions and ratings
            book.editions = editions;
            book.ratingCounts = ratingCounts;
            book.communityReviews = communityReviews;

            return book;
        } catch (error) {
            console.error("Error fetching book details:", error);
            throw error;
        }
    },

    getTrendingBooks: async (): Promise<Book[]> => {
        const { docs } = await api.searchBooks("trending", 10);
        return docs;
    },

    getRecommendations: async (): Promise<Book[]> => {
        const { docs } = await api.searchBooks("classic", 10);
        return docs;
    },

    getCommunityData: async (): Promise<any> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    activityFeed: [
                        {
                            id: 1,
                            user: { name: "Budi S.", avatar: "BS", isPremium: true },
                            action: "finished reading",
                            book: "Clean Code",
                            timeAgo: "2 hours ago",
                            likes: 12,
                            comments: 3,
                            hasLiked: false,
                        },
                        {
                            id: 2,
                            user: { name: "Rina A.", avatar: "RA", isPremium: false },
                            action: "is currently reading",
                            book: "The Pragmatic Programmer",
                            timeAgo: "5 hours ago",
                            likes: 5,
                            comments: 1,
                            hasLiked: true,
                        },
                    ],
                    bookClubs: [
                        {
                            id: 1,
                            name: "Pecinta Fiksi Ilmiah",
                            description: "Grup untuk mendiskusikan buku-buku fiksi ilmiah terbaru dan klasik.",
                            icon: "🚀",
                            members: 123,
                            books: 12,
                            isJoined: true,
                        },
                        {
                            id: 2,
                            name: "Klub Buku Horor",
                            description: "Untuk kamu yang suka cerita seram dan menegangkan.",
                            icon: "👻",
                            members: 66,
                            books: 23,
                            isJoined: false,
                        },
                    ],
                    challenges: [
                        {
                            id: 1,
                            title: "Tantangan Baca 2024",
                            description: "Selesaikan 50 buku di tahun 2024",
                            progress: 35,
                            target: 50,
                            endsIn: "35 hari lagi",
                            participants: 1200,
                            reward: "Lencana Emas",
                        },
                    ],
                    suggestedUsers: [
                        { name: "Andi F.", avatar: "AF", books: 120, followers: 1200, isFollowing: false },
                        { name: "Citra L.", avatar: "CL", books: 80, followers: 800, isFollowing: true },
                    ],
                });
            }, 1000);
        });
    },

    getBookDescription: async (id: string): Promise<string> => {
        try {
            const response = await fetch(`${OPEN_LIBRARY_WORKS_URL}/works/${id}.json`);
            if (!response.ok) return "";
            const data = await response.json();
            return typeof data.description === 'string' ? data.description : data.description?.value || "";
        } catch (e) {
            return "";
        }
    },

    getDemoBooks: (): Book[] => {
        return [
            {
                id: "demo_alice",
                title: "Alice's Adventures in Wonderland",
                author: "Lewis Carroll",
                rating: 4.8,
                ratingsCount: 12500,
                image: "https://covers.openlibrary.org/b/id/8595966-L.jpg",
                description: "A young girl named Alice falls through a rabbit hole into a fantasy world populated by peculiar, anthropomorphic creatures.",
                isFavorite: false,
                progress: 0,
                currentPage: 0,
                pageCount: 200,
                publisher: "Macmillan",
                publishedDate: "1865",
                genre: ["Fantasy", "Classic"],
                addedDate: new Date(),
                tags: ["Demo", "Fantasy"],
                openLibraryId: "OL151411W",
                fullContent: `
# Chapter I. Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be too late!" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering how in the world she was to get out again.

The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.

Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next. First, she tried to look down and make out what she was coming to, but it was too dark to see anything; then she looked at the sides of the well, and noticed that they were filled with cupboards and book-shelves; here and there she saw maps and pictures hung upon pegs. She took down a jar from one of the shelves as she passed; it was labelled "ORANGE MARMALADE", but to her great disappointment it was empty: she did not like to drop the jar for fear of killing somebody, so managed to put it into one of the cupboards as she fell past it.

"Well!" thought Alice to herself, "after such a fall as this, I shall think nothing of tumbling down stairs! How brave they'll all think me at home! Why, I wouldn't say anything about it, even if I fell off the top of the house!" (Which was very likely true.)

Down, down, down. Would the fall NEVER come to an end! "I wonder how many miles I've fallen by this time?" she said aloud. "I must be getting somewhere near the centre of the earth. Let me see: that would be four thousand miles down, I think--" (for, you see, Alice had learnt several things of this sort in her lessons in the schoolroom, and though this was not a VERY good opportunity for showing off her knowledge, as there was no one to listen to her, still it was good practice to say it over) "--yes, that's about the right distance--but then I wonder what Latitude or Longitude I've got to?" (Alice had no idea what Latitude was, or Longitude either, but thought they were nice grand words to say.)

# Chapter II. The Pool of Tears

"Curiouser and curiouser!" cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); "now I'm opening out like the largest telescope that ever was! Good-bye, feet!" (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off). "Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I'm sure I shan't be able! I shall be a great deal too far off to trouble myself about you: you must manage the best way you can; --but I must be kind to them," thought Alice, "or perhaps they won't walk the way I want to go! Let me see: I'll give them a new pair of boots every Christmas."

And she went on planning to herself how she would manage it. "They must go by the carrier," she thought; "and how funny it'll seem, sending presents to one's own feet! And how odd the directions will look!

    ALICE'S RIGHT FOOT, ESQ.
    HEARTHRUG,
    NEAR THE FENDER,
    (WITH ALICE'S LOVE).

Oh dear, what nonsense I'm talking!"

Just then her head struck against the roof of the hall: in fact she was now more than nine feet high, and she at once took up the little golden key and hurried off to the garden door.

Poor Alice! It was as much as she could do, lying down on one side, to look through into the garden with one eye; but to get through was more hopeless than ever: she sat down and began to cry again.

"You ought to be ashamed of yourself," said Alice, "a great girl like you," (she might well say this), "to go on crying in this way! Stop this moment, I tell you!" But she went on all the same, shedding gallons of tears, until there was a large pool all round her, about four inches deep and reaching half down the hall.

After a time she heard a little pattering of feet in the distance, and she hastily dried her eyes to see what was coming. It was the White Rabbit returning, splendidly dressed, with a pair of white kid gloves in one hand and a large fan in the other: he came trotting along in a great hurry, muttering to himself as he came, "Oh! the Duchess, the Duchess! Oh! won't she be savage if I've kept her waiting!" Alice felt so desperate that she was ready to ask help of any one; so, when the Rabbit came near her, she began, in a low, timid voice, "If you please, sir--" The Rabbit started violently, dropped the white kid gloves and the fan, and skurried away into the darkness as hard as he could go.

# Chapter III. A Caucus-Race and a Long Tale

They were indeed a queer-looking party that assembled on the bank--the birds with draggled feathers, the animals with their fur clinging close to them, and all dripping wet, cross, and uncomfortable.

The first question of course was, how to get dry again: they had a consultation about this, and after a few minutes it seemed quite natural to Alice to find herself talking familiarly with them, as if she had known them all her life. Indeed, she had quite a long argument with the Lory, who at last turned sulky, and would only say, "I am older than you, and must know better;" and this Alice would not allow without knowing how old it was, and as the Lory positively refused to tell its age, there was no more to be said.

At last the Mouse, who seemed to be a person of authority among them, called out, "Sit down, all of you, and listen to me! I'll soon make you dry enough!" They all sat down at once, in a large ring, with the Mouse in the middle. Alice kept her eyes anxiously fixed on it, for she felt sure she would catch a bad cold if she did not get dry very soon.

"Ahem!" said the Mouse with an important air, "are you all ready? This is the driest thing I know. Silence all round, if you please! 'William the Conqueror, whose cause was favoured by the pope, was soon submitted to by the English, who wanted leaders, and had been of late much accustomed to usurpation and conquest. Edwin and Morcar, the earls of Mercia and Northumbria--'"

"Ugh!" said the Lory, with a shiver.

"I beg your pardon!" said the Mouse, frowning, but very politely: "Did you speak?"

"Not I!" said the Lory hastily.

"I thought you did," said the Mouse. "--I proceed. 'Edwin and Morcar, the earls of Mercia and Northumbria, declared for him: and even Stigand, the patriotic archbishop of Canterbury, found it advisable--'"

"Found WHAT?" said the Duck.

"Found IT," the Mouse replied rather crossly: "of course you know what 'it' means."

"I know what 'it' means well enough, when I find a thing," said the Duck: "it's generally a frog or a worm. The question is, what did the archbishop find?"

The Mouse did not notice this question, but hurriedly went on, "'--found it advisable to go with Edgar Atheling to meet William and offer him the crown. William's conduct at first was moderate. But the insolence of his Normans--' How are you getting on now, my dear?" it continued, turning to Alice as it spoke.

"As wet as ever," said Alice in a melancholy tone: "it doesn't seem to dry me at all."

"In that case," said the Dodo solemnly, rising to its feet, "I move that the meeting adjourn, for the immediate adoption of more energetic remedies."

"Speak English!" said the Eaglet. "I don't know the meaning of half those long words, and, what's more, I don't believe you do either!" And the Eaglet bent down its head to hide a smile: some of the other birds tittered audibly.

"What I was going to say," said the Dodo in an offended tone, "was, that the best thing to get us dry would be a Caucus-race."

"What IS a Caucus-race?" said Alice; not that she wanted much to know, but the Dodo had paused as if it thought that SOMEBODY ought to speak, and no one else seemed inclined to say anything.

"Why," said the Dodo, "the best way to explain it is to do it." (And, as you might like to try the thing yourself, some winter day, I will tell you how the Dodo managed it.)

First it marked out a race-course, in a sort of circle, ("the exact shape doesn't matter," it said,) and then all the party were placed along the course, here and there. There was no "One, two, three, and away," but they began running when they liked, and left off when they liked, so that it was not easy to know when the race was over. However, when they had been running half an hour or so, and were quite dry again, the Dodo called out, "The race is over!" and they all crowded round it, panting, and asking, "But who has won?"

# Chapter IV. The Rabbit Sends in a Little Bill

It was the White Rabbit, trotting slowly back again, and looking anxiously about as it went, as if it had lost something; and she heard it muttering to itself "The Duchess! The Duchess! Oh my dear paws! Oh my fur and whiskers! She'll get me executed, as sure as ferrets are ferrets! Where CAN I have dropped them, I wonder?" Alice guessed in a moment that it was looking for the fan and the pair of white kid gloves, and she very good-naturedly began hunting about for them, but they were nowhere to be seen--everything seemed to have changed since her swim in the pool, and the great hall, with the glass table and the little door, had vanished completely.

Very soon the Rabbit noticed Alice, as she went hunting about, and called out to her in an angry tone, "Why, Mary Ann, what ARE you doing out here? Run home this moment, and fetch me a pair of gloves and a fan! Quick, now!" And Alice was so much frightened that she ran off at once in the direction it pointed to, without trying to explain the mistake it had made.

# Chapter V. Advice from a Caterpillar

The Caterpillar and Alice looked at each other for some time in silence: at last the Caterpillar took the hookah out of its mouth, and addressed her in a languid, sleepy voice.

"Who are YOU?" said the Caterpillar.

This was not an encouraging opening for a conversation. Alice replied, rather shyly, "I--I hardly know, sir, just at present--at least I know who I WAS when I got up this morning, but I think I must have been changed several times since then."

"What do you mean by that?" said the Caterpillar sternly. "Explain yourself!"

"I can't explain myself, I'm afraid, sir" said Alice, "because I'm not myself, you see."

"I don't see," said the Caterpillar.

# Chapter VI. Pig and Pepper

For a minute or two she stood looking at the house, and wondering what to do next, when suddenly a footman in livery came running out of the wood--(she considered him to be a footman because he was in livery: otherwise, judging by his face only, she would have called him a fish)--and rapped loudly at the door with his knuckles. It was opened by another footman in livery, with a round face, and large eyes like a frog; and both footmen, Alice noticed, had powdered hair that curled all over their heads. She felt very curious to know what it was all about, and crept a little way out of the wood to listen.

The Fish-Footman began by producing from under his arm a great letter, nearly as large as himself, and this he handed over to the other, saying, in a solemn tone, "For the Duchess. An invitation from the Queen to play croquet." The Frog-Footman repeated, in the same solemn tone, only changing the order of the words a little, "From the Queen. An invitation for the Duchess to play croquet."

Then they both bowed low, and their curls got entangled together.

# Chapter VII. A Mad Tea-Party

There was a table set out under a tree in front of the house, and the March Hare and the Hatter were having tea at it: a Dormouse was sitting between them, fast asleep, and the other two were using it as a cushion, resting their elbows on it, and talking over its head. "Very uncomfortable for the Dormouse," thought Alice; "only, as it's asleep, I suppose it doesn't mind."

The table was a large one, but the three were all crowded together at one corner of it: "No room! No room!" they cried out when they saw Alice coming. "There's PLENTY of room!" said Alice indignantly, and she sat down in a large arm-chair at one end of the table.

"Have some wine," the March Hare said in an encouraging tone.

Alice looked all round the table, but there was nothing on it but tea. "I don't see any wine," she remarked.

"There isn't any," said the March Hare.

# Chapter VIII. The Queen's Croquet-Ground

A large rose-tree stood near the entrance of the garden: the roses growing on it were white, but there were three gardeners at it, busily painting them red. Alice thought this a very curious thing, and she went nearer to watch them, and just as she came up to them she heard one of them say, "Look out now, Five! Don't go splashing paint over me like that!"

"I couldn't help it," said Five, in a sulky tone; "Seven jogged my elbow."

On which Seven looked up and said, "That's right, Five! Always lay the blame on others!"

"YOU'D better not talk!" said Five. "I heard the Queen say only yesterday you deserved to be beheaded!"

# Chapter IX. The Mock Turtle's Story

"You can't think how glad I am to see you again, you dear old thing!" said the Duchess, as she tucked her arm affectionately into Alice's, and they walked off together.

Alice was very glad to find her in such a pleasant temper, and thought to herself that perhaps it was only the pepper that had made her so savage when they met in the kitchen.

"When I'm a Duchess," she said to herself, (not in a very hopeful tone though), "I won't have any pepper in my kitchen AT ALL. Soup does very well without--Maybe it's always pepper that makes people hot-tempered," she went on, very much pleased at having found out a new kind of rule, "and vinegar that makes them sour--and camomile that makes them bitter--and--and barley-sugar and such things that make children sweet-tempered. I only wish people knew that: then they wouldn't be so stingy about it, you know--"

# Chapter X. The Lobster Quadrille

The Mock Turtle sighed deeply, and drew the back of one flapper across his eyes. He looked at Alice, and tried to speak, but for a minute or two sobs choked his voice. "Same as if he had a bone in his throat," said the Gryphon: and it set to work shaking him and punching him in the back. At last the Mock Turtle recovered his voice, and, with tears running down his cheeks, he went on again:--

"You may not have lived much under the sea--" ("I haven't," said Alice)--"and perhaps you were never even introduced to a lobster--" (Alice began to say "I once tasted--" but checked herself hastily, and said "No, never") "--so you can have no idea what a delightful thing a Lobster Quadrille is!"

"No, indeed," said Alice. "What sort of a dance is it?"

"Why," said the Gryphon, "you first form into a line along the sea-shore--"

"Two lines!" cried the Mock Turtle. "Seals, turtles, salmon, and so on; then, when you've cleared all the jelly-fish out of the way--"

# Chapter XI. Who Stole the Tarts?

The King and Queen of Hearts were seated on their throne when they arrived, with a great crowd assembled about them--all sorts of little birds and beasts, as well as the whole pack of cards: the Knave was standing before them, in chains, with a soldier on each side to guard him; and near the King was the White Rabbit, with a trumpet in one hand, and a scroll of parchment in the other. In the very middle of the court was a table, with a large dish of tarts upon it: they looked so good, that it made Alice quite hungry to look at them--"I wish they'd get the trial done," she thought, "and hand round the refreshments!" But there seemed to be no chance of this, so she began looking at everything about her, to pass away the time.

Alice had never been in a court of justice before, but she had read about them in books, and she was quite pleased to find that she knew the name of nearly everything there. "That's the judge," she said to herself, "because of his great wig."

The judge, by the way, was the King; and as he wore his crown over the wig, (look at the frontispiece if you want to see how he did it,) he did not look at all comfortable, and it was certainly not becoming.

# Chapter XII. Alice's Evidence

"Here!" cried Alice, quite forgetting in the flurry of the moment how large she had grown in the last few minutes, and she jumped up in such a hurry that she tipped over the jury-box with the edge of her skirt, upsetting all the jurymen on to the heads of the crowd below, and there they lay sprawling about, reminding her very much of a globe of goldfish she had accidentally upset the week before.

"Oh, I BEG your pardon!" she exclaimed in a tone of great dismay, and began picking them up again as quickly as she could, for the accident of the goldfish kept running in her head, and she had a vague sort of idea that they must be collected at once and put back into the jury-box, or they would die.

"The trial cannot proceed," said the King in a very grave voice, "until all the jurymen are back in their proper places--ALL," he repeated with great emphasis, looking hard at Alice as he said do.
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
                image: "https://covers.openlibrary.org/b/id/14348537-L.jpg",
                publisher: "T. Egerton",
                publishedDate: "1813",
                openLibraryId: "OL66554W",
                fullContent: `
# Chapter 1

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."

"What is his name?"

"Bingley."

"Is he married or single?"

"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"

"How so? How can it affect them?"

"My dear Mr. Bennet," replied his wife, "how can you be so tiresome! You must know that I am thinking of his marrying one of them."

"Is that his design in settling here?"

"Design! Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes."

"I see no occasion for that. You and the girls may go, or you may send them by themselves, which perhaps will be still better, for as you are as handsome as any of them, Mr. Bingley may like you the best of the party."

"My dear, you flatter me. I certainly have had my share of beauty, but I do not pretend to be anything extraordinary now. When a woman has five grown-up daughters, she ought to give over thinking of her own beauty."

"In such cases, a woman has not often much beauty to think of."

"But, my dear, you must indeed go and see Mr. Bingley when he comes into the neighbourhood."

"It is more than I engage for, I assure you."

"But consider your daughters. Only think what an establishment it would be for one of them. Sir William and Lady Lucas are determined to go, merely on that account, for in general, you know, they visit no newcomers. Indeed you must go, for it will be impossible for us to visit him if you do not."

"You are over-scrupulous, surely. I dare say Mr. Bingley will be very glad to see you; and I will send a few lines by you to assure him of my hearty consent to his marrying whichever he chooses of the girls; though I must throw in a good word for my little Lizzy."

"I desire you will do no such thing. Lizzy is not a bit better than the others; and I am sure she is not half so handsome as Jane, nor half so good-humoured as Lydia. But you are always giving her the preference."

# Chapter 2

Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with:

"I hope Mr. Bingley will like it, Lizzy."

"We are not in a way to know what Mr. Bingley likes," said her mother resentfully, "since we are not to be visited."

"But you forget, mamma," said Elizabeth, "that we shall meet him at the assemblies, and that Mrs. Long promised to introduce him."

"I do not believe Mrs. Long will do any such thing. She has two nieces of her own. She is a selfish, hypocritical woman, and I have no opinion of her."

"No more have I," said Mr. Bennet; "and I am glad to find that you do not depend on her serving you."

Mrs. Bennet deigned not to make any reply, but, unable to contain herself, began scolding one of her daughters.

"Don't keep coughing so, Kitty, for Heaven's sake! Have a little compassion on my nerves. You tear them to pieces."

"Kitty has no discretion in her coughs," said her father; "she times them ill."

"I do not cough for my own amusement," replied Kitty fretfully. "When is your next ball to be, Lizzy?"

# Chapter 3

Not all that Mrs. Bennet, however, with the assistance of her five daughters, could ask on the subject, was sufficient to draw from her husband any satisfactory description of Mr. Bingley. They were obliged to satisfy themselves with the second-hand intelligence of their neighbour, Lady Lucas. Her report was highly favourable. Sir William had been delighted with him. He was quite young, wonderfully handsome, extremely agreeable, and, to crown the whole, he meant to be at the next assembly with a large party. Nothing could be more delightful! To be fond of dancing was a certain step towards falling in love; and very lively hopes of Mr. Bingley's heart were entertained.

"If I can but see one of my daughters happily settled at Netherfield," said Mrs. Bennet to her husband, "and all the others equally well married, I shall have nothing to wish for."

In a few days Mr. Bingley returned Mr. Bennet's visit, and sat about ten minutes with him in his library. He had entertained hopes of being admitted to a sight of the young ladies, of whose beauty he had heard much; but he saw only the father. The ladies were somewhat more fortunate, for they had the advantage of ascertaining from an upper window that he wore a blue coat, and rode a black horse.

# Chapter 4

When Jane and Elizabeth were alone, the former, who had been cautious in her praise of Mr. Bingley before, expressed to her sister just how very much she admired him.

"He is just what a young man ought to be," said she, "sensible, good-humoured, lively; and I never saw such happy manners!--so much ease, with such perfect good breeding!"

"He is also handsome," replied Elizabeth, "which a young man ought likewise to be, if he possibly can. His character is thereby complete."

"I was very much flattered by his asking me to dance a second time. I did not expect such a compliment."

"Did not you? I did for you. But that is one great difference between us. Compliments always take YOU by surprise, and ME never. What could be more natural than his asking you again? He could not help seeing that you were about five times as pretty as every other woman in the room. No thanks to his gallantry for that. Well, he certainly is very agreeable, and I give you leave to like him. You have liked many a stupider person."

"Dear Lizzy!"

# Chapter 5

Within a short walk of Longbourn lived a family with whom the Bennets were particularly intimate. Sir William Lucas had been formerly in trade in Meryton, where he had made a tolerable fortune, and risen to the honour of knighthood by an address to the King during his mayoralty. The distinction had perhaps been felt too strongly. It had given him a disgust to his business, and to his residence in a small market town; and, quitting them both, he had removed with his family to a house about a mile from Meryton, denominated from that period Lucas Lodge, where he could think with pleasure of his own importance, and, unshackled by business, occupy himself solely in being civil to all the world. For, though elated by his rank, it did not render him supercilious; on the contrary, he was all attention to everybody. By nature inoffensive, friendly, and obliging, his presentation at St. James's had made him courteous.

# Chapter 6

The ladies of Longbourn soon waited on those of Netherfield. The visit was soon returned in due form. Miss Bennet's pleasing manners grew on the goodwill of Mrs. Hurst and Miss Bingley; and though the mother was found to be intolerable, and the younger sisters not worth speaking to, a wish of being better acquainted with THEM was expressed towards the two eldest. By Jane, this attention was received with the greatest pleasure, but Elizabeth still saw superciliousness in their treatment of everybody, hardly excepting even her sister, and could not like them; though their kindness to Jane, such as it was, had a value as arising in all probability from the influence of their brother's admiration. It was generally evident whenever they met, that he DID admire her and to her it was equally evident that Jane was yielding to the preference which she had begun to entertain for him from the first, and was in a way to be very much in love; but she considered with pleasure that it was not likely to be discovered by the world in general, since Jane united, with great strength of feeling, a composure of temper and a uniform cheerfulness of manner which would guard her from the suspicions of the impertinent.

# Chapter 7

Mr. Bennet's property consisted almost entirely in an estate of two thousand a year, which, unfortunately for his daughters, was entailed, in default of heirs male, on a distant relation; and their mother's fortune, though ample for her situation in life, could but ill supply the deficiency of his. Her father had been an attorney in Meryton, and had left her four thousand pounds.

She had a sister married to a Mr. Phillips, who had been a clerk to their father and succeeded him in the business, and a brother settled in London in a respectable line of trade.

The village of Longbourn was only one mile from Meryton; a most convenient distance for the young ladies, who were usually tempted thither three or four times a week, to pay their duty to their aunt and to a milliner's shop just over the way. The two youngest of the family, Catherine and Lydia, were particularly frequent in these attentions; their minds were more vacant than their sisters', and when nothing better offered, a walk to Meryton was necessary to amuse their morning hours and furnish conversation for the evening; and however bare of news the country in general might be, they always contrived to learn some from their aunt. At present, indeed, they were well supplied both with news and happiness by the recent arrival of a militia regiment in the neighbourhood; it was to remain the whole winter, and Meryton was the headquarters.

# Chapter 8

At five o'clock the two ladies retired to dress, and at half-past six Elizabeth was summoned to dinner. To the civil inquiries which then poured in, and amongst which she had the pleasure of distinguishing the much superior solicitude of Mr. Bingley's, she could not make a very favourable answer. Jane was by no means better. The sisters, on hearing this, repeated three or four times how much they were grieved, how shocking it was to have a bad cold, and how excessively they disliked being ill themselves; and then thought no more of the matter: and their indifference towards Jane when not immediately before them restored Elizabeth to the enjoyment of all her former dislike.

Their brother, indeed, was the only one of the party whom she could regard with any complacency. His anxiety for Jane was evident, and his attentions to herself were most pleasing, and they prevented her feeling herself so much an intruder as she believed she was considered by the others. She had very little notice from any but him. Miss Bingley was engrossed by Mr. Darcy, her sister scarcely less so; and as for Mr. Hurst, by whom Elizabeth sat, he was an indolent man, who lived only to eat, drink, and play at cards; who, when he found her to prefer a plain dish to a ragout, had nothing to say to her.

# Chapter 9

Elizabeth passed the chief of the night in her sister's room, and in the morning had the satisfaction of being able to send a tolerably comfortable account to Longbourn, and of seeing her friend materially amended. Mr. Bingley's chaise was immediately ordered, and the two sisters set off together.

# Chapter 10

The day passed much as the day before had done. Mrs. Hurst and Miss Bingley had spent some hours of the morning with the invalid, who continued, though slowly, to mend; and in the evening Elizabeth joined their party in the drawing-room. The loo-table, however, did not appear. Mr. Darcy was writing, and Miss Bingley, seated near him, was watching the progress of his letter and repeatedly calling off his attention by messages to his sister. Mr. Hurst and Mr. Bingley were at piquet, and Mrs. Hurst was observing their game.

Elizabeth took up some needlework, and was sufficiently amused in attending to what passed between Darcy and his companion. The perpetual commendations of the lady, either on his handwriting, or on the evenness of his lines, or on the length of his letter, with the perfect unconcern with which her praises were received, formed a curious dialogue, and was exactly in union with her opinion of each.
            `
            },


        ];
    },

    getNotifications: async (): Promise<any[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: "notif-1",
                        type: "achievement",
                        title: "Achievement Unlocked: Bookworm!",
                        message: "You've read 10 books. Keep it up!",
                        timestamp: "2 jam lalu",
                        isRead: false,
                        icon: "Star",
                    },
                    {
                        id: "notif-2",
                        type: "book",
                        title: "New book from your favorite author",
                        message: "J.K. Rowling has published a new book: 'The Magical Quill'.",
                        timestamp: "5 jam lalu",
                        isRead: false,
                        icon: "BookOpen",
                    },
                    {
                        id: "notif-3",
                        type: "social",
                        title: "Budi S. commented on your review",
                        message: "'Great insights on Clean Code!'",
                        timestamp: "1 hari lalu",
                        isRead: true,
                        icon: "Users",
                    },
                    {
                        id: "notif-4",
                        type: "premium",
                        title: "Your premium subscription expires soon!",
                        message: "Renew now to continue enjoying exclusive features.",
                        timestamp: "3 hari lalu",
                        isRead: false,
                        icon: "Crown",
                    },
                    {
                        id: "notif-5",
                        type: "system",
                        title: "App Update Available",
                        message: "Version 2.1 is now available with new features and bug fixes.",
                        timestamp: "1 minggu lalu",
                        isRead: true,
                        icon: "TrendingUp",
                    },
                ]);
            }, 1000);
        });
    }
};
