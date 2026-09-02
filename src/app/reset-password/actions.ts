'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function requestReset(formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    redirect('/reset-password?error=Email is required')
  }

  const supabase = await createClient()
  
  // Get the origin to construct the callback URL dynamically
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const origin = `${protocol}://${host}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  })

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/reset-password?message=Check your email for the password reset link')
}
