"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { MapPin, LogOut, User } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const { currentUser, logout } = useAuth()

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">Local Explorer</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Search
              </Link>
              <Link
                href="/add"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/add" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Add Place
              </Link>
              {currentUser && (
                <Link
                  href="/bookings"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/bookings" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {currentUser.role === "promoter" ? "Bookings" : "My Bookings"}
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{currentUser.username}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2 bg-transparent">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
