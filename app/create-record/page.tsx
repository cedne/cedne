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

  return (
    <CreateRecordClient
      locales={await getLocales()}
      members={await getMembers()}
      projects={await getProjects()}
    />
  );
}
