
import { NextResponse, type NextRequest } from 'next/server';
import { createSession } from '@/lib/auth/session';
import { adminAuth } from '@/lib/firebase/admin-app';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Extract claims correctly from the decoded token
    const claims = {
      role: decodedToken.role || 'member',
      status: decodedToken.status || 'pending',
      memberId: decodedToken.memberId || null,
    };
    
    // Pass the extracted claims to createSession
    await createSession(decodedToken.uid, claims);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying token or creating session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
