import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Skeleton, CardSkeletonList } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
        </div>
        <div className="mt-6">
          <CardSkeletonList />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
