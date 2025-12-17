import { NextRequest, NextResponse } from 'next/server';
import { Idea } from '@/lib/models/Idea';
import { getDb } from '@/lib/db';
import { createSideShiftCheckout, getSideShiftCoinAndNetwork } from '@/lib/services/sideshift';
import { calculateCommission } from '@/lib/utils/commission';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper to verify JWT and get user
function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ideaId } = body;

    if (!ideaId) {
      return NextResponse.json(
        { error: 'Idea ID is required' },
        { status: 400 }
      );
    }

    // Get idea from database
    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Check if user is trying to buy their own idea
    if (idea.sellerId === user.userId) {
      return NextResponse.json(
        { error: 'You cannot purchase your own idea' },
        { status: 400 }
      );
    }

    // Get user's IP address
    const userIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   '0.0.0.0';

    // Get coin and network for preferred chain
    const { coin, network } = getSideShiftCoinAndNetwork(idea.preferredChain);

    // Calculate commission (7% to platform, 93% to seller)
    const { commission, sellerAmount } = calculateCommission(idea.price);

    // The seller receives 93% of the price (after 7% commission)
    const settleAmount = sellerAmount.toString();

    // Create SideShift checkout
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const checkout = await createSideShiftCheckout({
      settleCoin: coin,
      settleNetwork: network,
      settleAmount: settleAmount,
      settleAddress: idea.sellerWalletAddress,
      affiliateId: process.env.SIDESHIFT_ACCOUNT_ID || '', // Platform receives affiliate commission
      successUrl: `${baseUrl}/payment/success?ideaId=${ideaId}`,
      cancelUrl: `${baseUrl}/payment/cancel?ideaId=${ideaId}`,
    }, userIp);

    // Store purchase record in database
    const db = await getDb();
    const purchasesCollection = db.collection('purchases');
    await purchasesCollection.insertOne({
      ideaId: idea._id,
      buyerId: user.userId,
      checkoutId: checkout.id,
      status: 'pending',
      totalAmount: idea.price,
      commission: commission,
      sellerAmount: sellerAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        checkoutId: checkout.id,
        paymentUrl: `https://pay.sideshift.ai/checkout/${checkout.id}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    );
  }
}

