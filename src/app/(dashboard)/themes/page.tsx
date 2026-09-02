import { getDecorations } from './(studio-standalone)/studio/actions'
import { getCustomEffects } from './actions'
import { createClient } from '@/utils/supabase/server'
import ThemesPreviewClient from './ThemesPreviewClient'

export default async function ThemesPage() {
  const supabase = await createClient()
  
  const [decorations, customEffects, { data: activeTheme }] = await Promise.all([
    getDecorations(),
    getCustomEffects(),
    supabase.from('themes').select('*').eq('id', 'active_theme').maybeSingle()
  ])

  const version = Date.now().toString()
  const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000'
  return <ThemesPreviewClient initialDecorations={decorations} version={version} activeTheme={activeTheme} customEffects={customEffects} clientUrl={clientUrl} />
}
