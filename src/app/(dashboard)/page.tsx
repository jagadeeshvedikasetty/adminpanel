import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function DashboardHome() {
  const supabase = await createClient()

  // Fetch quick stats
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: pendingOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { data: activeThemes } = await supabase
    .from('themes')
    .select('name')
    .eq('is_active', true)
    .limit(1)

  const activeThemeName = activeThemes?.[0]?.name || 'None'

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 pt-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{ordersCount || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Orders</h3>
          <p className="text-3xl font-bold text-orange-600">{pendingOrdersCount || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900">{productsCount || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Theme</h3>
          <p className="text-xl font-bold text-indigo-600 truncate">{activeThemeName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/products" className="block w-full text-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
              Manage Products
            </Link>
            <Link href="/orders" className="block w-full text-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
              View Pending Orders
            </Link>
            <Link href="/themes" className="block w-full text-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
              Change Website Theme
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome to your new Dashboard!</h3>
          <p className="text-gray-500 text-sm">
            Everything is securely connected to your Supabase project. You can now manage your entire business from one place.
          </p>
        </div>
      </div>
    </div>
  )
}
