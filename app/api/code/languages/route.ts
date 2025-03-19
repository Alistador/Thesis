// app/api/code/languages/route.ts
import { NextResponse } from "next/server";
import { getLanguages } from "@/utils/judge0Service";

export async function GET() {
  try {
    const languages = await getLanguages();
    return NextResponse.json(languages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
