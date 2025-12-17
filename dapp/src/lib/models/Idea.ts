import { getDb } from '../db';
import { ObjectId } from 'mongodb';
import { Category, IdeaStatus, AIRating, Chain } from '../types';

export interface IdeaDocument {
  _id?: string;
  title: string;
  image: string;
  categories: Category[];
  preview: string;
  fullContent: string;
  price: number;
  sellerId: string;
  sellerWalletAddress: string; // Wallet address from RainbowKit
  preferredChain: Chain; // Preferred chain for receiving payments
  sellerName: string;
  sellerTwitter: string;
  sellerIdeasSold: number;
  salesCount: number;
  aiRating: AIRating;
  status: IdeaStatus;
  createdAt: Date;
}

export class Idea {
  static async create(data: {
    title: string;
    image: string;
    categories: Category[];
    preview: string;
    fullContent: string;
    price: number;
    sellerId: string;
    sellerWalletAddress: string;
    preferredChain: Chain;
    sellerName: string;
    sellerTwitter: string;
    aiRating: AIRating;
  }): Promise<IdeaDocument> {
    const db = await getDb();
    const ideasCollection = db.collection<IdeaDocument>('ideas');

    const idea: IdeaDocument = {
      title: data.title,
      image: data.image,
      categories: data.categories,
      preview: data.preview,
      fullContent: data.fullContent,
      price: data.price,
      sellerId: data.sellerId,
      sellerWalletAddress: data.sellerWalletAddress,
      preferredChain: data.preferredChain,
      sellerName: data.sellerName,
      sellerTwitter: data.sellerTwitter,
      sellerIdeasSold: 0,
      salesCount: 0,
      aiRating: data.aiRating,
      status: 'live',
      createdAt: new Date(),
    };

    const result = await ideasCollection.insertOne(idea);
    return {
      ...idea,
      _id: result.insertedId.toString(),
    };
  }

  static async findById(id: string): Promise<IdeaDocument | null> {
    const db = await getDb();
    const ideasCollection = db.collection<IdeaDocument>('ideas');
    return await ideasCollection.findOne({ _id: id });
    
  }

  static async findBySellerId(sellerId: string): Promise<IdeaDocument[]> {
    const db = await getDb();
    const ideasCollection = db.collection<IdeaDocument>('ideas');
    return await ideasCollection.find({ sellerId }).toArray();
  }

  static async findLive(): Promise<IdeaDocument[]> {
    const db = await getDb();
    const ideasCollection = db.collection<IdeaDocument>('ideas');
    // For now, return all ideas. If you want to only show approved ideas later,
    // change this back to { status: 'live' } or a more specific filter.
    return await ideasCollection.find({}).toArray();
  }
}

