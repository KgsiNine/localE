"use client";

import { useState, useEffect } from "react";
import type { User } from "@/lib/types";
import {
  getCurrentUser,
  setCurrentUser,
  getUsers,
  addUser,
  initializeStorage,
} from "@/lib/storage";

export function useAuth() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const user = getCurrentUser();
    setCurrentUserState(user);
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    const users = getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const userWithoutPassword = { ...user };
      setCurrentUser(userWithoutPassword);
      setCurrentUserState(userWithoutPassword);
      return true;
    }

    return false;
  };

  const signup = (
    email: string,
    password: string,
    username: string,
    role: "promoter" | "visitor" = "visitor"
  ): boolean => {
    const users = getUsers();

    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      username,
      password,
      role,
    };

    addUser(newUser);
    const userWithoutPassword = { ...newUser };
    setCurrentUser(userWithoutPassword);
    setCurrentUserState(userWithoutPassword);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
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
