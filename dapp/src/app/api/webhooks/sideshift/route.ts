import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSideShiftCheckout } from '@/lib/services/sideshift';

interface PurchaseDocument {
  _id?: string;
  ideaId: string;
  buyerId: string;
  checkoutId: string;
  shiftId?: string;
  status: 'pending' | 'completed' | 'failed';
  totalAmount: number;
  commission: number;
  sellerAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meta, payload } = body;

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const { shiftId, status, txid } = payload;

    if (!shiftId) {
      return NextResponse.json(
        { error: 'Missing shiftId' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const purchasesCollection = db.collection<PurchaseDocument>('purchases');

    // Try to find purchase by shiftId first (if already stored)
    let purchase = await purchasesCollection.findOne({ shiftId });

    // If not found by shiftId, we need to find by checkoutId
    // The webhook gives us shiftId, but we stored checkoutId
    // We'll query all pending purchases and check their checkouts for matching shiftId
    if (!purchase) {
      const pendingPurchases = await purchasesCollection
        .find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      // Try to find the checkout that contains this shiftId
      for (const pendingPurchase of pendingPurchases) {
        try {
          const checkout = await getSideShiftCheckout(pendingPurchase.checkoutId);
          // Check if this checkout has an order with matching shiftId
          if (checkout?.orders && Array.isArray(checkout.orders)) {
            const matchingOrder = checkout.orders.find(
              (order: any) => order.id === shiftId
            );
            if (matchingOrder) {
              purchase = pendingPurchase;
              break;
            }
          }
        } catch (error) {
          // Continue to next purchase
          continue;
        }
      }
    }

    if (!purchase) {
      console.warn('Purchase not found for shiftId:', shiftId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Update purchase status
    if (status === 'success') {
      await purchasesCollection.updateOne(
        { _id: purchase._id },
        {
          $set: {
            status: 'completed',
            shiftId,
            updatedAt: new Date(),
          },
        }
      );

      // Update idea sales count
      const ideasCollection = db.collection('ideas');
      await ideasCollection.updateOne(
        { _id: purchase.ideaId },
        {
          $inc: { salesCount: 1 },
        }
      );

      console.log(`Purchase ${purchase._id} completed for idea ${purchase.ideaId}`);
    } else if (status === 'fail') {
      await purchasesCollection.updateOne(
        { _id: purchase._id },
        {
          $set: {
            status: 'failed',
            updatedAt: new Date(),
          },
        }
      );

      console.log(`Purchase ${purchase._id} failed`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

