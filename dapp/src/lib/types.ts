export type Category =
  | "DeFi"
  | "AI"
  | "SocialFi"
  | "DAO"
  | "Gaming"
  | "NFTs"
  | "Infrastructure"
  | "Other";

export type IdeaStatus = "live" | "pending" | "rejected";

export interface AIRating {
  originality: number;
  useCaseValue: number;
  categoryMatch: number;
}

export type Chain =
  | "ethereum"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "sepolia";

export interface Idea {
  id: string;
  title: string;
  image: string; // URL to the image
  categories: Category[]; // Multiple categories (1-3)
  preview: string;
  fullContent: string;
  price: number;
  sellerId: string;
  sellerName: string;
  sellerTwitter: string;
  sellerWalletAddress: string;
  preferredChain: Chain;
  sellerIdeasSold: number;
  salesCount: number;
  aiRating: AIRating;
  createdAt: string;
  status: IdeaStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  twitterUrl: string;
  profilePicture?: string;
  createdAt: string;
}

// Shared category list
export const categories: Category[] = [
  "DeFi",
  "AI",
  "SocialFi",
  "DAO",
  "Gaming",
  "NFTs",
  "Infrastructure",
  "Other",
];
