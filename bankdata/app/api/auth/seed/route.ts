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

    const usersToCreate = [
      { email: 'admin@sulteng.go.id', role: 'admin', name: 'Administrator' },
      { email: 'keuangan@sulteng.go.id', role: 'operator-keuangan', name: 'Bagian Keuangan' },
      { email: 'pegawai@sulteng.go.id', role: 'operator-kepegawaian', name: 'Bagian Kepegawaian' },
      { email: 'program@sulteng.go.id', role: 'operator-program', name: 'Bagian Program' },
      { email: 'aset@sulteng.go.id', role: 'operator-aset', name: 'Bagian Aset' },
    ];

    const results = [];
    
    for (const u of usersToCreate) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: 'GantiSegera!2026',
        email_confirm: true,
        user_metadata: { role: u.role, name: u.name, is_active: true }
      });
      
      results.push({
        email: u.email,
        status: error ? 'Failed' : 'Success',
        error: error?.message
      });
    }

    return NextResponse.json({ message: 'Proses pembuatan akun selesai', results });
  }
