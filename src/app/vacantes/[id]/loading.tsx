import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm shadow-navy-900/[0.04]">
          <div className="flex items-start gap-3.5">
            <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
            <div className="flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-3/4 rounded-full" />
              <Skeleton className="mt-2 h-3.5 w-1/2 rounded-full" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
