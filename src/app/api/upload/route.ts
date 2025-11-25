import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pdfHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createRequire } from "module";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Lazy load pdfjs-dist
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  /**
   * Explicitly set the workerSrc to prevent "Worker was destroyed" errors 
   * or attempts to load the worker from a CDN/invalid path.
   * In Node.js, pointing to the local file is usually safe or we can use a null worker if supported, 
   * but legacy build often handles this. 
   * However, pdfjs-dist typically requires a worker.
   */
  pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";

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
  // pdfjs-dist accepts ArrayBuffer directly or Uint8Array
  const uint8Array = new Uint8Array(arrayBuffer);

  try {
    console.log("Parsing PDF...");
    
    const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        disableFontFace: true,
    });

    const pdfDocument = await loadingTask.promise;
    console.log("PDF loaded. Pages:", pdfDocument.numPages);

    let fullText = "";

    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();
        
        // Use content stream order which usually preserves logical reading order (e.g. columns)
        const items = textContent.items as any[];

        let lastY = -1;
        let text = '';
        
        for (const item of items) {
            const str = item.str;
            // Add space if needed (simple heuristic)
            if (text.length > 0 && !text.endsWith(' ') && !text.endsWith('\n')) {
                text += ' ';
            }
            
            text += str;
            if (item.hasEOL) {
                text += '\n';
            }
        }
        
        fullText += text + "\n\n";
    }

    console.log("PDF parsed successfully. Text length:", fullText.length);
    
    // Save to DB
    console.log("Saving to DB...");
    await db.insert(pdfHistory).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        fileName: file.name,
        fileContent: fullText,
    });
    console.log("Saved to DB.");

    return NextResponse.json({ success: true, text: fullText });
  } catch (e: any) {
    console.error("Error processing PDF:", e);
    return NextResponse.json({ error: "Failed to parse PDF: " + e.message }, { status: 500 });
  }
}
