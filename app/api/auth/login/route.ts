import { type NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    let { mobile } = await request.json();
    if (typeof mobile === 'string') {
      mobile = mobile.replace(/\s+/g, '');
    }

    if (!mobile) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(mobile);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please contact your administrator.' },
        { status: 401 }
      );
    }

    const token = generateToken(user);
    const cookieStore = await cookies();

    // Set HTTP-only cookie
    cookieStore.set('construction-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
