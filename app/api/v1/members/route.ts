import prismaClient from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    await prismaClient.member.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        locale: true,
        image: true,
      },
    })
  );
}
