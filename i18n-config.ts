export const i18n = {
  defaultLocale: "ru",
  locales: ["us", "ru"],
} as const;

export type Locale = (typeof i18n)["locales"][number];
