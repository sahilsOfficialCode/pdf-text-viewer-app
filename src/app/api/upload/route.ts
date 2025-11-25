import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pdfHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import PDFParser from "pdf2json";

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

  // Validate file type - only accept PDFs
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }

  // Validate file size - max 10MB
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
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
    
    // Use pdf2json - pure JavaScript, no DOM dependencies
    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, true);
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        reject(new Error(errData.parserError));
      });
      
      pdfParser.on("pdfParser_dataReady", () => {
        const rawText = pdfParser.getRawTextContent();
        resolve(rawText);
      });
      
      pdfParser.parseBuffer(buffer);
    });
    
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
