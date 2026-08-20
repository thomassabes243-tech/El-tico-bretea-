import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Skeleton, CardSkeletonList } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="mt-2 h-3.5 w-60 rounded-full" />
        <div className="mt-6">
          <CardSkeletonList />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
