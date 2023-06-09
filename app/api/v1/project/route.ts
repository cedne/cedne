import prismaClient from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const locale = searchParams.get("locale");

  if (!locale)
    return NextResponse.json({ error: "No locale" }, { status: 400 });

  if (!id)
    return NextResponse.json(
      await prismaClient.project.findMany({
        where: { locale: { language: locale } },
      })
    );

  return NextResponse.json(
    await prismaClient.project.findUnique({
      where: { id },
    })
  );
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const exists = await prismaClient.aPIToken.findUnique({
    where: { token: token },
  });
  if (!exists)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  let body: {
    id: string;
    locale: string;
    name: string;
    description: string;
  };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  return NextResponse.json(
    await prismaClient.project.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        description: body.description,
      },
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

  let body: {
    locale: string;
    name: string;
    description: string;
  };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  return NextResponse.json(
    await prismaClient.project.create({
      data: {
        locale: { connect: { language: body.locale } },
        name: body.name,
        description: body.description,
      },
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

  let body: {
    id: string;
    locale: string;
  };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  return NextResponse.json(
    await prismaClient.project.delete({
      where: {
        id: body.id,
      },
    })
  );
}
