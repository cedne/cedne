import { Skeleton } from "@/components/ui/skeleton";

export default function MembersSkeleton({ size }: { size?: number }) {
  return (
    <>
      {Array.from({ length: size || 6 }).map((_, index) => (
        <div key={index}>
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="w-3/4 h-4 mt-2" />
          <Skeleton className="w-1/2 h-4 mt-2" />
        </div>
      ))}
    </>
  );
}
