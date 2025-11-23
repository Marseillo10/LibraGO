import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";

interface BookCardSkeletonProps {
    viewMode?: "grid" | "list";
}

export function BookCardSkeleton({ viewMode = "grid" }: BookCardSkeletonProps) {
    if (viewMode === "list") {
        return (
            <Card className="overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex-row gap-4">
                <div className="relative w-20 h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col py-0.5 gap-2">
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-6 w-12 rounded-lg" />
                        </div>
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </div>
                    <div className="space-y-2 mt-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                    </div>
                    <div className="flex gap-2 mt-1">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="aspect-[3/4] w-full">
                <Skeleton className="h-full w-full rounded-none" />
            </div>
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-2 pt-1">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-8" />
                </div>
            </div>
        </Card>
    );
}
