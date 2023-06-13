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
      await prismaClient.member.findMany({
        where: { locale: { language: locale } },
      })
    );

  return NextResponse.json(
    await prismaClient.member.findUnique({
      where: { id: id },
    })
  );
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const tokenExists = await prismaClient.aPIToken.findUnique({
    where: { token: token },
  });
  if (!tokenExists)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  let body: {
    id: string;
    locale: string;
    name: string;
    position: string;
  };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    return NextResponse.json(
      await prismaClient.member.update({
        where: {
          id: body.id,
        },
        data: {
          name: body.name,
          description: body.position,
        },
      })
    );
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.headers.get("authorization");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const tokenExists = await prismaClient.aPIToken.findUnique({
    where: { token: token },
  });
  if (!tokenExists)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  let body: {
    locale: string;
    name: string;
    position: string;
  };
  // TODO fix this
  const schema = z.object({
    locale: z.string(),
    name: z.string(),
    position: z.string(),
  });

  const zodBody = schema.safeParse(await request.text());

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  return NextResponse.json(
    await prismaClient.member.create({
      data: {
        name: body.name,
        description: body.position,
        locale: { connect: { language: body.locale } },
      },
    })
  );
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get("authorization");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

  const tokenExists = await prismaClient.aPIToken.findUnique({
    where: { token: token },
  });
  if (!tokenExists)
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
    await prismaClient.member.delete({
      where: {
        id: body.id,
      },
    })
  );
}
