import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Root "/" → redirect ke dashboard atau login
export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
