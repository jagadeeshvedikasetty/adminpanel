'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  applyFestivalTheme,
  updateThemeEffect,
  uploadThemeBackground,
  removeThemeBackground,
  uploadHeroImage,
  removeHeroImage,
  updateThemeColors,
  uploadCustomEffect,
  updateHeroText,
  updateHeroAdjustments,
  applyCustomEffect,
  deleteCustomEffect,
  uploadCustomFloatingDecoration,
  deleteCustomFloatingDecoration
} from './themes/actions'
import { ICONS } from './themes/icons'

type Theme = {
  name?: string
  primary_color?: string
  secondary_color?: string
  active_effect?: string | null
  background_image_url?: string | null
  hero_image_url?: string | null
  mobile_hero_image_url?: string | null
  hero_title?: string
  hero_subtitle?: string
  hero_button_text?: string
  hero_button_link?: string
  hero_text_scale_desktop?: number
  hero_text_scale_mobile?: number
  hero_text_show_desktop?: boolean
  hero_text_show_mobile?: boolean
  hero_button_show_desktop?: boolean
  hero_button_show_mobile?: boolean
  hero_desktop_height?: number
  hero_mobile_height?: number
  hero_desktop_position?: string
  hero_mobile_position?: string
  custom_effect_url?: string | null
}
type Festival = {
  id: string; name: string; icon: string; description?: string
  themeColors: { primary: string; secondary: string }; suggestedEffect?: string | null
}

const EFFECTS = [
  { id: 'rain', icon: '🌧️', label: 'Rain' },
  { id: 'snow', icon: '❄️', label: 'Snow' },
  { id: 'confetti', icon: '🎉', label: 'Confetti' },
  { id: 'kites', icon: '🪁', label: 'Kites' },
  { id: 'sparkles', icon: '✨', label: 'Sparkles' },
  { id: 'none', icon: '🚫', label: 'None' },
]

const DECORATION_ICONS = ['kite', 'diya', 'mango', 'flower', 'sparkle']

function Divider() { return <div className="border-t border-[#2d2d44] my-1" /> }

