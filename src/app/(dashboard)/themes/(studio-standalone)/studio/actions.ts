'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDecorations() {
  const supabase = await createAdminClient()
  const { data, error } = await supabase.from('floating_decorations').select('*')
  if (error) {
    console.error('Error fetching decorations:', error)
    return []
  }
  return data || []
}

export async function addDecoration(iconName: string) {
  const supabase = await createAdminClient()
  
  // Default to center of screen
  const newDeco = {
    icon_name: iconName,
    x_percent: 50,
    y_percent: 20,
    mobile_x_percent: 50,
    mobile_y_percent: 20,
    size: 1.0,
    is_active: true
  }

  const { error } = await supabase.from('floating_decorations').insert([newDeco])
  
  if (error) {
    console.error('Failed to insert decoration:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/themes/studio')
  return { success: true }
}

export async function updateDecorationPosition(id: number, x_percent: number, y_percent: number) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('floating_decorations')
    .update({ x_percent, y_percent })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function updateDecorationSize(id: number, size: number) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('floating_decorations')
    .update({ size })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function deleteDecoration(id: number) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('floating_decorations').delete().eq('id', id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/themes/studio')
  return { success: true }
}

export async function saveAllDecorations(decorations: any[]) {
  const supabase = await createAdminClient()
  
  // 1. Delete all existing
  await supabase.from('floating_decorations').delete().neq('id', -1)
  
  // 2. Insert all new (stripping out frontend IDs)
  const newDecos = decorations.map(d => ({
    icon_name: d.icon_name,
    hotspot_id: d.hotspot_id || null,
    x_percent: d.x_percent,
    y_percent: d.y_percent,
    mobile_x_percent: d.mobile_x_percent !== undefined ? d.mobile_x_percent : d.x_percent,
    mobile_y_percent: d.mobile_y_percent !== undefined ? d.mobile_y_percent : d.y_percent,
    size: d.size,
    is_active: d.is_active,
    show_on_desktop: d.show_on_desktop !== false,
    show_on_mobile: d.show_on_mobile !== false
  }))
  
  if (newDecos.length > 0) {
    const { error } = await supabase.from('floating_decorations').insert(newDecos)
    if (error) return { success: false, error: error.message }
  }
  
  revalidatePath('/themes/studio')
  return { success: true }
}
