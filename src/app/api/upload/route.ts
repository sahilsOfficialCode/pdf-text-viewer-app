import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pdfHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createRequire } from "module";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Lazy load pdf-parse
  const require = createRequire(import.meta.url);
  const pdfParse = require("pdf-parse");

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const data = await pdfParse(buffer);
    const text = data.text;

    // Save to DB
    await db.insert(pdfHistory).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        fileName: file.name,
        fileContent: text,
    });

    return NextResponse.json({ success: true, text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
