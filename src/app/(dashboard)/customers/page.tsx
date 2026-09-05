"use client";

import { useEffect, useState } from 'react';

// Let's create it inline or fetch it.
// I will check admin's utils/supabase if it exists, or just import createClient
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseAdmin
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setCustomers(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading customers...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 pt-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customers</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  No customers found yet.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="p-4 text-sm text-gray-600">{c.email || '-'}</td>
                  <td className="p-4 text-sm text-gray-600">{c.phone || '-'}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
