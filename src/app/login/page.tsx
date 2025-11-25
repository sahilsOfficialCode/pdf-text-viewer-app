"use client"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({ 
          email, 
          password, 
          name: name || email.split("@")[0] 
        }, {
          onSuccess: () => {
            toast.success("Account created successfully")
            router.push("/")
          }
        })
        if (error) throw error
      } else {
        const { error } = await authClient.signIn.email({ 
          email, 
          password 
        }, {
          onSuccess: () => {
             toast.success("Signed in successfully")
             router.push("/")
          }
        })
        if (error) throw error
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignUp && (
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          )}
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already have an account? Sign In" : "Create an account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
