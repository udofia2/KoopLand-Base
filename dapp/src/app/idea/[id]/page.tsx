"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Check, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryBadge } from "@/components/CategoryBadge";
import { RatingDisplay } from "@/components/RatingDisplay";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { Idea } from "@/lib/types";

interface IdeaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const res = await fetch(`/api/ideas/${id}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to load idea");
        }
        setIdea(json.idea);
      } catch (err: any) {
        setError(err.message || "Failed to load idea");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [id]);

  const handlePurchase = () => {
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please sign in to purchase ideas");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ideaId: id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to create checkout");
        return;
      }

      // Redirect to SideShift payment page
      window.location.href = result.paymentUrl;
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!idea) return;

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

    toast.success(
      "CSV downloaded. Keep it safe – if you lose it, you'll need to repurchase the idea."
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="grow flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading idea...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || "Idea Not Found"}
            </h1>
            <Link href="/marketplace">
              <Button className="bg-tan hover:bg-tan/90 text-white">
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex flex-wrap gap-2">
                  {idea.categories.map((cat) => (
                    <CategoryBadge key={cat} category={cat} />
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-tan text-white px-2 py-0.5 rounded-full text-xs">
                  <Check className="h-3 w-3" />
                  <span>AI Verified</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-6">
                {idea.title}
              </h1>
            </div>

            {/* Seller Info Card */}
            <div className="bg-white border border-lightgray rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Seller Information
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-lightgray flex items-center justify-center">
                  <span className="text-lg font-semibold text-foreground">
                    {idea.sellerName[0]}
                  </span>
                </div>
                <div className="grow">
                  <p className="font-semibold text-foreground">
                    {idea.sellerName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {idea.sellerIdeasSold} Ideas Sold
                  </p>
                </div>
                <a
                  href={idea.sellerTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tan hover:text-tan/80"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Price and Purchase */}
            <div className="bg-white border border-lightgray rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-4xl font-bold text-foreground">
                  ${idea.price}
                </p>
                <p className="text-sm text-muted-foreground">USD</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-tan hover:bg-tan/90 text-white"
                  disabled={isPurchased}
                >
                  {isPurchased ? "Already Purchased" : "Pay with SideShift"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-dashed border-lightgray text-muted-foreground cursor-not-allowed"
                  disabled
                >
                  Pay with Connected Wallet (coming soon)
                </Button>
              </div>
              {!isPurchased && (
                <p className="mt-1 text-xs text-muted-foreground text-center">
                  You do not need to connect a wallet if you plan to pay with
                  SideShift.
                </p>
              )}
            </div>

            {/* AI Rating Card */}
            <div className="bg-white border border-lightgray rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                AI Verification Report
              </h2>
              <div className="space-y-4">
                <RatingDisplay
                  label="Originality & Innovation"
                  value={idea.aiRating.originality}
                />
                <RatingDisplay
                  label="Use Case Relevance"
                  value={idea.aiRating.useCaseValue}
                />
                <RatingDisplay
                  label="Category Match"
                  value={idea.aiRating.categoryMatch}
                />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Analyzed by OpenAI GPT-4
              </p>
            </div>

            {/* Purchase Info */}
            {!isPurchased && (
              <div className="bg-lightgray rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Payment Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pay with any supported cryptocurrency via SideShift Pay.
                  You'll be redirected to complete your payment securely.
                </p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-lightgray rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Preview
              </h2>
              <p className="text-sm text-muted-foreground mb-6 whitespace-pre-line">
                {idea.preview}
              </p>

              {!isPurchased && (
                <>
                  <div className="border-t border-lightgray my-6"></div>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Full idea details revealed after purchase and NFT minting
                  </p>
                </>
              )}

              {showFullContent && (
                <>
                  <div className="border-t border-lightgray my-6"></div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Full Idea Details
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">
                    {idea.fullContent}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-lightgray"
                    onClick={handleDownloadCsv}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Keep your CSV safe. If you lose it, you&apos;ll need to
                    purchase the idea again to regain access.
                  </p>
                </>
              )}

              <div className="mt-6 pt-6 border-t border-lightgray">
                <p className="text-sm text-muted-foreground text-center">
                  {idea.salesCount} people have bought this idea
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Purchase Modal */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Purchase Idea"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You will be redirected to SideShift Pay to complete your purchase.
            You can pay with any supported cryptocurrency.
          </p>
          <div className="bg-lightgray rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="text-lg font-bold text-foreground">
                ${idea.price}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Payment Chain:
              </span>
              <span className="text-sm font-medium text-foreground capitalize">
                {idea.preferredChain}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-lightgray"
              onClick={() => setShowPurchaseModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-tan hover:bg-tan/90 text-white"
              onClick={handleConfirmPurchase}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Message */}
      {isPurchased && !showPurchaseModal && (
        <div className="fixed bottom-4 right-4 bg-tan text-white px-6 py-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium">
            Processing payment via SideShift... NFT will be minted to your
            wallet
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
}
