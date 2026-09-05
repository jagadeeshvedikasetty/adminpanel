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
    return <div className="p-6 text-[#a0a0c0]">Loading customers...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Customers</h1>
      
      <div className="bg-[#1e1e2e] rounded border border-[#2d2d44] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2d2d44] bg-[#16162a]">
              <th className="p-3 text-sm font-semibold text-[#a0a0c0]">Name</th>
              <th className="p-3 text-sm font-semibold text-[#a0a0c0]">Email</th>
              <th className="p-3 text-sm font-semibold text-[#a0a0c0]">Phone</th>
              <th className="p-3 text-sm font-semibold text-[#a0a0c0]">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d2d44]">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-[#6c6c8a]">No customers found.</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#252538] transition-colors">
                  <td className="p-3 text-sm text-white font-medium">{c.name}</td>
                  <td className="p-3 text-sm text-[#a0a0c0]">{c.email || '-'}</td>
                  <td className="p-3 text-sm text-[#a0a0c0]">{c.phone || '-'}</td>
                  <td className="p-3 text-sm text-[#a0a0c0]">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
