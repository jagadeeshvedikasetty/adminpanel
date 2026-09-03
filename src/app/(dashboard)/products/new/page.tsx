import Link from 'next/link'
import EditProductForm from '../[id]/EditProductForm'

export default function NewProductPage() {
  const emptyProduct = {
    id: 'new',
    name: '',
    category: '',
    variants: [{ weight: '', price: 0 }],
    image_url: '',
    video_url: '',
    video_scale: 1.0
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 pt-16">
      <div className="flex items-center mb-6">
        <Link href="/products" className="text-gray-500 hover:text-gray-700 mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Create New Product</h1>
      </div>
      
      <EditProductForm product={emptyProduct} />
    </div>
  )
}
