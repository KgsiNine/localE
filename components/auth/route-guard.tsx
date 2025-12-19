"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: "promoter" | "visitor";
  redirectTo?: string;
}

export function RouteGuard({
  children,
  requireAuth = true,
  requireRole,
  redirectTo,
}: RouteGuardProps) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    setIsChecking(false);

    // If auth is required but user is not logged in
    if (requireAuth && !currentUser) {
      const redirect =
        redirectTo || `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirect);
      return;
    }

    // If specific role is required
    if (requireRole && currentUser?.role !== requireRole) {
      router.push("/");
      return;
    }
  }, [
    currentUser,
    isLoading,
    requireAuth,
    requireRole,
    router,
    pathname,
    redirectTo,
  ]);

  // Show loading state while checking auth
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-pulse space-y-4 text-center">
              <div className="h-8 bg-muted rounded w-48 mx-auto" />
              <div className="h-4 bg-muted rounded w-32 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If auth is required but user is not logged in, show message
  if (requireAuth && !currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md">
            <Alert className="p-6">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="mt-4 space-y-4">
                <p className="text-lg font-semibold">Authentication Required</p>
                <p className="text-sm text-muted-foreground">
                  Please log in to access this page.
                </p>
                <Button asChild className="w-full">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(pathname)}`}
                  >
                    Go to Login
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  // If specific role is required but user doesn't have it
  if (requireRole && currentUser?.role !== requireRole) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md">
            <Alert variant="destructive" className="p-6">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="mt-4 space-y-4">
                <p className="text-lg font-semibold">Access Denied</p>
                <p className="text-sm">
                  This page is only accessible to {requireRole}s.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">Go to Home</Link>
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
