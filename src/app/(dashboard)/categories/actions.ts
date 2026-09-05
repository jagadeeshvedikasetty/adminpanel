'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function renameCategory(oldName: string, newName: string) {
  if (!oldName || !newName || oldName === newName) return { success: false, error: 'Invalid names' }

  const supabase = await createClient()

  // Update all products that have the old category name to the new category name
  const { error } = await supabase
    .from('products')
    .update({ category: newName })
    .eq('category', oldName)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/categories')
  revalidatePath('/products')
  return { success: true }
}
