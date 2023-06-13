import prismaClient from "@/prisma/prisma";
import CreateRecordClient from "./page.client";

export default async function CreateRecord() {
  async function getLocales() {
    "use server";

    const locales = await prismaClient.locale.findMany();

    return locales.map((locale) => locale.language);
  }

  return <CreateRecordClient locales={await getLocales()} />;
}
