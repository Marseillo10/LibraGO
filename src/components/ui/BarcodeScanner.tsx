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

const ScannerInternal: React.FC<{ onScan: (result: string) => void; onClose: () => void; onRetry: () => void }> = ({ onScan, onClose, onRetry }) => {
    const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [trackingBox, setTrackingBox] = React.useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const scanTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const { ref } = useZxing({
        onDecodeResult(result) {
            const points = result.getResultPoints();

            if (points && points.length > 0 && videoRef.current && containerRef.current) {
                const video = videoRef.current;
                const container = containerRef.current;

                const videoWidth = video.videoWidth;
                const videoHeight = video.videoHeight;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;

                const videoRatio = videoWidth / videoHeight;
                const containerRatio = containerWidth / containerHeight;

                let scale, offsetX, offsetY;

                if (containerRatio > videoRatio) {
                    scale = containerWidth / videoWidth;
                    offsetX = 0;
                    offsetY = (containerHeight - (videoHeight * scale)) / 2;
                } else {
                    scale = containerHeight / videoHeight;
                    offsetX = (containerWidth - (videoWidth * scale)) / 2;
                    offsetY = 0;
                }

                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

                points.forEach((p: any) => {
                    const x = typeof p.x === 'number' ? p.x : (p.getX ? p.getX() : 0);
                    const y = typeof p.y === 'number' ? p.y : (p.getY ? p.getY() : 0);

                    const screenX = (x * scale) + offsetX;
                    const screenY = (y * scale) + offsetY;

                    minX = Math.min(minX, screenX);
                    minY = Math.min(minY, screenY);
                    maxX = Math.max(maxX, screenX);
                    maxY = Math.max(maxY, screenY);
                });

                const rawBoxWidth = maxX - minX;
                const rawBoxHeight = maxY - minY;

                const centerX = minX + (rawBoxWidth / 2);
                const centerY = minY + (rawBoxHeight / 2);

                const minWidth = 250;
                const minHeight = 150;

                const finalWidth = Math.max(rawBoxWidth + 40, minWidth);
                const finalHeight = Math.max(rawBoxHeight + 40, minHeight);

                const finalX = centerX - (finalWidth / 2);
                const finalY = centerY - (finalHeight / 2);

                setTrackingBox({
                    x: finalX,
                    y: finalY,
                    width: finalWidth,
                    height: finalHeight
                });

                if (!scanTimerRef.current) {
                    scanTimerRef.current = setTimeout(() => {
                        onScan(result.getText());
                        scanTimerRef.current = null;
                    }, 500);
                }
            } else {
                if (!scanTimerRef.current) {
                    onScan(result.getText());
                }
            }
        },
        onError(err) {
            console.error("Barcode scan error:", err);
            const errorName = (err as Error).name;
            if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorName === 'NotFoundException') {
                // NotFoundException is common when no code is found, ignore it.
                // But NotAllowedError is permission.
                if (errorName !== 'NotFoundException') {
                    setError("PERMISSION_DENIED");
                }
            } else {
                if ((err as Error).message.includes("Permission")) {
                    setError("PERMISSION_DENIED");
                } else if (errorName !== 'NotFoundException') {
                    setError((err as Error).message || "Failed to access camera");
                }
            }
        },
        constraints: {
            audio: false,
            video: true
        }
    });

    // Merge refs
    const setRefs = React.useCallback(
        (node: HTMLVideoElement) => {
            // @ts-ignore
            ref.current = node;
            videoRef.current = node;
        },
        [ref]
    );

    // Timeout for camera loading
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!isVideoPlaying && !error) {
                setError("Camera is taking too long to load.");
            }
        }, 8000);
        return () => clearTimeout(timer);
    }, [isVideoPlaying, error]);

    // Cleanup timer
    React.useEffect(() => {
        return () => {
            if (scanTimerRef.current) {
                clearTimeout(scanTimerRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center px-0 pb-0 pt-2 space-y-4">
            <div
                ref={containerRef}
                className={`relative w-full max-w-sm rounded-lg bg-gray-100 dark:bg-black ${error === "PERMISSION_DENIED" ? 'h-auto' : 'aspect-video overflow-hidden'}`}
            >
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
                        <Button variant="secondary" size="sm" onClick={onRetry} className="font-medium w-full max-w-[200px]">
                            I've Enabled It, Try Again
                        </Button>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 dark:text-red-400 p-4 text-center bg-gray-100/90 dark:bg-black/90 z-10">
                        <p className="text-sm font-medium mb-2">Camera Error</p>
                        <p className="text-xs opacity-80 mb-4">{error}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={onRetry} className="text-xs">
                                Try Again
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
                    <>
                        {/* Overlay Container */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ zIndex: 100 }}
                        >
                            {/* Scanning Box - Dynamic Positioning */}
                            <div
                                className="absolute rounded-lg overflow-hidden transition-all duration-200 ease-out"
                                style={{
                                    left: trackingBox ? trackingBox.x : '50%',
                                    top: trackingBox ? trackingBox.y : '50%',
                                    width: trackingBox ? trackingBox.width : '280px',
                                    height: trackingBox ? trackingBox.height : '180px',
                                    transform: trackingBox ? 'none' : 'translate(-50%, -50%)',
                                    border: '4px solid #3b82f6', // blue-500
                                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                                }}
                            >
                                {/* Laser Scanning Animation - Thick Red Line */}
                                <div
                                    className="absolute left-0 right-0 animate-scan"
                                    style={{
                                        height: '4px',
                                        backgroundColor: '#ef4444', // red-500
                                        boxShadow: '0 0 10px rgba(239,68,68,0.8)'
                                    }}
                                />
                            </div>
                        </div>
                        {/* CSS for Animation - Injected directly to ensure it works */}
                        <style>{`
                            @keyframes scan {
                                0% { top: 0%; opacity: 0; }
                                10% { opacity: 1; }
                                90% { opacity: 1; }
                                100% { top: 100%; opacity: 0; }
                            }
                            .animate-scan {
                                animation: scan 2s linear infinite;
                            }
                        `}</style>
                    </>
                )}
            </div>
            <p className="text-sm text-gray-500 text-center">
                Point your camera at a book's ISBN barcode
            </p>
            <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
            </Button>
        </div>
    );
};

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
    const [scannerKey, setScannerKey] = React.useState(0);

    const handleRetry = () => {
        setScannerKey(prev => prev + 1);
    };

    // Reset key when dialog opens/closes to ensure fresh state
    React.useEffect(() => {
        if (isOpen) {
            setScannerKey(0);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
                <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                    <DialogDescription className="sr-only">
                        Scan a book's ISBN barcode to search for it.
                    </DialogDescription>
                </DialogHeader>
                {isOpen && <ScannerInternal key={scannerKey} onScan={onScan} onClose={onClose} onRetry={handleRetry} />}
            </DialogContent>
        </Dialog>
    );
};
