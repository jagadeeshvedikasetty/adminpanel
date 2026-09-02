import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import festivalsData from '@/data/festivals.json'
import { getCustomEffects } from './themes/actions'
import SidebarNav from './SidebarNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch active theme and custom effects for sidebar controls
  const [{ data: activeTheme }, customEffects] = await Promise.all([
    supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle(),
    getCustomEffects()
  ])

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Dark VS Code-style Sidebar */}
      <aside className="w-[300px] min-w-[300px] bg-[#1e1e2e] flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#2d2d44] shrink-0">
          <h2 className="text-sm font-bold text-orange-400 tracking-wide">Janani Admin</h2>
          <p className="text-[10px] text-[#6c6c8a] mt-0.5 truncate">{user.email}</p>
        </div>

        {/* Nav with inline controls */}
        <SidebarNav activeTheme={activeTheme} festivals={festivalsData as any} customEffects={customEffects} />

        {/* Sign out */}
        <div className="px-3 py-2 border-t border-[#2d2d44] shrink-0">
          <form action={signOut}>
            <button className="w-full text-left px-3 py-1.5 text-[11px] text-red-400 hover:bg-red-900/20 rounded transition-colors">
              ⏻ Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content — no padding so /themes page can go edge-to-edge */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
