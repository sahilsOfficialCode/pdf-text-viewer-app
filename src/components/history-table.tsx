"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Eye, Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface HistoryItem {
    id: string
    fileName: string
    uploadedAt: Date
    fileContent: string
}

interface HistoryTableProps {
    history: HistoryItem[]
}

export function HistoryTable({ history }: HistoryTableProps) {
    const [selectedDoc, setSelectedDoc] = useState<HistoryItem | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const res = await fetch(`/api/pdf?id=${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("PDF deleted successfully")
            router.refresh()
        } catch (e) {
            toast.error("Failed to delete PDF")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Uploaded At</TableHead>
                        <TableHead>Content Preview</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No PDFs uploaded yet</p>
                                <p className="text-sm">Upload your first PDF to get started</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        history.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="max-w-[200px] truncate">{item.fileName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{new Date(item.uploadedAt).toLocaleDateString('en-US')}</TableCell>
                                <TableCell className="max-w-[300px] truncate text-muted-foreground">
                                    {item.fileContent.substring(0, 50)}...
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(item)}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                                                <DialogHeader className="flex-shrink-0">
                                                    <DialogTitle className="truncate pr-8">{item.fileName}</DialogTitle>
                                                    <DialogDescription>
                                                        Uploaded on {new Date(item.uploadedAt).toLocaleString('en-US')}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex-1 min-h-0 mt-4">
                                                    <ScrollArea className="h-[60vh] w-full rounded-md border p-4 bg-muted/50">
                                                        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                                            {item.fileContent}
                                                        </pre>
                                                    </ScrollArea>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    disabled={deletingId === item.id}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    {deletingId === item.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete this PDF?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete <span className="font-medium text-foreground">"{item.fileName}"</span> and its extracted text. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(item.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
