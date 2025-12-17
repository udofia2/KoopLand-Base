import Link from "next/link";
import { Sparkles, ArrowRight, Coins, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Welcome to <span className="text-tan">Koopland</span>
            </h1>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-6">
              Discover AI-Vetted Ideas, Buy with Any Token
            </h2>
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              Every idea is rated by AI for originality and value. Buy
              seamlessly using any cryptocurrency via{" "}
              <span className="font-semibold">SideShift Pay</span>.
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
              <span className="font-semibold">Buyers:</span> you don&apos;t need
              to connect a wallet if you plan to pay with SideShift – just
              choose &quot;Pay with SideShift&quot; at checkout.
              <br />
              <span className="font-semibold">Sellers:</span> your ideas will be
              minted as NFTs and delivered to your connected wallet after
              upload and purchase.
            </p>
            <Link href="/marketplace">
              <Button
                size="lg"
                className="bg-tan hover:bg-tan/90 text-white text-lg px-8 py-6"
              >
                Explore Ideas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Why Choose Koopland?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-tan mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  AI-Verified Quality
                </h3>
                <p className="text-muted-foreground">
                  Every idea is analyzed by advanced AI to ensure originality,
                  value, and market fit before listing.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-tan mb-4">
                  <Coins className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  SideShift-Powered Payments
                </h3>
                <p className="text-muted-foreground">
                  Pay with any cryptocurrency through{" "}
                  <span className="font-semibold">SideShift Pay</span> – no
                  account needed, and no wallet connection required if you pay
                  via SideShift.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-tan mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  NFT Ownership
                </h3>
                <p className="text-muted-foreground">
                  Each purchased idea is minted as an NFT to the seller&apos;s
                  wallet, with buyers receiving a downloadable CSV copy of the
                  full idea content.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

