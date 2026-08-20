import { TopBar } from "@/components/nav/TopBar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar />
      <div className="h-24 shrink-0 border-b border-sand-200 bg-sand-100" />
      <div className="flex-1 overflow-hidden px-4 py-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-2/3 self-start rounded-2xl" />
          <Skeleton className="h-10 w-1/2 self-end rounded-2xl" />
          <Skeleton className="h-16 w-3/4 self-start rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
