import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";

export async function GET(request: NextRequest, params: { asset: string }) {
  return NextResponse.json({
    asset: params.asset,
    pwd: await fs.realpath("."),
  });
}
