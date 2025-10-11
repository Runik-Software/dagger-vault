import type { Metadata } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: "Dagger Vault",
  description: "Create and manage your characters for Daggerheart RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-serif min-h-screen bg-[url('/background.jpg')] bg-cover bg-center bg-fixed`}
      >
        <Providers>
          <header className="border-b sticky top-0 bg-accent z-10">
            <div className="container mx-auto flex items-center justify-between">
              <Link href="/" className="cursor-pointer">
                <Image
                  src="/daggerheart-logo-2.png"
                  alt="Daggerheart RPG"
                  width={150}
                  height={150}
                />
              </Link>
              <SignedIn>
                <UserButton size="icon" className="border cursor-pointer" />
              </SignedIn>
              <SignedOut>
                <Link href="/auth/sign-in" className="pr-4">
                  <Button className="text-sm hover:underline">Sign In</Button>
                </Link>
              </SignedOut>
            </div>
          </header>

          {children}
        </Providers>
        <Toaster richColors></Toaster>
      </body>
    </html>
  );
}
