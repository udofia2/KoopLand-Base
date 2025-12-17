import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
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

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, twitterUrl, profilePicture } = body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Validate Twitter URL if provided
    if (twitterUrl && !twitterUrl.includes('twitter.com') && !twitterUrl.includes('x.com')) {
      return NextResponse.json(
        { error: 'Twitter URL must be from twitter.com or x.com' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await User.update(user.userId, {
      name,
      email,
      twitterUrl,
      profilePicture,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return updated user data (without password)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          twitterUrl: updatedUser.twitterUrl,
          profilePicture: updatedUser.profilePicture,
          createdAt: updatedUser.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

