import { NextRequest, NextResponse } from "next/server";
import { Idea as IdeaModel } from "@/lib/models/Idea";
import { Idea } from "@/lib/types";

export async function GET(_request: NextRequest) {
  try {
    const ideas = await IdeaModel.findLive();

    const result: Idea[] = ideas.map((idea) => ({
      id: (idea as any)._id?.toString?.() ?? String((idea as any)._id),
      title: idea.title,
      image: idea.image,
      categories: idea.categories,
      preview: idea.preview,
      fullContent: idea.fullContent,
      price: idea.price,
      sellerId: idea.sellerId,
      sellerName: idea.sellerName,
      sellerTwitter: idea.sellerTwitter,
      sellerWalletAddress: idea.sellerWalletAddress,
      preferredChain: idea.preferredChain,
      sellerIdeasSold: idea.sellerIdeasSold,
      salesCount: idea.salesCount,
      aiRating: idea.aiRating,
      createdAt: idea.createdAt.toISOString(),
      status: idea.status,
    }));

    return NextResponse.json({ success: true, ideas: result }, { status: 200 });
  } catch (error: any) {
    console.error("Get ideas error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch ideas" },
      { status: 500 }
    );
  }
}
