"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Header } from "@/components/layout/header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"promoter" | "visitor">("visitor")
  const [error, setError] = useState("")
  const { signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !username || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    const result = await signup(email, password, username, role)

    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "Signup failed. Email may already exist.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Join Local Explorer to discover and review amazing places</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="space-y-2">
                    <label
                      className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => setRole("promoter")}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="promoter"
                        checked={role === "promoter"}
                        onChange={(e) => setRole(e.target.value as "promoter" | "visitor")}
                        className="cursor-pointer"
                      />
                      <div>
                        <div className="font-medium">Promoter</div>
                        <div className="text-xs text-muted-foreground">Upload and manage places</div>
                      </div>
                    </label>
                    <label
                      className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => setRole("visitor")}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="visitor"
                        checked={role === "visitor"}
                        onChange={(e) => setRole(e.target.value as "promoter" | "visitor")}
                        className="cursor-pointer"
                      />
                      <div>
                        <div className="font-medium">Visitor</div>
                        <div className="text-xs text-muted-foreground">Discover places and write reviews</div>
                      </div>
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
