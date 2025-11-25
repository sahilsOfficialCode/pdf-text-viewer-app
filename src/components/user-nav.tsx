"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UserNavProps {
    name: string
}

export function UserNav({ name }: UserNavProps) {
    const router = useRouter()

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Signed out successfully")
                    router.push("/login")
                }
            }
        })
    }

    return (
        <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">Welcome, {name}</div>
            <Button variant="outline" onClick={handleSignOut}>
                Sign Out
            </Button>
        </div>
    )
}
