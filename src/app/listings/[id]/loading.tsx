import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-8 w-2/3 mb-4" />
                <Skeleton className="h-4 w-1/3 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[480px] rounded-2xl overflow-hidden mb-12">
                    <Skeleton className="md:col-span-2 md:row-span-2 h-full w-full" />
                    <Skeleton className="hidden md:block h-full w-full" />
                    <Skeleton className="hidden md:block h-full w-full" />
                    <Skeleton className="hidden md:block h-full w-full" />
                    <Skeleton className="hidden md:block h-full w-full" />
                </div>
            </div>
        </div>
    );
}
