import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ProductsPage() {
  const supabase = await createClient()

  // Fetch products from Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 pt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
        <Link href="/products/new" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors shadow-sm">
          + Add New Product
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          <h3 className="font-semibold mb-1">Error fetching products</h3>
          <p className="text-sm">Please ensure you have created a `products` table in your Supabase project.</p>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded">{error.message}</pre>
        </div>
      ) : products && products.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Variants (Weight/Price)</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{product.name}</td>
                  <td className="p-4 text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {product.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {/* Assuming variants are stored as JSONB */}
                    {product.variants && Array.isArray(product.variants) ? (
                      <div className="space-y-1">
                        {product.variants.map((v: any, i: number) => (
                          <div key={i}>{v.weight} - ₹{v.price}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No variants</span>
                    )}
                  </td>
                  <td className="p-4 text-right flex justify-end items-center h-full">
                    <Link href={`/products/${product.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3 text-sm font-medium">Edit</Link>
                    <button className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No products</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
        </div>
      )}
    </div>
  )
}
