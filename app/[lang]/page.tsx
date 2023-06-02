import Image from "next/image";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { Separator } from "@/components/ui/separator";

export default async function Home({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);

  return (
    <>
      <header className="relative h-48 mb-14">
        <Image
          src="/header.png"
          alt="CEdNe header image"
          fill
          className="object-cover"
        />
      </header>
      <main className="lg:w-1/2 max-lg:p-8 mx-auto">
        <h1 className="font-bold text-3xl mb-4">{dict.home.title}</h1>
        {dict.home.description.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <Separator className="my-8" />
      </main>
      <Separator className="lg:w-1/2 lg:mx-auto max-lg:mx-8 my-16" />
    </>
  );
}
