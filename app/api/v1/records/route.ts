import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/prisma/prisma";

interface Record {
  id: string;
  token: string;
  locale: string;
  name: string;
  description: string;
  type: "member" | "project" | "language";
  image?: string;
}

export async function POST(request: NextRequest) {
  const data: Record = await request.json();

  if (data.token !== process.env.API_TOKEN)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  if (data.type === "language") {
    if (!data.locale)
      return NextResponse.json({ error: "No locale" }, { status: 400 });

    await prismaClient.locale.upsert({
      where: { language: data.locale },
      update: { language: data.locale },
      create: { language: data.locale },
    });
    return NextResponse.json({ message: "Locale created" });
  }

  if (!data.id) {
    if (!data.name || !data.description || !data.locale || !data.image)
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  console.log(data);
  if (data.image === "") data.image = undefined;

  let newRecord: Omit<Record, "token" | "type"> | null = null;

  try {
    if (data.type === "member")
      newRecord = await prismaClient.member.upsert({
        where: { id: data.id || undefined },
        update: {
          name: data.name,
          description: data.description,
          locale: data.locale,
          image: data.image,
        },
        create: {
          name: data.name,
          description: data.description,
          locale: data.locale,
          image: data.image || "",
        },
      });
    if (data.type === "project")
      newRecord = await prismaClient.project.upsert({
        where: { id: data.id || "" },
        update: {
          name: data.name,
          description: data.description,
          locale: data.locale,
          image: data.image,
        },
        create: {
          name: data.name,
          description: data.description,
          locale: data.locale,
          image: data.image || "",
        },
      });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Record created", record: newRecord });
}
