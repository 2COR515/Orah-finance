import { auth } from '@/lib/auth';
import { jwtVerify } from 'jose';
import { headers } from 'next/headers';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

/**
 * Get session from either NextAuth (web) or Bearer token (mobile).
 * Drop-in replacement for auth() in API routes.
 */
export async function getSession() {
  // First try NextAuth session (web browser)
  const session = await auth();
  if (session?.user?.id) {
    return session;
  }

  // Fallback: check Bearer token (mobile app)
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, secret);

    if (!payload.id || !payload.email) {
      return null;
    }

    // Return a session-like object matching NextAuth shape
    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: (payload.name as string) || null,
        role: (payload.role as string) || 'USER',
        emailVerified: !!payload.emailVerified,
      },
      expires: new Date(((payload.exp || 0) * 1000)).toISOString(),
    };
  } catch {
    return null;
  }
}
