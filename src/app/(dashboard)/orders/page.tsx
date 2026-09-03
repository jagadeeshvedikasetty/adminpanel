import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function OrdersPage() {
  const supabase = await createClient()

  // Try to fetch orders from Supabase
  const { data: orders, error: supabaseError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const sqlSetupInstruction = `
-- Run this in your Supabase SQL Editor to create the orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  total_amount numeric not null,
  status text default 'pending',
  items jsonb default '[]'::jsonb
);
alter table orders enable row level security;
create policy "Allow admins full access" on orders for all to authenticated using (true);
  `.trim()

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

      {supabaseError && supabaseError.code === '42P01' && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">Database Setup Required</h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>The `orders` table doesn't exist in your Supabase project yet. Please run this SQL in your Supabase dashboard to start tracking orders:</p>
                <pre className="mt-2 bg-orange-100 p-2 rounded-md overflow-x-auto text-xs font-mono">{sqlSetupInstruction}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {!supabaseError && orders && orders.length > 0 ? (
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.customer_phone || order.customer_email}</p>
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
                      await updateStatus(order.id, 'processing')
                    }}>
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">Process</button>
                    </form>
                    <form className="inline-block" action={async () => {
                      'use server'
                      await updateStatus(order.id, 'completed')
                    }}>
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">Complete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !supabaseError && (
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
