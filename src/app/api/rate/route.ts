import { RateRequestSchema } from "@/utils/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = RateRequestSchema.parse(await request.json());
  console.log("TODO: " + JSON.stringify(body));
  return NextResponse.json({ success: true });
}
