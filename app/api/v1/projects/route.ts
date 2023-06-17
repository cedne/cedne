import prismaClient from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    await prismaClient.project.findMany({
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
