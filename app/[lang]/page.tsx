import Image from "next/image";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { Separator } from "@/components/ui/separator";
import ProjectsSkeleton from "./projects.skeleton";
import MembersSkeleton from "./members.skeleton";
import type { Member, Project } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 600;

export default async function Home({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);

  const projects: Project[] = await fetch(
    "http://localhost:3000/api/v1/projects"
  )
    .then((res) => res.json())
    .then((res) =>
      Promise.all(
        res.map((project: Partial<Project>) =>
          fetch(`http://localhost:3000/api/v1/projects?id=${project.id}`)
        )
      )
    )
    .then((res) => Promise.all(res.map((project) => project.json())))
    .catch(() => []);
  const members: Member[] = await fetch("http://localhost:3000/api/v1/members")
    .then((res) => res.json())
    .then((res) =>
      Promise.all(
        res.map((member: Partial<Member>) =>
          fetch(`http://localhost:3000/api/v1/members?id=${member.id}`)
        )
      )
    )
    .then((res) => Promise.all(res.map((member) => member.json())))
    .catch(() => []);

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
          <h1 className="font-bold text-3xl mb-4">{dict.home.title}</h1>
          {dict.home.description.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="font-bold text-2xl mb-4">{dict.home.projectsTitle}</h2>
          <div
            className="flex flex-wrap gap-10 justify-items-center
          "
          >
            {projects.length === 0 && <ProjectsSkeleton />}
            {projects.length !== 0 &&
              projects.map((project) => (
                <div
                  key={project.id}
                  className="w-full h-60 flex-1 max-sm:flex-none basis-5/12 flex flex-col"
                >
                  <div className="relative flex-1">
                    {(() => {
                      if (!project.image)
                        return (
                          <Skeleton className="w-full h-60 flex-1 max-sm:flex-none basis-5/12" />
                        );

                      return (
                        <Image
                          src={project.image}
                          alt={project.name}
                          fill
                          className="object-cover -z-10"
                        />
                      );
                    })()}
                  </div>
                  <h4
                    className="font-bold text-start bg-neutral-700 text-white p-2
                  "
                  >
                    {project.name}
                  </h4>
                </div>
              ))}
          </div>
        </section>

        <Separator className="my-8" />

        <section>
          <h2 className="font-bold text-2xl mb-4">{dict.home.teamTitle}</h2>
          <div className="grid max-sm:grid-cols-1 max-md:grid-cols-2 grid-cols-3 gap-x-4 gap-y-10 justify-items-center">
            {members.length === 0 && <MembersSkeleton />}
            {members.length !== 0 &&
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col items-start text-sm max-sm:w-72 w-7/12"
                >
                  <div className="relative w-32 h-32">
                    {(() => {
                      if (!member.image)
                        return <Skeleton className="w-32 h-32 rounded-full" />;

                      return (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="rounded-full"
                        />
                      );
                    })()}
                  </div>
                  <h4 className="font-bold mt-2">{member.name}</h4>
                  <p>{member.description}</p>
                </div>
              ))}
          </div>
        </section>

        <Separator className="my-8" />
      </main>
    </>
  );
}
