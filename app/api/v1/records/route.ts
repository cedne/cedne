import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import prismaClient from "@/prisma/prisma";
import Sharp from "sharp";

interface Record {
  id?: string;
  token: string;
  locale: string;
  name: string;
  description: string;
  type: "member" | "project" | "language";
  image: string;
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
      update: {},
      create: {
        language: data.locale,
      },
    });
    return NextResponse.json({ message: "Locale created" });
  }

  if (!data.name || !data.description || !data.locale || !data.image)
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const assetDir = `${
    process.env.NODE_ENV === "development" ? "./public/assets" : "./assets"
  }`;

  let newRecord: {
    id: string;
    name: string;
    description: string | null;
    localeLanguage: string;
  } | null = null;

  if (data.type === "member")
    newRecord = await prismaClient.member.create({
      data: {
        name: data.name,
        description: data.description,
        localeLanguage: data.locale,
      },
    });
  if (data.type === "project")
    newRecord = await prismaClient.project.upsert({
      where: { id: data.id },
      update: {
        description: data.description,
        localeLanguage: data.locale,
      },
      create: {
        name: data.name,
        description: data.description,
        localeLanguage: data.locale,
      },
    });

  if (!newRecord || !newRecord.id)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );

  await cleanupUnusedImages();

  const extension = data.image.split(";")[0].split("/")[1];
  if (extension === "webp") {
    await fs.writeFile(`${assetDir}/${newRecord?.id}.webp`, data.image);
    return NextResponse.json({ message: "Hello, world!" });
  }

  const base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const filename = `${newRecord?.id}.webp`;

  const sharp = Sharp(buffer, { animated: extension === "gif" });
  await sharp.webp().toFile(`${assetDir}/${filename}`);

  return NextResponse.json({ message: "Hello, world!" });
}

async function cleanupUnusedImages() {
  const assetDir = `${
    process.env.NODE_ENV === "development" ? "./public/assets" : "./app/assets"
  }`;

  const files = await fs.readdir(assetDir);
  const projectIds = await prismaClient.project.findMany({
    select: { id: true },
  });
  const memberIds = await prismaClient.member.findMany({
    select: { id: true },
  });

  const projectImageIds = projectIds.map((project) => project.id);
  const memberImageIds = memberIds.map((member) => member.id);

  const imageIds = [...projectImageIds, ...memberImageIds];

  const unusedImages = files.filter((file) => {
    const id = file.split(".")[0];
    return !imageIds.includes(id);
  });

  await Promise.all(unusedImages.map((image) => fs.rm(`${assetDir}/${image}`)));
}
