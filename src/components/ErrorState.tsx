import React from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface ErrorStateProps {
    title?: string;
    description?: string;
    retryLabel?: string;
    onRetry?: () => void;
    homeLabel?: string;
    onHome?: () => void;
    errorDetails?: string;
}

export function ErrorState({
    title = "Something went wrong",
    description = "We encountered an unexpected error. Please try again.",
    retryLabel = "Try Again",
    onRetry,
    homeLabel = "Go to Home",
    onHome,
    errorDetails,
}: ErrorStateProps) {
    const [showDetails, setShowDetails] = React.useState(false);

    return (
        <Card className="p-8 md:p-12 text-center max-w-lg mx-auto border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
                {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {onRetry && (
                    <Button onClick={onRetry} className="bg-red-600 hover:bg-red-700 text-white">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        {retryLabel}
                    </Button>
                )}

                {onHome && (
                    <Button onClick={onHome} variant="outline" className="border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
                        <Home className="w-4 h-4 mr-2" />
                        {homeLabel}
                    </Button>
                )}
            </div>

            {errorDetails && (
                <div className="mt-8 pt-6 border-t border-red-100 dark:border-red-800/50">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
                    >
                        {showDetails ? "Hide Error Details" : "Show Error Details"}
                    </button>

                    {showDetails && (
                        <pre className="mt-4 p-4 bg-white dark:bg-black/20 rounded-lg text-left text-xs font-mono text-red-700 dark:text-red-300 overflow-auto max-h-40 border border-red-100 dark:border-red-800/30">
                            {errorDetails}
                        </pre>
                    )}
                </div>
            )}
        </Card>
    );
}
