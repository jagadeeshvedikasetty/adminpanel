'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { v2 as cloudinary } from 'cloudinary'

import { redirect } from 'next/navigation'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function uploadToCloudinary(file: File, folder: string): Promise<string | null> {
  if (!file || file.size === 0) return null
  
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' }, 
      (error, result) => {
        if (error) reject(error)
        else resolve(result?.secure_url || null)
      }
    ).end(buffer)
  })
}

export async function uploadThemeBackground(formData: FormData) {
  const file = formData.get('file') as File;
  const isMobile = formData.get('isMobile') === 'true';
  if (!file || file.size === 0) {
    throw new Error('No file uploaded')
  }

  const supabase = await createClient()
  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()

  const imageUrl = await uploadToCloudinary(file, 'janani-foods/themes')
  if (!imageUrl) {
    throw new Error('Failed to upload image')
  }

  const updateData: any = {
    id: 'active_theme',
    name: existing?.name || 'Custom Theme',
    is_active: true
  }

  if (isMobile) {
    updateData.mobile_background_image_url = imageUrl
  } else {
    updateData.background_image_url = imageUrl
  }

  const { error } = await supabase.from('themes').upsert(updateData, { onConflict: 'id' })

  if (error) throw new Error(error.message)
  revalidatePath('/themes', 'layout')
}

export async function removeThemeBackground(isMobile: boolean = false) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()

  const updateData: any = {
    id: 'active_theme',
    name: existing?.name || 'Custom Theme',
    is_active: true
  }

  if (isMobile) {
    updateData.mobile_background_image_url = null
  } else {
    updateData.background_image_url = null
  }

  const { error } = await supabase.from('themes').upsert(updateData, { onConflict: 'id' })

  if (error) throw new Error(error.message)
  revalidatePath('/themes', 'layout')
}

export async function updateThemeColors(themeName: string, primaryColor: string, secondaryColor: string) {
  const supabase = await createClient()

  // Ensure there is a base active theme, we use a single row for the active configuration
  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()

  const { error } = await supabase.from('themes').upsert({
    id: 'active_theme',
    name: themeName,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    active_effect: existing?.active_effect || null,
    custom_effect_url: existing?.custom_effect_url || null,
    is_active: true
  }, { onConflict: 'id' })

  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/themes', 'layout')
}

// Apply festival theme: sets colors AND the suggested effect together in one click
export async function applyFestivalTheme(
  themeName: string,
  primaryColor: string,
  secondaryColor: string,
  suggestedEffect: string | null
) {
  const supabase = await createClient()

  const { error } = await supabase.from('themes').upsert({
    id: 'active_theme',
    name: themeName,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    active_effect: suggestedEffect,
    custom_effect_url: null,
    is_active: true
  }, { onConflict: 'id' })

  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/themes', 'layout')
}



export async function updateThemeEffect(effect: string | null) {
  const supabase = await createClient()

  // Ensure there is a base active theme
  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()

  const { error } = await supabase.from('themes').upsert({
    id: 'active_theme',
    name: existing?.name || 'Custom Theme',
    primary_color: existing?.primary_color || '#770634',
    secondary_color: existing?.secondary_color || '#000000',
    active_effect: effect,
    custom_effect_url: null, // Clear custom effect if a built-in one is chosen
    is_active: true
  }, { onConflict: 'id' })

  if (error) {
    throw new Error(error.message)
  }
  revalidatePath('/themes', 'layout')
}

export async function applyCustomEffect(url: string) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()
  const { error } = await supabase.from('themes').upsert({
    id: 'active_theme',
    name: existing?.name || 'Custom Theme',
    primary_color: existing?.primary_color || '#770634',
    secondary_color: existing?.secondary_color || '#000000',
    active_effect: null,
    custom_effect_url: url,
    is_active: true
  }, { onConflict: 'id' })

  if (error) throw new Error(error.message)
  revalidatePath('/themes', 'layout')
}

