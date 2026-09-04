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
  createCustomEffect,
  uploadCustomFloatingDecoration,
  deleteCustomFloatingDecoration
} from './themes/actions'
import { ICONS } from './themes/icons'

type Theme = {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  active_effect: string | null;
  background_image_url?: string | null;
  mobile_background_image_url?: string | null;
  hero_image_url?: string | null;
  mobile_hero_image_url?: string | null;
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
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-1.5 rounded text-sm text-[#a0a0c0] hover:bg-[#2d2d44] hover:text-white transition-colors">
      <div className="flex items-center gap-2"><span>{icon}</span><span className="font-semibold">{label}</span></div>
      <span className="text-sm opacity-50">{open ? '▾' : '▸'}</span>
    </button>
  )
}

export default function SidebarNav({ activeTheme, festivals, customEffects = [], customFloatingDecorations = [] }: { activeTheme: Theme | null; festivals: Festival[]; customEffects?: any[]; customFloatingDecorations?: any[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const isTheme = pathname.startsWith('/themes')
  const [themeOpen, setThemeOpen] = useState(isTheme)
  const [openSection, setOpenSection] = useState<string | null>(null)
  
  // Track active decorations purely via preview iframe state syncing
  const [activeDecorations, setActiveDecorations] = useState<any[]>([])
  const [primaryColor, setPrimaryColor] = useState(activeTheme?.primary_color || '#FF9933')
  const [secondaryColor, setSecondaryColor] = useState(activeTheme?.secondary_color || '#138808')
  const [heroDesktopHeight, setHeroDesktopHeight] = useState(activeTheme?.hero_desktop_height ?? 100)
  const [heroMobileHeight, setHeroMobileHeight] = useState(activeTheme?.hero_mobile_height ?? 60)
  const [heroDesktopPosition, setHeroDesktopPosition] = useState(activeTheme?.hero_desktop_position ?? 'center')
  const [heroMobilePosition, setHeroMobilePosition] = useState(activeTheme?.hero_mobile_position ?? 'center')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState('')
  const handleSetViewMode = (mode: 'desktop' | 'mobile') => {
    setViewMode(mode)
    window.dispatchEvent(new CustomEvent('SET_VIEW_MODE', { detail: mode }))
  }

  const handleAddDecoration = (iconName: string) => {
    window.dispatchEvent(new CustomEvent('ADD_DECORATION', { detail: iconName }))
  }

  useEffect(() => {
    const handleSetViewModeEvent = (e: any) => {
      setViewMode(e.detail)
    }
    const handleDecorationsSync = (e: any) => {
      setActiveDecorations(e.detail || [])
    }
    
    window.addEventListener('SET_VIEW_MODE', handleSetViewModeEvent)
    window.addEventListener('SYNC_DECORATIONS', handleDecorationsSync)
    
    // Auto-detect mobile screen on load
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      handleSetViewMode('mobile')
    }
    return () => {
      window.removeEventListener('SET_VIEW_MODE', handleSetViewModeEvent)
      window.removeEventListener('SYNC_DECORATIONS', handleDecorationsSync)
    }
  }, [])

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
    <Link href={href} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${pathname === href ? 'bg-orange-500/20 text-orange-300' : 'text-[#a0a0c0] hover:bg-[#2d2d44] hover:text-white'}`}>
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
            className={`w-full py-1.5 rounded text-sm font-bold transition-all shadow-md ${
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
        className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-orange-400 font-bold hover:bg-[#2d2d44] rounded transition-colors"
      >
        <span>🎭 Theme Settings</span>
        <span className="text-sm opacity-60">{themeOpen ? '▾' : '▸'}</span>
      </button>

      {themeOpen && (
        <div className="space-y-0.5 ml-1">

          {/* Global View Mode Toggle for Admin Editing */}
          <div className="hidden md:flex mx-1 mt-1 mb-2 bg-[#1e1e2e] p-1 rounded gap-1 border border-[#2d2d44]">
            <button onClick={() => handleSetViewMode('desktop')} className={`flex-1 py-1.5 text-xs font-bold rounded ${viewMode === 'desktop' ? 'bg-[#3d3d5c] text-white shadow' : 'text-[#8080a0] hover:text-white transition-colors'}`}>💻 Desktop Edit</button>
            <button onClick={() => handleSetViewMode('mobile')} className={`flex-1 py-1.5 text-xs font-bold rounded ${viewMode === 'mobile' ? 'bg-[#3d3d5c] text-white shadow' : 'text-[#8080a0] hover:text-white transition-colors'}`}>📱 Mobile Edit</button>
          </div>

          {/* ── 🎨 Colors ── */}
          <SectionHeader icon="🎨" label="Theme Colors" open={openSection === 'colors'} onToggle={() => toggle('colors')} />
          {openSection === 'colors' && (
            <div className="mx-1 mb-1 bg-[#16162a] rounded border border-[#2d2d44] overflow-hidden">
              {activeTheme?.name && (
                <div className="px-3 py-1.5 border-b border-[#2d2d44] flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activeTheme.primary_color }} />
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activeTheme.secondary_color }} />
                  <span className="text-xs text-[#a0a0c0] truncate">{activeTheme.name}</span>
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
                        <span className="text-xs text-[#c0c0d8] truncate">{f.name}</span>
                      </div>
                      <form onSubmit={async (e) => { e.preventDefault(); await applyFestivalTheme(f.name, f.themeColors.primary, f.themeColors.secondary, f.suggestedEffect || null); }}>
                        <button type="submit" disabled={isActive} className={`text-sm font-bold px-1.5 py-0.5 rounded shrink-0 transition-colors ${isActive ? 'bg-orange-500/20 text-orange-400 cursor-default' : 'bg-[#2d2d44] text-[#a0a0c0] hover:bg-orange-500 hover:text-white'}`}>
                          {isActive ? '✓' : 'Apply'}
                        </button>
                      </form>
                    </div>
                  )
                })}
              </div>
              {/* Custom pickers */}
              <div className="border-t border-[#2d2d44] p-2 space-y-1.5">
                <p className="text-sm text-[#6c6c8a]">Custom Colors</p>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-none bg-transparent" title="Primary" />
                    <span className="text-sm text-[#6c6c8a]">Primary</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-none bg-transparent" title="Secondary" />
                    <span className="text-sm text-[#6c6c8a]">Secondary</span>
                  </label>
                </div>
                <form onSubmit={async (e) => { e.preventDefault(); await updateThemeColors(activeTheme?.name || 'Custom', primaryColor, secondaryColor); }}>
                  <button type="submit" className="w-full text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white rounded py-1 transition-colors">
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
                      <button type="submit" title={e.label} className={`w-full flex flex-col items-center gap-0.5 py-1.5 rounded text-sm transition-colors ${isActive ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40' : 'bg-[#2d2d44] text-[#a0a0c0] hover:bg-[#3d3d5c]'}`}>
                        <span className="text-sm leading-none">{e.icon}</span>
                        <span>{e.label}</span>
                      </button>
                    </form>
                  )
                })}
              </div>
              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.currentTarget);
                const file = formData.get('file') as File;
                if (!formData.get('name')) {
                  formData.set('name', file.name.split('.')[0]); // Default name to filename
                }
                const res = await createCustomEffect(formData); 
                if (res?.error) alert(res.error);
                else e.currentTarget.reset();
              }} className="flex flex-col gap-1 mt-2 p-2 bg-[#1e1e2e] rounded border border-[#2d2d44]">
                <span className="text-xs text-[#a0a0c0] font-semibold">Upload New Effect</span>
                <select name="animation_type" className="w-full bg-[#16162a] text-white/90 border border-[#2d2d44] rounded px-1.5 py-1 text-sm focus:outline-none focus:border-indigo-500">
                  <option value="falling">Fall straight down (like Rain)</option>
                  <option value="floating">Drift & Sway (like Snow)</option>
                  <option value="flying">Fly upwards (like Kites)</option>
                  <option value="fullscreen">Full-screen Background</option>
                </select>
                <div className="flex gap-1 items-center">
                  <input type="file" name="file" accept=".json,.svg,.png" required className="flex-1 text-sm text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-sm file:bg-indigo-600 file:text-white cursor-pointer min-w-0" />
                  <button type="submit" className="text-sm bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shrink-0">Upload</button>
                </div>
              </form>

              {/* Custom Effects Grid */}
              {customEffects && customEffects.length > 0 && (
                <div className="pt-2 border-t border-[#2d2d44] space-y-2">
                  <span className="text-xs text-[#a0a0c0] font-semibold block">My Uploaded Effects</span>
                  <div className="grid grid-cols-3 gap-1">
                    {customEffects.map((ce: any) => {
                      const isActive = ce.animation_type === 'fullscreen' 
                        ? activeTheme?.custom_effect_url === ce.icon_url
                        : activeTheme?.active_effect === ce.id;
                      return (
                        <div key={ce.id} className="relative group">
                          <form onSubmit={async (e) => { 
                            e.preventDefault(); 
                            if (ce.animation_type === 'fullscreen') {
                              await applyCustomEffect(ce.icon_url);
                            } else {
                              await updateThemeEffect(ce.id);
                            }
                          }}>
                            <button type="submit" title={ce.name || 'Custom Effect'} className={`w-full flex flex-col items-center gap-0.5 py-1.5 rounded text-sm transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40' : 'bg-[#2d2d44] text-[#a0a0c0] hover:bg-[#3d3d5c]'}`}>
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
                            <button type="button" onClick={async () => { await deleteCustomEffect(ce.id) }} className="bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-700 shadow-sm border border-red-800">
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
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs bg-[#2d2d44] text-orange-400 hover:bg-[#3d3d5c] transition-colors border border-orange-500/20 hover:border-orange-500/40"
                  >
                    <span className="text-sm leading-none">⚙️</span>
                    <span className="font-semibold">{activeTheme.active_effect} Settings</span>
                  </button>
                </div>
              )}
              

            </div>
          )}

          {/* ── 🖼️ Background ── */}
          <SectionHeader icon="🖼️" label="Background Image" open={openSection === 'bg'} onToggle={() => toggle('bg')} />
          {openSection === 'bg' && (
            <div className="mx-1 mb-1 bg-[#16162a] rounded border border-[#2d2d44] p-2 space-y-1.5">
              {viewMode === 'desktop' ? (
                <div className="space-y-1.5">
                  <span className="text-xs text-[#a0a0c0] font-semibold uppercase tracking-wider block">Desktop Background</span>
                  {activeTheme?.background_image_url ? (
                    <div className="relative rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={activeTheme.background_image_url} alt="bg" className="w-full h-14 object-cover opacity-70" />
                      <form onSubmit={async (e) => { e.preventDefault(); await removeThemeBackground(false); }} className="absolute top-1 right-1">
                        <button type="submit" className="bg-red-600/80 text-white text-sm px-1.5 py-0.5 rounded hover:bg-red-600">✕</button>
                      </form>
                    </div>
                  ) : (
                    <div className="h-8 rounded border border-dashed border-[#3d3d5c] flex items-center justify-center">
                      <span className="text-sm text-[#6c6c8a]">No desktop background</span>
                    </div>
                  )}
                  <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('isMobile', 'false'); await uploadThemeBackground(fd); }} className="flex flex-col gap-1 mt-1">
                    <div className="flex gap-1 items-center">
                      <input type="file" name="file" accept="image/*" required className="flex-1 text-sm text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-sm file:bg-orange-500 file:text-white cursor-pointer min-w-0" />
                      <button type="submit" className="text-sm bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition-colors shrink-0">Upload</button>
                    </div>
                    <p className="text-[10px] text-[#8080a0] px-1">Recommended: 1920x1080 (16:9 widescreen)</p>
                  </form>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-xs text-[#a0a0c0] font-semibold uppercase tracking-wider block">Mobile Background</span>
                  {activeTheme?.mobile_background_image_url ? (
                    <div className="relative rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={activeTheme.mobile_background_image_url} alt="bg" className="w-full h-14 object-cover opacity-70" />
                      <form onSubmit={async (e) => { e.preventDefault(); await removeThemeBackground(true); }} className="absolute top-1 right-1">
                        <button type="submit" className="bg-red-600/80 text-white text-sm px-1.5 py-0.5 rounded hover:bg-red-600">✕</button>
                      </form>
                    </div>
                  ) : (
                    <div className="h-8 rounded border border-dashed border-[#3d3d5c] flex items-center justify-center">
                      <span className="text-sm text-[#6c6c8a]">No mobile background</span>
                    </div>
                  )}
                  <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set('isMobile', 'true'); await uploadThemeBackground(fd); }} className="flex flex-col gap-1 mt-1">
                    <div className="flex gap-1 items-center">
                      <input type="file" name="file" accept="image/*" required className="flex-1 text-sm text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-sm file:bg-orange-500 file:text-white cursor-pointer min-w-0" />
                      <button type="submit" className="text-sm bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition-colors shrink-0">Upload</button>
                    </div>
                    <p className="text-[10px] text-[#8080a0] px-1">Recommended: 1080x1920 (9:16 vertical)</p>
                  </form>
                </div>
              )}
            </div>
          )}


          <SectionHeader icon="🎈" label="Add Floating Decorations" open={openSection === 'decorations'} onToggle={() => toggle('decorations')} />
          {openSection === 'decorations' && (
            <div className="mx-1 mb-1 bg-[#16162a] rounded border border-[#2d2d44] p-2 space-y-3">
              <div className="space-y-1">
                <span className="text-xs text-[#a0a0c0] font-semibold">1. Select Placement (Auto-Sized)</span>
                <select 
                  className="w-full text-sm bg-[#1e1e2e] text-white rounded p-1.5 border border-[#3d3d5c] outline-none focus:border-orange-500"
                  value={selectedHotspot}
                  onChange={(e) => setSelectedHotspot(e.target.value)}
                >
                  <option value="">Anywhere (Default Size)</option>
                  <optgroup label="Global Corners">
                    <option value="hotspot-top-left">Top Left Corner</option>
                    <option value="hotspot-top-right">Top Right Corner</option>
                    <option value="hotspot-bottom-left">Bottom Left Corner</option>
                    <option value="hotspot-bottom-right">Bottom Right Corner</option>
                  </optgroup>
                  <optgroup label="Header">
                    <option value="hotspot-header-logo-left">Left of Logo</option>
                    <option value="hotspot-header-logo-right">Right of Logo</option>
                  </optgroup>
                  <optgroup label="Hero Banner">
                    <option value="hotspot-hero-top-left">Hero Top Left</option>
                    <option value="hotspot-hero-top-right">Hero Top Right</option>
                    <option value="hotspot-hero-bottom-left">Hero Bottom Left</option>
                    <option value="hotspot-hero-bottom-right">Hero Bottom Right</option>
                  </optgroup>
                  <optgroup label="Categories">
                    <option value="hotspot-category-best-sellers">Best Sellers Icon</option>
                    <option value="hotspot-category-super-savers">Super Savers Icon</option>
                    <option value="hotspot-category-sweets">Sweets Icon</option>
                    <option value="hotspot-category-diabetic-friendly">Diabetic Friendly Icon</option>
                    <option value="hotspot-category-pickles">Pickles Icon</option>
                    <option value="hotspot-category-snacks">Snacks Icon</option>
                  </optgroup>
                </select>
              </div>

              <span className="text-xs text-[#a0a0c0] font-semibold block">2. Click Icon to Place</span>
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(ICONS).map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('ADD_DECORATION', { detail: { iconName, hotspotId: selectedHotspot } }))
                      }
                    }}
                    className="aspect-square bg-[#2d2d44] hover:bg-[#3d3d5c] rounded flex items-center justify-center p-1.5 transition-colors border border-transparent hover:border-orange-500/50"
                    title={`Add ${iconName}`}
                  >
                    <div className="w-full h-full pointer-events-none">
                      {ICONS[iconName]}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#2d2d44]">
                <form onSubmit={async (e) => { e.preventDefault(); await uploadCustomFloatingDecoration(new FormData(e.currentTarget)); }} className="flex flex-col gap-1 mt-1 p-2 bg-[#1e1e2e] rounded border border-[#2d2d44]">
                  <span className="text-xs text-[#a0a0c0] font-semibold">Upload Custom Decoration</span>
                  <div className="flex gap-1 items-center mt-1">
                    <input type="file" name="file" accept=".json,.svg,.png,.webp" className="flex-1 text-sm text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-sm file:bg-indigo-600 file:text-white cursor-pointer min-w-0" />
                    <button type="submit" className="text-sm bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shrink-0">Upload</button>
                  </div>
                </form>
              </div>

              {customFloatingDecorations && customFloatingDecorations.length > 0 && (
                <div className="pt-2 border-t border-[#2d2d44] space-y-2">
                  <span className="text-xs text-[#a0a0c0] font-semibold block">My Uploaded Decorations</span>
                  <div className="grid grid-cols-3 gap-1">
                    {customFloatingDecorations.map((cd: any) => (
                      <div key={cd.id} className="relative group">
                        <button 
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('ADD_DECORATION', { detail: { iconName: cd.icon_url, hotspotId: selectedHotspot } }))
                            }
                          }} 
                          title={cd.name || 'Custom Decoration'} 
                          className="w-full flex flex-col items-center gap-0.5 py-1.5 rounded text-sm bg-[#2d2d44] text-[#a0a0c0] hover:bg-[#3d3d5c] transition-colors"
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
                          <button type="button" onClick={async () => { await deleteCustomFloatingDecoration(cd.id) }} className="bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-700 shadow-sm border border-red-800">
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Decorations List */}
              {activeDecorations.length > 0 && (
                <div className="pt-2 border-t border-[#2d2d44]">
                  <span className="text-xs text-[#a0a0c0] font-semibold block mb-1">Active Decorations</span>
                  <div className="space-y-1">
                    {activeDecorations.map((dec, i) => (
                      <div key={dec.id || i} className="flex items-center justify-between bg-[#1e1e2e] p-1.5 rounded border border-[#3d3d5c]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{dec.icon_name.startsWith('http') || dec.icon_name.startsWith('data:') ? '🖼️' : dec.icon_name.startsWith('lottie:') ? '🎬' : '🎯'}</span>
                          <span className="text-xs text-white truncate max-w-[120px]">{dec.hotspot_id ? dec.hotspot_id.replace('hotspot-', '') : 'Anywhere'}</span>
                        </div>
                        <button 
                          onClick={() => {
                            // Send delete message to preview iframe
                            const updated = activeDecorations.filter(d => d.id !== dec.id);
                            setActiveDecorations(updated);
                            window.dispatchEvent(new CustomEvent('DELETE_DECORATION', { detail: dec.id }));
                          }}
                          className="text-red-400 hover:bg-red-900/30 p-1 rounded transition-colors text-xs"
                          title="Remove decoration"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <SectionHeader icon="🌄" label="Hero Banner" open={openSection === 'hero'} onToggle={() => toggle('hero')} />
          {openSection === 'hero' && (
            <div className="mx-1 mb-1 bg-[#16162a] rounded border border-[#2d2d44] p-2 space-y-3">
              {viewMode === 'desktop' ? (
                <div className="space-y-1.5">
                  <span className="text-xs text-[#a0a0c0] font-semibold uppercase tracking-wider block">Desktop Banner</span>
                  {activeTheme?.hero_image_url ? (
                    <div className="relative rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={activeTheme.hero_image_url} alt="hero" className="w-full h-14 object-cover opacity-70" />
                      <form onSubmit={async (e) => { e.preventDefault(); await removeHeroImage(false); }} className="absolute top-1 right-1">
                        <button type="submit" className="bg-red-600/80 text-white text-sm px-1.5 py-0.5 rounded hover:bg-red-600">✕</button>
                      </form>
                    </div>
                  ) : (
                    <div className="h-8 rounded border border-dashed border-[#3d3d5c] flex items-center justify-center">
                      <span className="text-sm text-[#6c6c8a]">Using default desktop hero</span>
                    </div>
                  )}
                  <form onSubmit={async (e) => { e.preventDefault(); await uploadHeroImage(new FormData(e.currentTarget)); }} className="flex flex-col gap-1 mt-1">
                    <div className="flex gap-1 items-center">
                      <input type="file" name="file" accept="image/*" required className="flex-1 text-sm text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-sm file:bg-indigo-600 file:text-white cursor-pointer min-w-0" />
                      <input type="hidden" name="isMobile" value="false" />
                      <button type="submit" className="text-sm bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shrink-0">Upload</button>
                    </div>
                    <p className="text-[10px] text-[#8080a0] px-1">Recommended: 1920x1080 (16:9) or 21:9 ultrawide</p>
                  </form>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-xs text-[#a0a0c0] font-semibold uppercase tracking-wider block">Mobile Banner</span>
                  {activeTheme?.mobile_hero_image_url ? (
                    <div className="relative rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={activeTheme.mobile_hero_image_url} alt="mobile hero" className="w-full h-20 object-cover opacity-70" />
                      <form onSubmit={async (e) => { e.preventDefault(); await removeHeroImage(true); }} className="absolute top-1 right-1">
                        <button type="submit" className="bg-red-600/80 text-white text-sm px-1.5 py-0.5 rounded hover:bg-red-600">✕</button>
                      </form>
                    </div>
                  ) : (
                    <div className="h-8 rounded border border-dashed border-[#3d3d5c] flex items-center justify-center">
                      <span className="text-sm text-[#6c6c8a]">Falls back to desktop</span>
                    </div>
                  )}
                  <form onSubmit={async (e) => { e.preventDefault(); await uploadHeroImage(new FormData(e.currentTarget)); }} className="flex flex-col gap-1 mt-1">
                    <div className="flex gap-1 items-center">
                      <input type="file" name="file" accept="image/*" required className="flex-1 text-sm text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-sm file:bg-indigo-600 file:text-white cursor-pointer min-w-0" />
                      <input type="hidden" name="isMobile" value="true" />
                      <button type="submit" className="text-sm bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shrink-0">Upload</button>
                    </div>
                    <p className="text-[10px] text-[#8080a0] px-1">Recommended: 1080x1350 (4:5) or 9:16 vertical</p>
                  </form>
                </div>
              )}
            </div>
          )}


        </div>
      )}
    </nav>
    </div>
  )
}
