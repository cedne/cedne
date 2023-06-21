import prismaClient from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = new URL(request.nextUrl).searchParams;

  if (params.size === 0)
    return NextResponse.json(
      await prismaClient.member.findMany({
        select: {
          id: true,
        },
      })
    );

  const id = params.get("id");
  if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

  const image = params.get("image");

  return NextResponse.json(
    await prismaClient.member.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        locale: true,
        image: image === "false" ? false : true,
      },
    })
  );
}
