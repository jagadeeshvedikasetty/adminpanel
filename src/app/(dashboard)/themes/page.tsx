import { getDecorations } from './(studio-standalone)/studio/actions'
import { getCustomEffects } from './actions'
import { createClient } from '@/utils/supabase/server'
import ThemesPreviewClient from './ThemesPreviewClient'

export default async function ThemesPage() {
  const supabase = await createClient()
  
  const [decorations, customEffects, { data: activeTheme }] = await Promise.all([
    getDecorations(),
    getCustomEffects(),
    supabase.from('themes').select('*').eq('id', 'active_theme').single()
  ])

  const version = Date.now().toString()
  return <ThemesPreviewClient initialDecorations={decorations} version={version} activeTheme={activeTheme} customEffects={customEffects} />
}
