import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown IP';

  await logActivity({
    logName: 'login',
    description: 'Login berhasil',
    causerId: user.id,
    properties: { ip },
  });

  return NextResponse.json({ success: true });
}
