"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function UploadComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData
        })
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            throw new Error(errorData.error || "Upload failed")
        }
        toast.success("PDF processed and saved!")
        router.refresh()
        setFile(null)
        // Reset the input value
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    } catch (e: any) {
        console.error(e)
        toast.error(e.message || "Error uploading file")
    } finally {
        setLoading(false)
    }
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Upload PDF</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-center">
            <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
            <Button onClick={handleUpload} disabled={!file || loading}>
                {loading ? "Processing..." : "Upload"}
            </Button>
        </CardContent>
    </Card>
  )
}
