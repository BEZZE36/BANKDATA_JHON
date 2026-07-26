import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, logActivity } from '@/lib/auth';

// POST /api/auth/logout
export async function POST(request: NextRequest) {
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

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}
