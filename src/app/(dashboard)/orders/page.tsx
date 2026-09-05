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
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'processing': return 'bg-blue-500/20 text-blue-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-yellow-500/20 text-yellow-400' // pending
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Orders Management</h1>

      {supabaseError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded text-red-400">
          Error loading orders: {supabaseError.message}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="bg-[#1e1e2e] rounded border border-[#2d2d44] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2d2d44] bg-[#16162a]">
                <th className="p-3 text-sm font-semibold text-[#a0a0c0]">Order Date</th>
                <th className="p-3 text-sm font-semibold text-[#a0a0c0]">Customer</th>
                <th className="p-3 text-sm font-semibold text-[#a0a0c0]">Total</th>
                <th className="p-3 text-sm font-semibold text-[#a0a0c0]">Status</th>
                <th className="p-3 text-sm font-semibold text-[#a0a0c0] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d44]">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-[#252538] transition-colors">
                  <td className="p-3 text-sm text-[#a0a0c0]">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-white">{order.customers?.name || 'Unknown'}</p>
                    <p className="text-xs text-[#a0a0c0]">{order.customers?.phone || order.customers?.email}</p>
                  </td>
                  <td className="p-3 font-medium text-white">
                    ₹{order.total_amount}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold capitalize ${getStatusColor(order.status)}`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <form className="inline-block" action={async () => {
                      'use server'
                      await updateStatus(order.id, 'Processing')
                    }}>
                      <button className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">
                        Process
                      </button>
                    </form>
                    <form className="inline-block" action={async () => {
                      'use server'
                      await updateStatus(order.id, 'Completed')
                    }}>
                      <button className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
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
        <div className="bg-[#1e1e2e] rounded border border-[#2d2d44] p-8 text-center">
          <p className="text-[#a0a0c0]">No orders found yet. When customers place orders, they will appear here.</p>
        </div>
      )}
    </div>
  )
}
