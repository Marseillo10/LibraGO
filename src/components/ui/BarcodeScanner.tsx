import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { useZxing } from "react-zxing";
import { Button } from "./button";

interface BarcodeScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (result: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
    const { ref } = useZxing({
        onDecodeResult(result) {
            onScan(result.getText());
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4 space-y-4">
                    <div className="relative w-full aspect-video max-w-sm overflow-hidden rounded-lg bg-black">
                        <video ref={ref} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-32 border-2 border-white/50 rounded-lg relative">
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/80" />
                            </div>
                        </div>
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
