import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, twitterUrl, password, profilePicture } = body;

    // Validate required fields
    if (!name || !email || !twitterUrl || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate Twitter URL
    if (!twitterUrl.includes('twitter.com') && !twitterUrl.includes('x.com')) {
      return NextResponse.json(
        { error: 'Twitter URL must be from twitter.com or x.com' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      email,
      twitterUrl,
      password,
      profilePicture,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          twitterUrl: user.twitterUrl,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'User with this email already exists') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

