import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-orange-600">Janani Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md">
            Dashboard
          </Link>
          <Link href="/products" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md">
            Products
          </Link>
          <Link href="/themes" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md">
            Themes
          </Link>
          <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-md">
            Orders
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4 truncate">{user.email}</p>
          <form action={signOut}>
            <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm md:hidden p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-orange-600">Janani Admin</h2>
          <form action={signOut}>
            <button className="text-sm text-red-600 font-medium">Sign Out</button>
          </form>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
