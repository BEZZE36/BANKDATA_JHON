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

  // Kembalikan 200 OK — navigasi ke /login ditangani client-side oleh LogoutButton
  return NextResponse.json({ success: true });
}
