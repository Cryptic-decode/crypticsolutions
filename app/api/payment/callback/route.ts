import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This legacy payment endpoint is no longer available." },
    { status: 410 },
  );
}
