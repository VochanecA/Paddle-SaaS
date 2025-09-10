'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = createClient(); // Remove cookies() argument
  await supabase.auth.signOut();
  return redirect('/');
}