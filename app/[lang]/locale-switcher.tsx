"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Locale, i18n } from "@/i18n-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuRadioItem } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LocaleSwitcher({
  locale,
  ...props
}: { locale: Locale } & React.ComponentPropsWithoutRef<"div">) {
  const pathName = usePathname();
  const redirectedPathName = (locale: string) => {
    if (!pathName) return "/";
    const segments = pathName.split("/");
    segments[1] = locale;
    return segments.join("/");
  };
  const locales = () => {
    return i18n.locales.map((locale) => {
      return {
        locale,
        flag: import(
          `../../node_modules/country-flag-icons/3x2/${locale.toUpperCase()}.svg`
        ).then((module) => module.default) as Promise<{ src: string }>,
      };
    });
  };
  const [localeFlags, setLocaleFlags] = useState<
    {
      locale: Locale;
      flag: Awaited<ReturnType<typeof locales>[number]["flag"]>;
    }[]
  >([]);

  useEffect(() => {
    locales().map((loc) => {
      loc.flag.then((img) => {
        setLocaleFlags((localeFlags) => {
          if (
            localeFlags?.find((localeFlag) => localeFlag.locale === loc.locale)
          )
            return localeFlags;
          return [...localeFlags, { locale: loc.locale, flag: img }];
        });
      });
    });
  }, []);

  if (localeFlags.length === 0)
    return (
      <div {...props}>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    );

  return (
    <div {...props}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarFallback>{locale}</AvatarFallback>
            <AvatarImage
              src={
                localeFlags.find((localeFlag) => localeFlag.locale === locale)
                  ?.flag.src ?? ""
              }
              alt={locale}
            />
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[3rem] text-center">
          <DropdownMenuRadioGroup>
            {i18n.locales.map((locale, index) => {
              return (
                <DropdownMenuRadioItem
                  key={locale}
                  value={locale}
                  className="min-w-min"
                >
                  <Link
                    href={redirectedPathName(locale)}
                    className="block hover:bg-gray-700 transition-colors duration-200
                  "
                  >
                    {locale}
                  </Link>
                  {index < i18n.locales.length - 1 && <DropdownMenuSeparator />}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
