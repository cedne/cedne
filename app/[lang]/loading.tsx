import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <header className="relative mb-14 max-sm:h-72 max-md:h-128 max-lg:h-144 max-xl:h-160 h-64 w-full">
        <Image
          src="/header.png"
          alt="CEdNe header image"
          fill
          className="object-cover"
        />
      </header>

      <main className="lg:w-1/2 max-lg:p-8 mx-auto">
        <section>
          <Skeleton className="w-1/2 h-4 mb-4" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/2 h-4" />
        </section>

        <Separator className="my-8" />

        <section>
          <Skeleton className="w-1/2 h-4 mb-4" />
          <div
            className="flex flex-wrap gap-10 justify-items-center
          "
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="w-full h-60 flex-1 max-sm:flex-none basis-5/12
              "
              />
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        <section>
          <Skeleton className="w-1/2 h-4 mb-4" />
          <div className="grid max-sm:grid-cols-1 max-md:grid-cols-2 grid-cols-3 gap-x-4 gap-y-10 justify-items-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="w-32 h-32 rounded-full" />
                <Skeleton className="w-3/4 h-4 mt-2" />
                <Skeleton className="w-1/2 h-4 mt-2" />
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-8" />
      </main>
    </>
  );
}
