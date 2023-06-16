import { Skeleton } from "@/components/ui/skeleton";

export default function MembersSkeleton({ size }: { size?: number }) {
  return (
    <>
      {Array.from({ length: size || 4 }).map((_, index) => (
        <Skeleton
          key={index}
          className="w-full h-60 flex-1 max-sm:flex-none basis-5/12
              "
        />
      ))}
    </>
  );
}
