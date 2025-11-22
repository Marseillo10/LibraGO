import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";

export function CollectionSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="aspect-[3/4] w-full">
                        <Skeleton className="h-full w-full rounded-none" />
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex items-center justify-between pt-1">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
