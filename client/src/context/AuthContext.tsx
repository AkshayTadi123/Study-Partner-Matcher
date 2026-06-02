"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthUser {
  _id?: string;
  userName: string;
  profileImage: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  courses: string[];
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData: AuthUser) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("auth", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
