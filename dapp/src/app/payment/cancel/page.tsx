"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const [ideaId, setIdeaId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("ideaId");
    setIdeaId(id);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground mb-8">
            Your payment was cancelled. No charges were made to your account.
          </p>
          <div className="space-y-4">
            {ideaId && (
              <Link href={`/idea/${ideaId}`}>
                <Button className="w-full bg-tan hover:bg-tan/90 text-white">
                  Try Again
                </Button>
              </Link>
            )}
            <Link href="/marketplace">
              <Button variant="outline" className="w-full border-lightgray">
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

