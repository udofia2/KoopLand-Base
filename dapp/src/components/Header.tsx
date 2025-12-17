"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, Plus, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import type { User as AppUser } from "@/lib/types";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setCurrentUser(null);
        return;
      }
      const parsed = JSON.parse(userStr) as AppUser;
      setCurrentUser(parsed);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    setCurrentUser(null);
    router.push("/");
  };

  const navLinks = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/create-idea", label: "Create Idea" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-lightgray bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-tan">Koopland</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-tan"
                    : "text-foreground hover:text-tan"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <ConnectButton />
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-lightgray transition-colors"
                >
                  <User className="h-5 w-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {currentUser.name}
                  </span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-lightgray rounded-md shadow-lg py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-lightgray"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/create-idea"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-lightgray"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Create Idea
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-lightgray flex items-center gap-2"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="border-lightgray">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-tan hover:bg-tan/90 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-lightgray py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-4 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-tan"
                    : "text-foreground hover:text-tan"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-2">
              <ConnectButton />
            </div>
            {currentUser ? (
              <>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm font-medium text-foreground hover:text-tan"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:text-tan"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm font-medium text-foreground hover:text-tan"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 text-sm font-medium text-foreground hover:text-tan"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
