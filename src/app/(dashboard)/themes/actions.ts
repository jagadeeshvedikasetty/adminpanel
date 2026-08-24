'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

import { redirect } from 'next/navigation'

export async function activateTheme(themeId: string, themeName: string, primaryColor: string, secondaryColor: string) {
  const supabase = await createClient()

  // First, set all themes to inactive
  await supabase.from('themes').update({ is_active: false }).neq('id', 'placeholder_to_update_all');
  
  // Then upsert the selected theme as active
  const { error } = await supabase.from('themes').upsert({
    id: themeId,
    name: themeName,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    is_active: true
  }, { onConflict: 'id' })

  if (error) {
    return { success: false, error: error.message }
  }

  // Redirect to the Decoration Studio where they can finish setting up the theme
  redirect('/themes/studio')
}
