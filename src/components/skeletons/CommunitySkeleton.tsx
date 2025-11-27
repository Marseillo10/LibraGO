import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";

export function CommunitySkeleton({ darkMode = false }: { darkMode?: boolean }) {
    const FeedItemSkeleton = () => (
        <Card className="p-6">
            <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex gap-4">
                            <Skeleton className="h-8 w-20 rounded-md" />
                            <Skeleton className="h-8 w-20 rounded-md" />
                            <Skeleton className="h-8 w-20 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );

    const SidebarWidgetSkeleton = ({ lines = 3 }: { lines?: number }) => (
        <Card className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-4">
                {[...Array(lines)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );

    return (
        <div className={`min-h-screen p-4 md:p-8 ${darkMode ? "bg-transparent" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-16 w-16 rounded-xl" />
                        <div>
                            <Skeleton className="h-7 w-40 mb-2" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-32 rounded-md" />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs Skeleton */}
                        <div className="flex gap-4 border-b">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                        <div className="space-y-4">
                            <FeedItemSkeleton />
                            <FeedItemSkeleton />
                            <FeedItemSkeleton />
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-6">
                        <SidebarWidgetSkeleton lines={5} />
                        <SidebarWidgetSkeleton lines={3} />
                    </div>
                </div>
            </div>
        </div>
    );
}