function SectionHeader({ icon, label, open, onToggle }: { icon: string; label: string; open: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-1.5 rounded text-[11px] text-[#a0a0c0] hover:bg-[#2d2d44] hover:text-white transition-colors">
      <div className="flex items-center gap-2"><span>{icon}</span><span className="font-semibold">{label}</span></div>
      <span className="text-[9px] opacity-50">{open ? '▾' : '▸'}</span>
    </button>
  )
}

export default function SidebarNav({ activeTheme, festivals, customEffects = [], customFloatingDecorations = [] }: { activeTheme: Theme | null; festivals: Festival[]; customEffects?: any[]; customFloatingDecorations?: any[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const isTheme = pathname.startsWith('/themes')
  const [themeOpen, setThemeOpen] = useState(isTheme)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState(activeTheme?.primary_color || '#FF9933')
  const [secondaryColor, setSecondaryColor] = useState(activeTheme?.secondary_color || '#138808')
  const [heroDesktopHeight, setHeroDesktopHeight] = useState(activeTheme?.hero_desktop_height ?? 100)
  const [heroMobileHeight, setHeroMobileHeight] = useState(activeTheme?.hero_mobile_height ?? 60)
  const [heroDesktopPosition, setHeroDesktopPosition] = useState(activeTheme?.hero_desktop_position ?? 'center')
  const [heroMobilePosition, setHeroMobilePosition] = useState(activeTheme?.hero_mobile_position ?? 'center')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const handleSetViewMode = (mode: 'desktop' | 'mobile') => {
    setViewMode(mode)
    window.dispatchEvent(new CustomEvent('SET_VIEW_MODE', { detail: mode }))
  }

  const handleAddDecoration = (iconName: string) => {
    window.dispatchEvent(new CustomEvent('ADD_DECORATION', { detail: iconName }))
  }

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ADMIN_SECTION_CHANGED', { detail: openSection }))
  }, [openSection])

  useEffect(() => {
    const handleUnsaved = (e: any) => {
      setHasUnsaved(e.detail)
      if (!e.detail) setIsSaving(false)
    }
    window.addEventListener('UNSAVED_CHANGES', handleUnsaved)
    return () => window.removeEventListener('UNSAVED_CHANGES', handleUnsaved)
  }, [])

  useEffect(() => {
    if (activeTheme) {
      setPrimaryColor(activeTheme.primary_color || '#FF9933')
      setSecondaryColor(activeTheme.secondary_color || '#138808')
      setHeroDesktopHeight(activeTheme.hero_desktop_height ?? 100)
      setHeroMobileHeight(activeTheme.hero_mobile_height ?? 60)
      setHeroDesktopPosition(activeTheme.hero_desktop_position ?? 'center')
      setHeroMobilePosition(activeTheme.hero_mobile_position ?? 'center')
    }
  }, [activeTheme])

  const toggle = (k: string) => setOpenSection(p => p === k ? null : k)

  const navLink = (href: string, icon: string, label: string) => (
    <Link href={href} className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] transition-colors ${pathname === href ? 'bg-orange-500/20 text-orange-300' : 'text-[#a0a0c0] hover:bg-[#2d2d44] hover:text-white'}`}>
      <span>{icon}</span><span className="font-medium">{label}</span>
    </Link>
  )

  const handleSaveDecorations = () => {
    setIsSaving(true)
    window.dispatchEvent(new CustomEvent('REQUEST_SAVE_DECORATIONS'))
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col relative">
      
      {/* Sticky Save Button (only visible on Themes page when there are unsaved changes) */}
      {isTheme && hasUnsaved && (
        <div className="sticky top-0 z-50 p-2 bg-[#1e1e2e]/90 backdrop-blur border-b border-[#2d2d44]">
          <button
            onClick={handleSaveDecorations}
            disabled={isSaving}
            className={`w-full py-1.5 rounded text-[11px] font-bold transition-all shadow-md ${
              isSaving 
                ? 'bg-orange-500/50 text-white cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {isSaving ? 'Saving...' : '💾 Save Layout Changes'}
          </button>
        </div>
      )}

      <nav className="p-2 space-y-0.5">
      {navLink('/', '🏠', 'Dashboard')}
      {navLink('/products', '📦', 'Products')}
      {navLink('/orders', '📋', 'Orders')}

      <Divider />

      {/* Theme Settings toggle */}
      <button 
        onClick={() => {
          const willOpen = !themeOpen
          setThemeOpen(willOpen)
          if (willOpen && !isTheme) {
            router.push('/themes')
          }
        }} 
        className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-orange-400 font-bold hover:bg-[#2d2d44] rounded transition-colors"
      >
        <span>🎭 Theme Settings</span>
        <span className="text-[9px] opacity-60">{themeOpen ? '▾' : '▸'}</span>
      </button>

      {themeOpen && (
        <div className="space-y-0.5 ml-1">

          {/* ── 🎨 Colors ── */}
          <SectionHeader icon="🎨" label="Theme Colors" open={openSection === 'colors'} onToggle={() => toggle('colors')} />
          {openSection === 'colors' && (
            <div className="mx-1 mb-1 bg-[#16162a] rounded border border-[#2d2d44] overflow-hidden">
              {activeTheme?.name && (
                <div className="px-3 py-1.5 border-b border-[#2d2d44] flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activeTheme.primary_color }} />
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activeTheme.secondary_color }} />
                  <span className="text-[10px] text-[#a0a0c0] truncate">{activeTheme.name}</span>
                </div>
              )}
              {/* Festival list */}
              <div className="max-h-44 overflow-y-auto divide-y divide-[#2d2d44]">
                {festivals.map(f => {
                  const isActive = activeTheme?.name === f.name
                  return (
                    <div key={f.id} className="flex items-center justify-between px-3 py-1 gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="flex gap-0.5 shrink-0">
                          <div className="w-2 h-3.5 rounded-sm" style={{ backgroundColor: f.themeColors.primary }} />
                          <div className="w-2 h-3.5 rounded-sm" style={{ backgroundColor: f.themeColors.secondary }} />
                        </div>
                        <span className="text-[10px] text-[#c0c0d8] truncate">{f.name}</span>
                      </div>
                      <form onSubmit={async (e) => { e.preventDefault(); await applyFestivalTheme(f.name, f.themeColors.primary, f.themeColors.secondary, f.suggestedEffect || null); }}>
                        <button type="submit" disabled={isActive} className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 transition-colors ${isActive ? 'bg-orange-500/20 text-orange-400 cursor-default' : 'bg-[#2d2d44] text-[#a0a0c0] hover:bg-orange-500 hover:text-white'}`}>
                          {isActive ? '✓' : 'Apply'}
                        </button>
                      </form>
                    </div>
                  )
                })}
              </div>
              {/* Custom pickers */}
              <div className="border-t border-[#2d2d44] p-2 space-y-1.5">
                <p className="text-[9px] text-[#6c6c8a]">Custom Colors</p>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-none bg-transparent" title="Primary" />
                    <span className="text-[9px] text-[#6c6c8a]">Primary</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-none bg-transparent" title="Secondary" />
                    <span className="text-[9px] text-[#6c6c8a]">Secondary</span>
                  </label>
                </div>
                <form onSubmit={async (e) => { e.preventDefault(); await updateThemeColors(activeTheme?.name || 'Custom', primaryColor, secondaryColor); }}>
                  <button type="submit" className="w-full text-[9px] font-bold bg-orange-500 hover:bg-orange-600 text-white rounded py-1 transition-colors">
                    Apply Colors
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── ✨ Effects ── */}
          <SectionHeader icon="✨" label="Theme Effects" open={openSection === 'effects'} onToggle={() => toggle('effects')} />
          {openSection === 'effects' && (
            <div className="mx-1 mb-1 bg-[#16162a] rounded border border-[#2d2d44] p-2 space-y-2">
              <div className="grid grid-cols-3 gap-1">
                {EFFECTS.map(e => {
                  const isActive = (activeTheme?.active_effect === e.id) || (e.id === 'none' && !activeTheme?.active_effect)
                  return (
                    <form key={e.id} onSubmit={async (evt) => { evt.preventDefault(); await updateThemeEffect(e.id === 'none' ? null : e.id); }}>
                      <button type="submit" title={e.label} className={`w-full flex flex-col items-center gap-0.5 py-1.5 rounded text-[9px] transition-colors ${isActive ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40' : 'bg-[#2d2d44] text-[#a0a0c0] hover:bg-[#3d3d5c]'}`}>
                        <span className="text-sm leading-none">{e.icon}</span>
                        <span>{e.label}</span>
                      </button>
                    </form>
                  )
                })}
              </div>
              <form onSubmit={async (e) => { e.preventDefault(); await uploadCustomEffect(new FormData(e.currentTarget)); }} className="flex gap-1 items-center">
                <input type="file" name="file" accept=".json,.svg" className="flex-1 text-[9px] text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:bg-indigo-600 file:text-white cursor-pointer min-w-0" />
                <button type="submit" className="text-[9px] bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shrink-0">Upload</button>
              </form>

              {/* Custom Effects Grid */}
              {customEffects && customEffects.length > 0 && (
                <div className="pt-2 border-t border-[#2d2d44] space-y-2">
                  <span className="text-[10px] text-[#a0a0c0] font-semibold block">My Uploaded Effects</span>
                  <div className="grid grid-cols-3 gap-1">
                    {customEffects.map((ce: any) => {
                      const isActive = activeTheme?.custom_effect_url === ce.icon_url
                      return (
                        <div key={ce.id} className="relative group">
                          <form onSubmit={async (e) => { e.preventDefault(); await applyCustomEffect(ce.icon_url); }}>
                            <button type="submit" title={ce.name || 'Custom Effect'} className={`w-full flex flex-col items-center gap-0.5 py-1.5 rounded text-[9px] transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40' : 'bg-[#2d2d44] text-[#a0a0c0] hover:bg-[#3d3d5c]'}`}>
                              {ce.icon_url?.endsWith('.svg') ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={ce.icon_url} alt={ce.name} className="w-5 h-5 object-contain opacity-80" />
                              ) : (
                                <span className="text-sm leading-none">⚙️</span>
                              )}
                              <span className="truncate w-full text-center px-1">{ce.name || 'Effect'}</span>
                            </button>
                          </form>
                          {/* Delete Button */}
                          <div className="absolute -top-1 -right-1 hidden group-hover:block z-10">
                            <button type="button" onClick={async () => { await deleteCustomEffect(ce.id) }} className="bg-red-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-700 shadow-sm border border-red-800">
                              ✕
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {activeTheme?.active_effect && activeTheme.active_effect !== 'none' && (
                <div className="pt-1 border-t border-[#2d2d44]">
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('ADMIN_SECTION_CHANGED', { detail: 'effects-settings' }))
                    }} 
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-[10px] bg-[#2d2d44] text-orange-400 hover:bg-[#3d3d5c] transition-colors border border-orange-500/20 hover:border-orange-500/40"
                  >
                    <span className="text-sm leading-none">⚙️</span>
                    <span className="font-semibold">{activeTheme.active_effect} Settings</span>
                  </button>
                </div>
              )}
              
              {/* Floating Decorations */}
              <div className="pt-2 border-t border-[#2d2d44] space-y-2">
                <span className="text-[10px] text-[#a0a0c0] font-semibold block">Add Floating Decorations</span>
                <div className="grid grid-cols-5 gap-1">
                  {DECORATION_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => handleAddDecoration(icon)}
                      title={`Add ${icon}`}
                      className="aspect-square rounded bg-[#2d2d44] hover:bg-[#3d3d5c] text-white flex items-center justify-center transition-colors"
                    >
                      <span className="w-4 h-4">{ICONS[icon as keyof typeof ICONS]}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={async (e) => { e.preventDefault(); await uploadCustomFloatingDecoration(new FormData(e.currentTarget)); }} className="flex gap-1 items-center mt-2">
                  <input type="file" name="file" accept=".json,.svg,.png,.webp" className="flex-1 text-[9px] text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:bg-indigo-600 file:text-white cursor-pointer min-w-0" />
                  <button type="submit" className="text-[9px] bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shrink-0">Upload</button>
                </form>

                {customFloatingDecorations && customFloatingDecorations.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-[#2d2d44] space-y-2">
                    <span className="text-[10px] text-[#a0a0c0] font-semibold block">My Uploaded Decorations</span>
                    <div className="grid grid-cols-3 gap-1">
                      {customFloatingDecorations.map((cd: any) => (
                        <div key={cd.id} className="relative group">
                          <button 
                            onClick={() => handleAddDecoration(cd.icon_url)} 
                            title={cd.name || 'Custom Decoration'} 
                            className="w-full flex flex-col items-center gap-0.5 py-1.5 rounded text-[9px] bg-[#2d2d44] text-[#a0a0c0] hover:bg-[#3d3d5c] transition-colors"
                          >
                            {cd.icon_url?.endsWith('.json') ? (
                              <span className="text-sm leading-none">⚙️</span>
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={cd.icon_url} alt={cd.name} className="w-5 h-5 object-contain opacity-80" />
                            )}
                            <span className="truncate w-full text-center px-1">{cd.name || 'Decoration'}</span>
                          </button>
                          {/* Delete Button */}
                          <div className="absolute -top-1 -right-1 hidden group-hover:block z-10">
                            <button type="button" onClick={async () => { await deleteCustomFloatingDecoration(cd.id) }} className="bg-red-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-700 shadow-sm border border-red-800">
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 🖼️ Background ── */}
          <SectionHeader icon="🖼️" label="Background Image" open={openSection === 'bg'} onToggle={() => toggle('bg')} />
          {openSection === 'bg' && (
            <div className="mx-1 mb-1 bg-[#16162a] rounded border border-[#2d2d44] p-2 space-y-1.5">
              {activeTheme?.background_image_url ? (
                <div className="relative rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeTheme.background_image_url} alt="bg" className="w-full h-14 object-cover opacity-70" />
                  <form onSubmit={async (e) => { e.preventDefault(); await removeThemeBackground(); }} className="absolute top-1 right-1">
                    <button type="submit" className="bg-red-600/80 text-white text-[9px] px-1.5 py-0.5 rounded hover:bg-red-600">✕</button>
                  </form>
                </div>
              ) : (
                <div className="h-8 rounded border border-dashed border-[#3d3d5c] flex items-center justify-center">
                  <span className="text-[9px] text-[#6c6c8a]">No background set</span>
                </div>
              )}
              <form onSubmit={async (e) => { e.preventDefault(); await uploadThemeBackground(new FormData(e.currentTarget)); }} className="flex gap-1 items-center">
                <input type="file" name="file" accept="image/*" required className="flex-1 text-[9px] text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:bg-orange-500 file:text-white cursor-pointer min-w-0" />
                <button type="submit" className="text-[9px] bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition-colors shrink-0">Upload</button>
              </form>
            </div>
          )}
          {/* ── 📐 Hero Adjustments ── */}
          <SectionHeader icon="📐" label="Hero Adjustments" open={openSection === 'hero-adjust'} onToggle={() => toggle('hero-adjust')} />
          {openSection === 'hero-adjust' && (
            <div className="mx-1 mb-1 bg-[#16162a] rounded border border-[#2d2d44] p-2">
              <p className="text-[10px] text-[#a0a0c0] text-center leading-relaxed">
                Controls are now in the floating panel inside the live preview.
              </p>
            </div>
          )}

          {/* ── 🌄 Hero ── */}
          <SectionHeader icon="🎨" label="Theme Settings" open={themeOpen} onToggle={() => setThemeOpen(!themeOpen)} />
          {themeOpen && (
            <div className="bg-[#12121a] py-1 border-t border-[#2d2d44]">
              {/* Preview View Mode Toggle (Only visible when themes page is active) */}
              {isTheme && (
                <div className="mx-2 mb-2 flex bg-[#1e1e2e] p-0.5 rounded border border-[#2d2d44]">
                  <button 
                    onClick={() => handleSetViewMode('desktop')} 
                    className={`flex-1 px-3 py-1 text-[10px] rounded transition-colors ${viewMode === 'desktop' ? 'bg-[#2d2d44] text-white font-bold shadow-sm' : 'text-[#8080a0] hover:text-white font-medium'}`}
                  >
                    Desktop
                  </button>
                  <button 
                    onClick={() => handleSetViewMode('mobile')} 
                    className={`flex-1 px-3 py-1 text-[10px] rounded transition-colors ${viewMode === 'mobile' ? 'bg-[#2d2d44] text-white font-bold shadow-sm' : 'text-[#8080a0] hover:text-white font-medium'}`}
                  >
                    Mobile
                  </button>
                </div>
              )}
            </div>
          )}

          <SectionHeader icon="🌄" label="Hero Banner" open={openSection === 'hero'} onToggle={() => toggle('hero')} />
          {openSection === 'hero' && (
            <div className="mx-1 mb-1 bg-[#16162a] rounded border border-[#2d2d44] p-2 space-y-3">
              
              {/* Desktop Hero */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#a0a0c0] font-semibold uppercase tracking-wider block">Desktop Banner</span>
                {activeTheme?.hero_image_url ? (
                  <div className="relative rounded overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeTheme.hero_image_url} alt="hero" className="w-full h-14 object-cover opacity-70" />
                    <form onSubmit={async (e) => { e.preventDefault(); await removeHeroImage(false); }} className="absolute top-1 right-1">
                      <button type="submit" className="bg-red-600/80 text-white text-[9px] px-1.5 py-0.5 rounded hover:bg-red-600">✕</button>
                    </form>
                  </div>
                ) : (
                  <div className="h-8 rounded border border-dashed border-[#3d3d5c] flex items-center justify-center">
                    <span className="text-[9px] text-[#6c6c8a]">Using default desktop hero</span>
                  </div>
                )}
                <form onSubmit={async (e) => { e.preventDefault(); await uploadHeroImage(new FormData(e.currentTarget)); }} className="flex gap-1 items-center">
                  <input type="file" name="file" accept="image/*" required className="flex-1 text-[9px] text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:bg-indigo-600 file:text-white cursor-pointer min-w-0" />
                  <input type="hidden" name="isMobile" value="false" />
                  <button type="submit" className="text-[9px] bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shrink-0">Upload</button>
                </form>
              </div>

              {/* Mobile Hero */}
              <div className="space-y-1.5 pt-2 border-t border-[#2d2d44]">
                <span className="text-[10px] text-[#a0a0c0] font-semibold uppercase tracking-wider block">Mobile Banner</span>
                {activeTheme?.mobile_hero_image_url ? (
                  <div className="relative rounded overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeTheme.mobile_hero_image_url} alt="mobile hero" className="w-full h-20 object-cover opacity-70" />
                    <form onSubmit={async (e) => { e.preventDefault(); await removeHeroImage(true); }} className="absolute top-1 right-1">
                      <button type="submit" className="bg-red-600/80 text-white text-[9px] px-1.5 py-0.5 rounded hover:bg-red-600">✕</button>
                    </form>
                  </div>
                ) : (
                  <div className="h-8 rounded border border-dashed border-[#3d3d5c] flex items-center justify-center">
                    <span className="text-[9px] text-[#6c6c8a]">Falls back to desktop</span>
                  </div>
                )}
                <form onSubmit={async (e) => { e.preventDefault(); await uploadHeroImage(new FormData(e.currentTarget)); }} className="flex gap-1 items-center">
                  <input type="file" name="file" accept="image/*" required className="flex-1 text-[9px] text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:bg-indigo-600 file:text-white cursor-pointer min-w-0" />
                  <input type="hidden" name="isMobile" value="true" />
                  <button type="submit" className="text-[9px] bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shrink-0">Upload</button>
                </form>
              </div>

            </div>
          )}


        </div>
      )}
    </nav>
    </div>
  )
}
