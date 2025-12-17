import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
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

/**
 * GET /api/admin/commission
 * Get total commission earned by the platform
 * Note: In production, add admin role check
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check in production
    // if (!user.isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const db = await getDb();
    const purchasesCollection = db.collection('purchases');

    // Get all completed purchases
    const completedPurchases = await purchasesCollection
      .find({ status: 'completed' })
      .toArray();

    // Calculate total commission
    const totalCommission = completedPurchases.reduce(
      (sum, purchase) => sum + (purchase.commission || 0),
      0
    );

    const totalRevenue = completedPurchases.reduce(
      (sum, purchase) => sum + (purchase.totalAmount || 0),
      0
    );

    return NextResponse.json(
      {
        success: true,
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalTransactions: completedPurchases.length,
        commissionRate: 0.07, // 7%
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get commission error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

