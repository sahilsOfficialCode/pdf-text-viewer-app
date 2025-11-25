import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pdfHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    // Ensure user can only delete their own records
    await db.delete(pdfHistory).where(
      and(eq(pdfHistory.id, id), eq(pdfHistory.userId, session.user.id))
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Error deleting PDF:", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
