import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";

export function BookCardSkeleton() {
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