export async function uploadCustomEffect(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file || file.size === 0) {
    throw new Error('No file uploaded')
  }

  const supabase = await createClient()

  // Use service role key to bypass storage RLS policies since we don't have them set up
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  const fileExt = file.name.split('.').pop()
  const fileName = `custom-${Date.now()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await adminSupabase.storage
    .from('effects')
    .upload(fileName, file)

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: publicUrlData } = adminSupabase.storage
    .from('effects')
    .getPublicUrl(uploadData.path)

  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()

  const { error: dbError } = await supabase.from('themes').upsert({
    id: 'active_theme',
    name: existing?.name || 'Custom Theme',
    primary_color: existing?.primary_color || '#770634',
    secondary_color: existing?.secondary_color || '#000000',
    active_effect: null, // clear CSS effect
    custom_effect_url: publicUrlData.publicUrl,
    is_active: true
  }, { onConflict: 'id' })

  if (dbError) {
    throw new Error(dbError.message)
  }

  revalidatePath('/themes', 'layout')
}

export async function updateEffectSettings(formData: FormData) {
  const opacity = parseFloat(formData.get('opacity') as string)
  const scale = parseFloat(formData.get('scale') as string)
  const speed = parseFloat(formData.get('speed') as string)
  const density = parseFloat(formData.get('density') as string)
  const duration = parseInt(formData.get('duration') as string, 10)

  const supabase = await createClient()

  const { error } = await supabase.from('themes').update({
    effect_opacity: isNaN(opacity) ? 0.7 : opacity,
    effect_scale: isNaN(scale) ? 1.0 : scale,
    effect_speed: isNaN(speed) ? 1.0 : speed,
    effect_density: isNaN(density) ? 1.0 : density,
    effect_duration: isNaN(duration) ? 0 : duration,
  }).eq('id', 'active_theme')

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/themes', 'layout')
}

export async function getCustomEffects() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('custom_effects').select('*').order('created_at', { ascending: true })
  if (error) {
    console.error('Error fetching custom effects:', JSON.stringify(error, null, 2))
    return []
  }
  return data || []
}

export async function createCustomEffect(formData: FormData) {
  const name = formData.get('name') as string
  const animationType = formData.get('animation_type') as string
  const file = formData.get('file') as File

  if (!name || !animationType || !file || file.size === 0) {
    return { success: false, error: 'Missing required fields' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  const fileExt = file.name.split('.').pop()
  const fileName = `custom-effect-${Date.now()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await adminSupabase.storage
    .from('effects')
    .upload(fileName, file)

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  const { data: publicUrlData } = adminSupabase.storage
    .from('effects')
    .getPublicUrl(uploadData.path)

  const { error: insertError } = await adminSupabase.from('custom_effects').insert({
    name,
    animation_type: animationType,
    icon_url: publicUrlData.publicUrl
  })

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath('/themes', 'layout')
  return { success: true }
}

export async function deleteCustomEffect(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  // 1. Get the effect to find its URL
  const { data: effect } = await adminSupabase.from('custom_effects').select('icon_url').eq('id', id).single()

  if (effect?.icon_url) {
    // Extract file name from public URL (e.g. .../effects/custom-effect-123.svg)
    const urlParts = effect.icon_url.split('/')
    const fileName = urlParts[urlParts.length - 1]

    if (fileName) {
      // 2. Delete from storage bucket
      await adminSupabase.storage.from('effects').remove([fileName])
    }
  }

  // 3. Delete from database
  const { error } = await adminSupabase.from('custom_effects').delete().eq('id', id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/themes', 'layout')
  return { success: true }
}

export async function getCustomFloatingDecorations() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('custom_floating_decorations').select('*').order('created_at', { ascending: true })
  if (error) {
    console.error('Error fetching custom floating decorations:', JSON.stringify(error, null, 2))
    return []
  }
  return data || []
}

