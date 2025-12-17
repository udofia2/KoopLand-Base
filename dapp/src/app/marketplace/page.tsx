"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IdeaCard } from "@/components/IdeaCard";
import { Input } from "@/components/ui/input";
import { Idea, Category, categories } from "@/lib/types";

type SortOption =
  | "newest"
  | "highest-rated"
  | "most-sold"
  | "price-low"
  | "price-high";

export default function MarketplacePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">(
    "All"
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const res = await fetch("/api/ideas");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to load ideas");
        }
        setIdeas(json.ideas || []);
      } catch (err: any) {
        setError(err.message || "Failed to load ideas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = [...ideas];

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((idea) =>
        idea.categories.includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          idea.preview.toLowerCase().includes(query) ||
          idea.categories.some((cat) => cat.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "highest-rated":
        filtered.sort((a, b) => {
          const avgA = (a.aiRating.originality + a.aiRating.useCaseValue) / 2;
          const avgB = (b.aiRating.originality + b.aiRating.useCaseValue) / 2;
          return avgB - avgA;
        });
        break;
      case "most-sold":
        filtered.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Idea Marketplace
          </h1>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as Category | "All")
                  }
                  className="h-10 pl-10 pr-8 rounded-md border border-lightgray bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tan focus-visible:ring-offset-2"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-10 pl-10 pr-8 rounded-md border border-lightgray bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tan focus-visible:ring-offset-2"
                >
                  <option value="newest">Newest</option>
                  <option value="highest-rated">Highest Rated</option>
                  <option value="most-sold">Most Sold</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results / Loading / Error */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Loading ideas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">
              Please refresh the page to try again.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {filteredAndSortedIdeas.length} idea
              {filteredAndSortedIdeas.length !== 1 ? "s" : ""}
            </div>

            {filteredAndSortedIdeas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedIdeas.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-2">
                  No ideas found
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
   
  );
}
