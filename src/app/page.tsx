import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { pdfHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import UploadComponent from "@/components/upload-component";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
        <div className="text-sm text-muted-foreground">Welcome, {session.user.name}</div>
      </div>
      
      <UploadComponent />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">History</h2>
        <div className="border rounded-md">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead>Content Preview</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {history.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">No history found</TableCell>
                    </TableRow>
                ) : (
                    history.map(item => (
                        <TableRow key={item.id}>
                            <TableCell>{item.fileName}</TableCell>
                            <TableCell>{item.uploadedAt.toLocaleDateString()}</TableCell>
                            <TableCell className="max-w-[300px] truncate">{item.fileContent.substring(0, 50)}...</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}
