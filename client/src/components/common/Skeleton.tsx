import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-[#e9e0d0]/80", className)} />;
}

export function LedgerSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[#eee6d8]" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <div className="flex-1 grid gap-1.5">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-2.5 w-1/5" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
