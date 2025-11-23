import { X } from "lucide-react";
import { Button } from "../ui/button";

interface OpenLibraryReaderProps {
    bookId: string; // Internet Archive ID (e.g., "prideandprejudic00aust")
    onClose: () => void;
}

export function OpenLibraryReader({ bookId, onClose }: OpenLibraryReaderProps) {
    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white">
                <span className="font-medium">Open Library Reader</span>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-800">
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 w-full bg-black">
                <iframe
                    src={`//archive.org/stream/${bookId}?ui=embed`}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title="Open Library Book Reader"
                />
            </div>
        </div>
    );
}
