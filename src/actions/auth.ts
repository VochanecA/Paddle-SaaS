'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function signOut() {
  const supabase = createClient(cookies());
  await supabase.auth.signOut();
  return redirect('/');
}
