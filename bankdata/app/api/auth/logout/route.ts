import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

// POST /api/auth/logout
export async function POST() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  if (user) {
    await logActivity({
      logName: 'login',
      description: 'Logout',
      causerId: user.id,
    });
  }

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/login', process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'));
}
