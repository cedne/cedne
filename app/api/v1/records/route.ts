import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@/prisma/prisma";

export const dynamic = "force-dynamic";

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
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });

  if (!data.type)
    return NextResponse.json({ message: "No type" }, { status: 400 });

  if (data.type === "language") {
    if (!data.locale)
      return NextResponse.json({ message: "No locale" }, { status: 400 });

    await prismaClient.locale.upsert({
      where: { language: data.locale },
      update: { language: data.locale },
      create: { language: data.locale },
    });
    return NextResponse.json({ message: `Locale ${data.locale} created` });
  }

  if (!data.id) {
    if (!data.name)
      return NextResponse.json(
        { message: "Invalid body. Missing name" },
        { status: 400 }
      );
    if (!data.description)
      return NextResponse.json(
        { message: "Invalid body. Missing description" },
        { status: 400 }
      );
    if (!data.locale)
      return NextResponse.json(
        { message: "Invalid body. Missing locale" },
        { status: 400 }
      );
    if (!data.image)
      return NextResponse.json(
        { message: "Invalid body. Missing image" },
        { status: 400 }
      );
  }
  if (data.image === "") data.image = undefined;

  let newRecord: Omit<Record, "token" | "type"> | null = null;

  try {
    if (data.type === "member") {
      if (!data.id)
        newRecord = await prismaClient.member.create({
          data: {
            name: data.name,
            description: data.description,
            locale: data.locale,
            image: data.image || "",
          },
        });
      else
        newRecord = await prismaClient.member.update({
          where: { id: data.id },
          data: {
            name: data.name,
            description: data.description,
            locale: data.locale,
            image: data.image,
          },
        });
    }
    if (data.type === "project") {
      if (!data.id)
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
      else
        newRecord = await prismaClient.project.update({
          where: { id: data.id },
          data: {
            name: data.name,
            description: data.description,
            locale: data.locale,
            image: data.image,
          },
        });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Record created", record: newRecord });
}

export async function DELETE(request: NextRequest) {
  const id = request.headers.get("id");
  const type = request.headers.get("type");

  if (!id || !type) return NextResponse.json({ message: "Invalid body" });

  try {
    if (type === "member") await prismaClient.member.delete({ where: { id } });
    if (type === "project")
      await prismaClient.project.delete({ where: { id } });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Record deleted" });
}
