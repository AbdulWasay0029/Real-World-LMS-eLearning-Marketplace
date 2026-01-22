"use client";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <SessionProvider>
          <AuthProvider>
            <Navbar />
            <main className="container mx-auto p-4">
              {children}
            </main>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
