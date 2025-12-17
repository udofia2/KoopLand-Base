"use client";

import Link from "next/link";
import { Star, Check } from "lucide-react";
import { Idea } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";
import { RatingDisplay } from "./RatingDisplay";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface IdeaCardProps {
  idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Link href={`/idea/${idea.id}`}>
      <div
        className={cn(
          "group relative bg-white border border-lightgray rounded-lg p-6",
          "hover:shadow-lg transition-all duration-300 cursor-pointer",
          "flex flex-col h-full"
        )}
      >
        <div className="flex items-start justify-between mb-3">
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

        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-tan transition-colors">
          {idea.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 grow">
          {idea.preview}
        </p>

        <div className="space-y-2 mb-4">
          <RatingDisplay
            label="Originality"
            value={idea.aiRating.originality}
            showProgress={false}
            className="text-xs"
          />
          <RatingDisplay
            label="Use Case Value"
            value={idea.aiRating.useCaseValue}
            showProgress={false}
            className="text-xs"
          />
        </div>

        <div className="flex items-center justify-between mb-4 pt-4 border-t border-lightgray">
          <div>
            <p className="text-2xl font-bold text-foreground">${idea.price}</p>
            <p className="text-xs text-muted-foreground">USD</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {idea.sellerName}
            </p>
            <p className="text-xs text-muted-foreground">
              {idea.salesCount} sold
            </p>
          </div>
        </div>

        <Button
          variant="default"
          className="w-full bg-tan hover:bg-tan/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View Details
        </Button>
      </div>
    </Link>
  );
}
