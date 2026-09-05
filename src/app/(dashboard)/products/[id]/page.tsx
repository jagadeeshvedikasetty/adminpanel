import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import EditProductForm from './EditProductForm'
import Link from 'next/link'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  // Fetch unique categories
  const { data: allProducts } = await supabase.from('products').select('category')
  const categories = Array.from(new Set((allProducts || []).map(p => p.category).filter(Boolean))).sort()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/products" className="text-gray-500 hover:text-gray-700 mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Product: {product.name}</h1>
      </div>
      
      <EditProductForm product={product} categories={categories} />
    </div>
  )
}
