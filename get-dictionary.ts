import "server-only";
import type { Locale } from "./i18n-config";

const dictionaries = {
  us: () => import("./dictionaries/us.json").then((module) => module.default),
  ru: () => import("./dictionaries/ru.json").then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<typeof dictionaries.us>>;

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
