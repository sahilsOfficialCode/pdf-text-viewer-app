import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pdfHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  console.log("File received:", file.name, "Size:", file.size, "Type:", file.type);

  // Check for duplicate file (same name for same user)
  const existing = await db.select({ id: pdfHistory.id }).from(pdfHistory).where(
    and(eq(pdfHistory.userId, session.user.id), eq(pdfHistory.fileName, file.name))
  ).limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "A file with this name already exists. Please rename the file or delete the existing one." }, { status: 409 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    console.log("Parsing PDF...");
    
    // Dynamic import to avoid build-time issues
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    const text = data.text;
    
    console.log("PDF parsed successfully. Text length:", text.length);
    
    // Save to DB
    console.log("Saving to DB...");
    await db.insert(pdfHistory).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        fileName: file.name,
        fileContent: text,
    });
    console.log("Saved to DB.");

    return NextResponse.json({ success: true, text });
  } catch (e: any) {
    console.error("Error processing PDF:", e);
    return NextResponse.json({ error: "Failed to parse PDF: " + e.message }, { status: 500 });
  }
}
