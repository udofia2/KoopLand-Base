"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import type { Idea } from "@/lib/types";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const id = searchParams.get("ideaId");
    setIdeaId(id);
  }, [searchParams]);

  useEffect(() => {
    const fetchIdea = async () => {
      if (!ideaId) return;
      try {
        const res = await fetch(`/api/ideas/${ideaId}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to load idea");
        }
        setIdea(json.idea);
      } catch (error) {
        // Silently fail; user can still view idea page
      }
    };

    fetchIdea();
  }, [ideaId]);

  const handleDownloadCsv = () => {
    if (!idea) return;

    setIsDownloading(true);

    const rows = [
      ["Title", idea.title],
      ["Preview", idea.preview],
      ["Full Content", idea.fullContent],
      ["Categories", idea.categories.join(", ")],
      ["Price (USD)", idea.price.toString()],
    ];

    const csvContent =
      rows
        .map((row) =>
          row
            .map((value) => {
              const safe = String(value).replace(/"/g, '""');
              return `"${safe}"`;
            })
            .join(",")
        )
        .join("\n") + "\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `idea-${idea.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mb-8">
            Your payment has been processed successfully. You now have access to the full idea details.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            You can download a CSV copy of the idea below. Keep it safe – if you lose it, you&apos;ll need to purchase the idea again to regain access.
          </p>
          <div className="space-y-4">
            {idea && (
              <Button
                className="w-full bg-tan hover:bg-tan/90 text-white"
                onClick={handleDownloadCsv}
                disabled={isDownloading}
              >
                {isDownloading ? "Preparing CSV..." : "Download Idea as CSV"}
              </Button>
            )}
            {ideaId && (
              <Link href={`/idea/${ideaId}`}>
                <Button className="w-full bg-tan hover:bg-tan/90 text-white">
                  View Idea Details
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

