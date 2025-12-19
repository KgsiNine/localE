"use client";

import { useState, useEffect } from "react";
import type { User } from "@/lib/types";
import { authAPI } from "@/lib/api";

export function useAuth() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get stored user first
    const storedUser = authAPI.getStoredUser();
    if (storedUser) {
      // Set user optimistically but keep loading until verification
      setCurrentUserState(storedUser);
      // Verify token is still valid
      authAPI
        .getCurrentUser()
        .then((user) => {
          setCurrentUserState(user);
          setIsLoading(false);
        })
        .catch(() => {
          // Token invalid or user not authenticated, clear user
          setCurrentUserState(null);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user } = await authAPI.login(email, password);
      setCurrentUserState(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    role: "promoter" | "visitor" = "visitor"
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user } = await authAPI.signup(email, password, username, role);
      setCurrentUserState(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Signup failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore errors on logout
    }
    setCurrentUserState(null);
  };

  return {
    currentUser,
    isLoading,
    login,
    signup,
    logout,
  };
}
