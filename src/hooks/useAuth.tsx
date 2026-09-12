"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserSettings } from "@/types";
import { authService } from "@/services/authService";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserProfile>;
  signInWithGoogleRedirect: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  register: (email: string, pass: string, name: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => { throw new Error("Chưa khởi tạo"); },
  signInWithGoogleRedirect: async () => {},
  signInWithEmail: async () => { throw new Error("Chưa khởi tạo"); },
  register: async () => { throw new Error("Chưa khởi tạo"); },
  signOut: async () => {},
  updateSettings: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra kết quả Redirect nếu có
    authService.checkRedirectResult().then((redirectedUser) => {
      if (redirectedUser) {
        setUser(redirectedUser);
        setLoading(false);
      }
    }).catch(() => {});

    // Lắng nghe thay đổi auth state
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const u = await authService.signInWithGoogle();
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleRedirect = async () => {
    await authService.signInWithGoogleRedirect();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const u = await authService.signInWithEmail(email, pass);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const u = await authService.register(email, pass, name);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    await authService.updateSettings(user.uid, newSettings);
    setUser((prev) => (prev ? { ...prev, settings: { ...prev.settings, ...newSettings } } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGoogleRedirect,
        signInWithEmail,
        register,
        signOut,
        updateSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
