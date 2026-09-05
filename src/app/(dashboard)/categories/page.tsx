import { createClient } from '@/utils/supabase/server'
import CategoryRow from './CategoryRow'

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch only categories to aggregate them
  const { data: products, error } = await supabase
    .from('products')
    .select('category')

  let categoryCounts: Record<string, number> = {}
  let grandTotal = 0

  if (products) {
    products.forEach(p => {
      const cat = p.category || '' // treat null/empty as ''
      if (!categoryCounts[cat]) {
        categoryCounts[cat] = 0
      }
      categoryCounts[cat]++
      grandTotal++
    })
  }

  // Convert to array and sort
  const categories = Object.entries(categoryCounts).sort((a, b) => {
    if (a[0] === '') return 1 // Put empty/uncategorized at the end
    if (b[0] === '') return -1
    return a[0].localeCompare(b[0])
  })

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 pt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Categories</h1>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-semibold border border-blue-200">
          Grand Total: {grandTotal} Products
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          Error loading categories: {error.message}
        </div>
      ) : categories.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Category Name</th>
                <th className="p-4 font-medium w-32">Total Products</th>
                <th className="p-4 font-medium text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map(([category, count]) => (
                <CategoryRow key={category} category={category} count={count} />
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="p-4 font-bold text-gray-900 text-right">Grand Total:</td>
                <td className="p-4 font-bold text-gray-900" colSpan={2}>{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">Categories will appear here once you add products.</p>
        </div>
      )}
    </div>
  )
}
