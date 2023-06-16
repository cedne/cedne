import prismaClient from "@/prisma/prisma";
import CreateRecordClient from "./page.client";

export default async function CreateRecord() {
  async function getLocales() {
    "use server";

    const locales = await prismaClient.locale.findMany();

    return locales.map((locale) => locale.language);
  }

  async function getProjects() {
    "use server";

    const projects = await prismaClient.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        locale: true,
      },
    });

    return projects;
  }

  async function getMembers() {
    "use server";

    const members = await prismaClient.member.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        locale: true,
      },
    });

    return members;
  }

  async function getData(): Promise<{
    locales: Awaited<ReturnType<typeof getLocales>>;
    members: Awaited<ReturnType<typeof getMembers>>;
    projects: Awaited<ReturnType<typeof getProjects>>;
  }> {
    try {
      const locales = await getLocales();
      const members = await getMembers();
      const projects = await getProjects();

      return { locales, members, projects };
    } catch {
      return { locales: [], members: [], projects: [] };
    }
  }

  const data = await getData();

  return (
    <CreateRecordClient
      locales={data.locales}
      members={data.members}
      projects={data.projects}
    />
  );
}
