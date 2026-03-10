import { NextResponse } from "next/server";
import { successResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    successResponse({
      status: "ok",
    }),
  );
}
