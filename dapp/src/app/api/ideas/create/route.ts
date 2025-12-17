import { NextRequest, NextResponse } from "next/server";
import { Idea } from "@/lib/models/Idea";
import { analyzeIdea } from "@/lib/services/openai";
import { Category, Chain } from "@/lib/types";
import { calculateIdeaPrice } from "@/lib/utils/pricing";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Helper to verify JWT and get user
function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      image,
      categories,
      preview,
      fullContent,
      sellerWalletAddress,
      preferredChain,
      sellerName,
      sellerTwitter,
    } = body;

    // Validate required fields
    if (!title || !image || !categories || !preview || !fullContent) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate categories
    if (
      !Array.isArray(categories) ||
      categories.length < 1 ||
      categories.length > 3
    ) {
      return NextResponse.json(
        { error: "Must select between 1 and 3 categories" },
        { status: 400 }
      );
    }

    // Validate preview word count (up to 150 words)
    const previewWords = preview
      .trim()
      .split(/\s+/)
      .filter((w: string) => w.length > 0);
    if (previewWords.length > 150) {
      return NextResponse.json(
        { error: "Preview must be 150 words or fewer" },
        { status: 400 }
      );
    }

    // Validate full content word count (up to 3000 words)
    const fullContentWords = fullContent
      .trim()
      .split(/\s+/)
      .filter((w: string) => w.length > 0);
    if (fullContentWords.length > 3000) {
      return NextResponse.json(
        { error: "Full content must be 3000 words or fewer" },
        { status: 400 }
      );
    }

    // Validate wallet address
    if (!sellerWalletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Validate preferred chain
    if (
      !preferredChain ||
      !["ethereum", "polygon", "arbitrum", "optimism", "sepolia"].includes(
        preferredChain
      )
    ) {
      return NextResponse.json(
        { error: "Valid preferred chain is required" },
        { status: 400 }
      );
    }

    // Analyze idea with OpenAI
    const aiRating = await analyzeIdea(title, preview, fullContent, categories);

    // Calculate price based on AI scores
    const price = calculateIdeaPrice(
      aiRating.originality,
      aiRating.useCaseValue
    );

    // Create idea in database
    const idea = await Idea.create({
      title,
      image,
      categories: categories as Category[],
      preview,
      fullContent,
      price,
      sellerId: user.userId,
      sellerWalletAddress,
      preferredChain: preferredChain as Chain,
      sellerName: sellerName || "Anonymous",
      sellerTwitter: sellerTwitter || "",
      aiRating: {
        originality: aiRating.originality,
        useCaseValue: aiRating.useCaseValue,
        categoryMatch: aiRating.categoryMatch,
      },
    });

    return NextResponse.json(
      {
        success: true,
        idea: {
          id: idea._id,
          title: idea.title,
          image: idea.image,
          categories: idea.categories,
          preview: idea.preview,
          price: idea.price,
          aiRating: idea.aiRating,
          status: idea.status,
          createdAt: idea.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create idea error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
