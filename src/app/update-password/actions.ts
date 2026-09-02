'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  if (!password || !confirmPassword) {
    redirect('/update-password?error=Both fields are required')
  }

  if (password !== confirmPassword) {
    redirect('/update-password?error=Passwords do not match')
  }

  const supabase = await createClient()

  // Verify the user is authenticated (they should be, from the exchangeCodeForSession in the callback)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?error=Session expired. Please request a new reset link.')
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect(`/update-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Password updated successfully. You can now log in.')
}
