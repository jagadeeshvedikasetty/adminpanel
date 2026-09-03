'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { v2 as cloudinary } from 'cloudinary'

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
      { folder, resource_type: 'auto' }, // auto detects image vs video
      (error, result) => {
        if (error) reject(error)
        else resolve(result?.secure_url || null)
      }
    ).end(buffer)
  })
}

export async function updateProduct(productId: number, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  
  // Reconstruct variants array from dynamic form fields
  const variants: any[] = []
  let index = 0
  while (formData.has(`variant_weight_${index}`)) {
    const weight = formData.get(`variant_weight_${index}`) as string
    const price = Number(formData.get(`variant_price_${index}`))
    if (weight && !isNaN(price)) {
      variants.push({ weight, price })
    }
    index++
  }

  // Handle file uploads
  const imageFile = formData.get('imageFile') as File | null
  const videoFile = formData.get('videoFile') as File | null
  
  let imageUrl = undefined
  let videoUrl = undefined

  try {
    if (imageFile && imageFile.size > 0) {
      const url = await uploadToCloudinary(imageFile, 'janani-foods/images')
      if (url) imageUrl = url
    }
    
    if (videoFile && videoFile.size > 0) {
      const url = await uploadToCloudinary(videoFile, 'janani-foods/videos')
      if (url) videoUrl = url
    }
  } catch (e: any) {
    return { success: false, error: 'Failed to upload media to Cloudinary: ' + e.message }
  }

  const videoScale = formData.get('videoScale') ? parseFloat(formData.get('videoScale') as string) : 1.0

  // Prepare update payload
  const updateData: any = { name, category, variants, video_scale: videoScale }
  if (imageUrl) updateData.image_url = imageUrl
  if (videoUrl) updateData.video_url = videoUrl

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', productId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/products')
  redirect('/products')
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  
  const variants: any[] = []
  let index = 0
  while (formData.has(`variant_weight_${index}`)) {
    const weight = formData.get(`variant_weight_${index}`) as string
    const price = Number(formData.get(`variant_price_${index}`))
    if (weight && !isNaN(price)) {
      variants.push({ weight, price })
    }
    index++
  }

  const imageFile = formData.get('imageFile') as File | null
  const videoFile = formData.get('videoFile') as File | null
  
  let imageUrl = undefined
  let videoUrl = undefined

  try {
    if (imageFile && imageFile.size > 0) {
      const url = await uploadToCloudinary(imageFile, 'janani-foods/images')
      if (url) imageUrl = url
    }
    
    if (videoFile && videoFile.size > 0) {
      const url = await uploadToCloudinary(videoFile, 'janani-foods/videos')
      if (url) videoUrl = url
    }
  } catch (e: any) {
    return { success: false, error: 'Failed to upload media to Cloudinary: ' + e.message }
  }

  const videoScale = formData.get('videoScale') ? parseFloat(formData.get('videoScale') as string) : 1.0

  const insertData: any = { name, category, variants, video_scale: videoScale }
  if (imageUrl) insertData.image_url = imageUrl
  if (videoUrl) insertData.video_url = videoUrl

  const { error } = await supabase
    .from('products')
    .insert([insertData])

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/products')
  redirect('/products')
}