export async function uploadCustomFloatingDecoration(formData: FormData) {
  const file = formData.get('file') as File
  if (!file || file.size === 0) {
    return { success: false, error: 'Missing file' }
  }

  const name = file.name

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  const fileExt = file.name.split('.').pop()
  const fileName = `floating-${Date.now()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await adminSupabase.storage
    .from('floating_decorations')
    .upload(fileName, file)

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  const { data: publicUrlData } = adminSupabase.storage
    .from('floating_decorations')
    .getPublicUrl(fileName)

  const { error: dbError } = await adminSupabase.from('custom_floating_decorations').insert({
    name,
    icon_url: publicUrlData.publicUrl
  })

  if (dbError) {
    return { success: false, error: dbError.message }
  }

  revalidatePath('/themes', 'layout')
  return { success: true }
}

export async function deleteCustomFloatingDecoration(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  const { error } = await adminSupabase.from('custom_floating_decorations').delete().eq('id', id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/themes', 'layout')
  return { success: true }
}

export async function uploadHeroImage(formData: FormData) {
  const file = formData.get('file') as File
  const isMobile = formData.get('isMobile') === 'true'
  if (!file || file.size === 0) throw new Error('No file uploaded')

  const supabase = await createClient()
  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()

  const imageUrl = await uploadToCloudinary(file, 'janani-foods/hero')
  if (!imageUrl) throw new Error('Failed to upload image')

  const updateData: any = {
    id: 'active_theme',
    name: existing?.name || 'Custom Theme',
    is_active: true
  }

  if (isMobile) {
    updateData.mobile_hero_image_url = imageUrl
  } else {
    updateData.hero_image_url = imageUrl
  }

  const { error } = await supabase.from('themes').upsert(updateData, { onConflict: 'id' })

  if (error) throw new Error(error.message)
  revalidatePath('/themes', 'layout')
}

export async function removeHeroImage(isMobile: boolean = false) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()

  const updateData: any = {
    id: 'active_theme',
    name: existing?.name || 'Custom Theme',
    is_active: true
  }
  
  if (isMobile) {
    updateData.mobile_hero_image_url = null
  } else {
    updateData.hero_image_url = null
  }

  const { error } = await supabase.from('themes').upsert(updateData, { onConflict: 'id' })

  if (error) throw new Error(error.message)
  revalidatePath('/themes', 'layout')
}

export async function updateHeroText(formData: FormData) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()

  const { error } = await supabase.from('themes').upsert({
    id: 'active_theme',
    name: existing?.name || 'Custom Theme',
    hero_title: formData.get('title') || '',
    hero_subtitle: formData.get('subtitle') || '',
    hero_button_text: formData.get('buttonText') || '',
    hero_button_link: formData.get('buttonLink') || '',
    hero_text_scale_desktop: Number(formData.get('desktopScale')) || 1.0,
    hero_text_scale_mobile: Number(formData.get('mobileScale')) || 1.0,
    hero_text_show_desktop: formData.get('showTextDesktop') === 'true',
    hero_text_show_mobile: formData.get('showTextMobile') === 'true',
    hero_button_show_desktop: formData.get('showButtonDesktop') === 'true',
    hero_button_show_mobile: formData.get('showButtonMobile') === 'true',
    is_active: true
  }, { onConflict: 'id' })

  if (error) throw new Error(error.message)
  revalidatePath('/themes', 'layout')
}

export async function updateHeroTextCoordinates(xDesktop: number, yDesktop: number, xMobile: number, yMobile: number) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()

  const { error } = await supabase.from('themes').upsert({
    id: 'active_theme',
    name: existing?.name || 'Custom Theme',
    hero_text_x_desktop: xDesktop,
    hero_text_y_desktop: yDesktop,
    hero_text_x_mobile: xMobile,
    hero_text_y_mobile: yMobile,
    is_active: true
  }, { onConflict: 'id' })

  if (error) throw new Error(error.message)
  revalidatePath('/themes', 'layout')
}

export async function updateHeroAdjustments(formData: FormData) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()

  const { error } = await supabase.from('themes').upsert({
    id: 'active_theme',
    name: existing?.name || 'Custom Theme',
    hero_desktop_height: Number(formData.get('heroDesktopHeight')) || 100,
    hero_mobile_height: Number(formData.get('heroMobileHeight')) || 60,
    hero_desktop_position: formData.get('heroDesktopPosition') || 'center',
    hero_mobile_position: formData.get('heroMobilePosition') || 'center',
    hero_desktop_zoom: Number(formData.get('heroDesktopZoom')) || 1.0,
    hero_mobile_zoom: Number(formData.get('heroMobileZoom')) || 1.0,
    is_active: true
  }, { onConflict: 'id' })

  if (error) throw new Error(error.message)
  revalidatePath('/themes', 'layout')
}
