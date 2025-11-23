import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { useZxing } from "react-zxing";
import { Button } from "./button";
import { CameraOff, Lock, Info, SlidersHorizontal, ToggleRight } from "lucide-react";

interface BarcodeScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (result: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
    const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const videoRef = React.useRef<HTMLVideoElement | null>(null);

    const { ref } = useZxing({
        onDecodeResult(result) {
            onScan(result.getText());
        },
        onError(err) {
            if ((err as Error).name !== 'NotFoundException') {
                console.error("Barcode scan error:", err);
                if (!error) setError((err as Error).message || "Failed to access camera");
            }
        },
        constraints: {
            audio: false,
            video: true
        }
    });

    // Merge refs to allow manual control
    const setRefs = React.useCallback(
        (node: HTMLVideoElement) => {
            // @ts-ignore - react-zxing ref type compatibility
            ref.current = node;
            videoRef.current = node;
        },
        [ref]
    );

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!isVideoPlaying && !error && isOpen) {
                setError("Camera is taking too long to load.");
            }
        }, 8000);
        return () => clearTimeout(timer);
    }, [isVideoPlaying, error, isOpen]);

    const handleManualStart = React.useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsVideoPlaying(true);
            }
        } catch (err) {
            console.error("Manual start failed:", err);
            const errorName = (err as Error).name;
            if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
                setError("PERMISSION_DENIED");
            } else {
                setError(`Failed to start camera: ${(err as Error).message}`);
            }
        }
    }, []);

    // Force start immediately on open
    React.useEffect(() => {
        if (isOpen) {
            handleManualStart();
        }
    }, [isOpen, handleManualStart]);

    const handleRetry = () => {
        setError(null);
        window.location.reload();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
                <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                    <DialogDescription className="sr-only">
                        Scan a book's ISBN barcode to search for it.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center px-0 pb-0 pt-2 space-y-4">
                    <div className={`relative w-full max-w-sm rounded-lg bg-gray-100 dark:bg-black ${error === "PERMISSION_DENIED" ? 'h-auto' : 'aspect-video overflow-hidden'}`}>
                        {error === "PERMISSION_DENIED" ? (
                            <div className="relative flex flex-col items-center justify-center text-gray-900 dark:text-white p-5 text-center bg-white dark:bg-gray-900 rounded-lg z-20">
                                <div className="bg-red-500/10 p-3 rounded-full mb-3 animate-pulse">
                                    <CameraOff className="w-6 h-6 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Camera Access Blocked</h3>
                                <div className="text-left text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-3 max-w-[280px]">
                                    <p className="text-left mb-2 text-gray-500 dark:text-gray-300 text-xs uppercase tracking-wider font-semibold">To enable the camera:</p>
                                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="bg-blue-500/20 p-1.5 rounded-md flex gap-1 shrink-0">
                                            <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                            <Info className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                            <CameraOff className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                            <SlidersHorizontal className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="leading-tight text-xs text-gray-700 dark:text-white">Click <strong>Lock</strong>, <strong>Info</strong>, <strong>Camera</strong>, or <strong>Settings</strong> icon in URL bar</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="bg-purple-500/20 p-1.5 rounded-md shrink-0">
                                            <CameraOff className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="text-xs text-gray-700 dark:text-white">Find <strong>Camera</strong> setting</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="bg-green-500/20 p-1.5 rounded-md shrink-0">
                                            <ToggleRight className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                                        </div>
                                        <span className="text-xs text-gray-700 dark:text-white">Toggle switch to <strong>ON</strong></span>
                                    </div>
                                </div>
                                <Button variant="secondary" size="sm" onClick={handleRetry} className="font-medium w-full max-w-[200px]">
                                    I've Enabled It, Try Again
                                </Button>
                            </div>
                        ) : error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 dark:text-red-400 p-4 text-center bg-gray-100/90 dark:bg-black/90 z-10">
                                <p className="text-sm font-medium mb-2">Camera Error</p>
                                <p className="text-xs opacity-80 mb-4">{error}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleManualStart} className="text-xs">
                                        Force Start
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleRetry} className="text-xs">
                                        Reload
                                    </Button>
                                </div>
                            </div>
                        ) : !isVideoPlaying && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-white/70 text-sm z-10 pointer-events-none">
                                <p className="mb-2">Requesting camera access...</p>
                            </div>
                        )}

                        {/* Video is always visible now to debug, except when permission is explicitly denied to save space */}
                        <video
                            ref={setRefs}
                            className={`w-full h-full object-cover ${error === "PERMISSION_DENIED" ? 'hidden' : ''}`}
                            autoPlay
                            playsInline
                            muted
                            onPlaying={() => setIsVideoPlaying(true)}
                        />

                        {!error && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
                                <div className="w-64 h-32 border-2 border-white/50 rounded-lg relative">
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/80" />
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                        Point your camera at a book's ISBN barcode
                    </p>
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
