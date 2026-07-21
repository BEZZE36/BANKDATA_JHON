import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgmfcxpjweljmyfvjupg.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
          return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
        }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
                  autoRefreshToken: false,
                  persistSession: false
                }
        });

    const { data, error } = await supabase.auth.admin.createUser({
          email: 'admin@sulteng.go.id',
          password: 'GantiSegera!2026',
          email_confirm: true,
          user_metadata: { role: 'admin' }
        });

    if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

    return NextResponse.json({ message: 'User created successfully', user: data.user });
  }
