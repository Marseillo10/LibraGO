import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";

export function NotificationSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <Card key={i} className="p-4 bg-white dark:bg-gray-800/50">
                    <div className="flex gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-2 w-2 rounded-full lg:hidden" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex flex-col gap-2 flex-shrink-0">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
