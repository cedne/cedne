import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: { asset: string } }
) {
  const assetDir = `${
    process.env.NODE_ENV === "development" ? "./public/assets" : "./app/assets"
  }`;
  const assets = await fs.readdir(assetDir);

  if (params.asset.includes(".")) {
    if (await fs.stat(`${assetDir}/${params.asset}`))
      return NextResponse.json(params.asset);
  } else {
    const asset = assets.find(console.log);
    console.log(asset);
    return NextResponse.json(asset);
  }
}
