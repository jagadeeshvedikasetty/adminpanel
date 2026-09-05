import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function OrdersPage() {
  const supabase = await createClient()

  // Fetch orders with customer details
  const { data: orders, error: supabaseError } = await supabase
    .from('orders')
    .select(`
      *,
      customers (
        name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  const updateStatus = async (orderId: string, newStatus: string) => {
    'use server'
    const supabase = await createClient()
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    revalidatePath('/orders')
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800' // pending
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 pt-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders Management</h1>

      {supabaseError ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 shadow-sm text-red-700">
          Error loading orders: {supabaseError.message}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Order Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{order.customers?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{order.customers?.phone || order.customers?.email}</p>
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    ₹{order.total_amount}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <form className="inline-block" action={async () => {
                      'use server'
                      await updateStatus(order.id, 'Processing')
                    }}>
                      <button className="text-xs px-2 py-1 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded">
                        Process
                      </button>
                    </form>
                    <form className="inline-block" action={async () => {
                      'use server'
                      await updateStatus(order.id, 'Completed')
                    }}>
                      <button className="text-xs px-2 py-1 border border-green-200 text-green-600 hover:bg-green-50 rounded">
                        Complete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No orders yet</h3>
          <p className="mt-1 text-sm text-gray-500">When customers place orders, they will appear here.</p>
        </div>
      )}
    </div>
  )
}
