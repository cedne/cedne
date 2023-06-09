"use server";

import { Locale } from "@/i18n-config";
import prismaClient from "@/prisma/prisma";

export async function getProjects(locale: Locale) {
  return prismaClient.project.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      localeLanguage: locale,
    },
  });
}

export async function getProject(id: string) {
  return prismaClient.project.findUnique({
    where: {
      id,
    },
  });
}

export async function getTeam(locale: Locale) {
  return prismaClient.member.findMany({
    where: {
      localeLanguage: locale,
    },
  });
}

export async function getLocales() {
  return prismaClient.locale.findMany();
}
