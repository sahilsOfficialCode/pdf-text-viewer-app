import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { pdfHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import UploadComponent from "@/components/upload-component";
import { HistoryTable } from "@/components/history-table";
import { UserNav } from "@/components/user-nav";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/login");
  }

  const history = await db.select().from(pdfHistory).where(eq(pdfHistory.userId, session.user.id)).orderBy(desc(pdfHistory.uploadedAt));

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">PDF Extractor</h1>
        <UserNav name={session.user.name} />
      </div>
      
      <UploadComponent />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">History</h2>
        <HistoryTable history={history} />
      </div>
    </div>
  )
}
