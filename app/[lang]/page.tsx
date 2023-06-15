import Image from "next/image";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { Separator } from "@/components/ui/separator";
import prismaClient from "@/prisma/prisma";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);

  async function getProjects() {
    "use server";

    const projects = await prismaClient.project.findMany({
      select: {
        id: true,
        name: true,
        image: true,
      },
      where: {
        locale: params.lang,
      },
    });

    return projects;
  }

  async function getMembers() {
    "use server";

    const members = await prismaClient.member.findMany({
      where: {
        locale: params.lang,
      },
    });

    return members;
  }

  const members = await getMembers();
  const projects = await getProjects();

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
            {projects.map((project) => (
              <div
                key={project.id}
                className="w-full h-60 flex-1 max-sm:flex-none basis-5/12 flex flex-col"
              >
                <div className="relative flex-1">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover -z-10"
                  />
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
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col items-start text-sm max-sm:w-72 w-7/12"
              >
                <div className="relative w-32 h-32">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-full"
                  />
                </div>
                <h4 className="font-bold mt-2">{member.name}</h4>
                <p className="text-center">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-8" />
      </main>
    </>
  );
}
