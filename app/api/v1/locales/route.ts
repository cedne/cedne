import prismaClient from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json(await prismaClient.locale.findMany());
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const exists = await prismaClient.aPIToken.findUnique({
    where: { token: token },
  });
  if (!exists)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  let body: { language: string };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  return NextResponse.json(
    await prismaClient.locale.update({
      where: { language: body.language },
      data: { language: body.language },
    })
  );
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get("authorization");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const exists = await prismaClient.aPIToken.findUnique({
    where: { token: token },
  });
  if (!exists)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  let body: { language: string };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  return NextResponse.json(
    await prismaClient.locale.create({
      data: { language: body.language },
    })
  );
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get("authorization");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const exists = await prismaClient.aPIToken.findUnique({
    where: { token: token },
  });
  if (!exists)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  let body: { language: string };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  return NextResponse.json(
    await prismaClient.locale.delete({
      where: { language: body.language },
    })
  );
}
