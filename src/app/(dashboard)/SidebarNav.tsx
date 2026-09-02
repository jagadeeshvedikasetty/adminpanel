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
  updateHeroText
} from './themes/actions'

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

function Divider() { return <div className="border-t border-[#2d2d44] my-1" /> }

function SectionHeader({ icon, label, open, onToggle }: { icon: string; label: string; open: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-1.5 rounded text-[11px] text-[#a0a0c0] hover:bg-[#2d2d44] hover:text-white transition-colors">
      <div className="flex items-center gap-2"><span>{icon}</span><span className="font-semibold">{label}</span></div>
      <span className="text-[9px] opacity-50">{open ? '▾' : '▸'}</span>
    </button>
  )
}

export default function SidebarNav({ activeTheme, festivals }: { activeTheme: Theme | null; festivals: Festival[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const isTheme = pathname.startsWith('/themes')
  const [themeOpen, setThemeOpen] = useState(isTheme)
  const [openSection, setOpenSection] = useState<string | null>(isTheme ? 'colors' : null)
  const [primaryColor, setPrimaryColor] = useState(activeTheme?.primary_color || '#FF9933')
  const [secondaryColor, setSecondaryColor] = useState(activeTheme?.secondary_color || '#138808')
  const [desktopScale, setDesktopScale] = useState(activeTheme?.hero_text_scale_desktop || 1.0)
  const [mobileScale, setMobileScale] = useState(activeTheme?.hero_text_scale_mobile || 1.0)
  
  const [showTextDesktop, setShowTextDesktop] = useState(activeTheme?.hero_text_show_desktop ?? true)
  const [showTextMobile, setShowTextMobile] = useState(activeTheme?.hero_text_show_mobile ?? true)
  const [showButtonDesktop, setShowButtonDesktop] = useState(activeTheme?.hero_button_show_desktop ?? true)
  const [showButtonMobile, setShowButtonMobile] = useState(activeTheme?.hero_button_show_mobile ?? true)

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ADMIN_SECTION_CHANGED', { detail: openSection }))
  }, [openSection])

  useEffect(() => {
    if (activeTheme) {
      setPrimaryColor(activeTheme.primary_color || '#FF9933')
      setSecondaryColor(activeTheme.secondary_color || '#138808')
      setDesktopScale(activeTheme.hero_text_scale_desktop || 1.0)
      setMobileScale(activeTheme.hero_text_scale_mobile || 1.0)
      setShowTextDesktop(activeTheme.hero_text_show_desktop ?? true)
      setShowTextMobile(activeTheme.hero_text_show_mobile ?? true)
      setShowButtonDesktop(activeTheme.hero_button_show_desktop ?? true)
      setShowButtonMobile(activeTheme.hero_button_show_mobile ?? true)
    }
  }, [activeTheme])

  const toggle = (k: string) => setOpenSection(p => p === k ? null : k)

  const navLink = (href: string, icon: string, label: string) => (
    <Link href={href} className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] transition-colors ${pathname === href ? 'bg-orange-500/20 text-orange-300' : 'text-[#a0a0c0] hover:bg-[#2d2d44] hover:text-white'}`}>
      <span>{icon}</span><span className="font-medium">{label}</span>
    </Link>
  )

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
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
                      <form action={applyFestivalTheme.bind(null, f.name, f.themeColors.primary, f.themeColors.secondary, f.suggestedEffect || null)}>
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
                <form action={updateThemeColors.bind(null, activeTheme?.name || 'Custom', primaryColor, secondaryColor)}>
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
                    <form key={e.id} action={updateThemeEffect.bind(null, e.id === 'none' ? null : e.id)}>
                      <button type="submit" title={e.label} className={`w-full flex flex-col items-center gap-0.5 py-1.5 rounded text-[9px] transition-colors ${isActive ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40' : 'bg-[#2d2d44] text-[#a0a0c0] hover:bg-[#3d3d5c]'}`}>
                        <span className="text-sm leading-none">{e.icon}</span>
                        <span>{e.label}</span>
                      </button>
                    </form>
                  )
                })}
              </div>
              <form action={uploadCustomEffect} className="flex gap-1 items-center">
                <input type="file" name="file" accept=".json,.svg" className="flex-1 text-[9px] text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:bg-indigo-600 file:text-white cursor-pointer min-w-0" />
                <button type="submit" className="text-[9px] bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shrink-0">Upload</button>
              </form>
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
                  <form action={removeThemeBackground} className="absolute top-1 right-1">
                    <button type="submit" className="bg-red-600/80 text-white text-[9px] px-1.5 py-0.5 rounded hover:bg-red-600">✕</button>
                  </form>
                </div>
              ) : (
                <div className="h-8 rounded border border-dashed border-[#3d3d5c] flex items-center justify-center">
                  <span className="text-[9px] text-[#6c6c8a]">No background set</span>
                </div>
              )}
              <form action={uploadThemeBackground} className="flex gap-1 items-center">
                <input type="file" name="file" accept="image/*" required className="flex-1 text-[9px] text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:bg-orange-500 file:text-white cursor-pointer min-w-0" />
                <button type="submit" className="text-[9px] bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition-colors shrink-0">Upload</button>
              </form>
            </div>
          )}

          {/* ── 🌄 Hero ── */}
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
                    <form action={removeHeroImage.bind(null, false)} className="absolute top-1 right-1">
                      <button type="submit" className="bg-red-600/80 text-white text-[9px] px-1.5 py-0.5 rounded hover:bg-red-600">✕</button>
                    </form>
                  </div>
                ) : (
                  <div className="h-8 rounded border border-dashed border-[#3d3d5c] flex items-center justify-center">
                    <span className="text-[9px] text-[#6c6c8a]">Using default desktop hero</span>
                  </div>
                )}
                <form action={uploadHeroImage} className="flex gap-1 items-center">
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
                    <form action={removeHeroImage.bind(null, true)} className="absolute top-1 right-1">
                      <button type="submit" className="bg-red-600/80 text-white text-[9px] px-1.5 py-0.5 rounded hover:bg-red-600">✕</button>
                    </form>
                  </div>
                ) : (
                  <div className="h-8 rounded border border-dashed border-[#3d3d5c] flex items-center justify-center">
                    <span className="text-[9px] text-[#6c6c8a]">Falls back to desktop</span>
                  </div>
                )}
                <form action={uploadHeroImage} className="flex gap-1 items-center">
                  <input type="file" name="file" accept="image/*" required className="flex-1 text-[9px] text-[#6c6c8a] file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:bg-indigo-600 file:text-white cursor-pointer min-w-0" />
                  <input type="hidden" name="isMobile" value="true" />
                  <button type="submit" className="text-[9px] bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors shrink-0">Upload</button>
                </form>
              </div>

            </div>
          )}

          {/* ── 📝 Hero Text ── */}
          <SectionHeader icon="📝" label="Hero Text" open={openSection === 'hero-text'} onToggle={() => toggle('hero-text')} />
          {openSection === 'hero-text' && (
            <div className="mx-1 mb-1 bg-[#16162a] rounded border border-[#2d2d44] p-2 space-y-3">
              <form action={updateHeroText} className="space-y-2">
                <input type="text" name="title" defaultValue={activeTheme?.hero_title || 'Monsoon Sale!'} placeholder="Title" className="w-full bg-[#0b0b14] border border-[#2d2d44] rounded px-2 py-1 text-[10px] text-white" />
                <textarea name="subtitle" defaultValue={activeTheme?.hero_subtitle || 'Enjoy the cozy weather with our traditional homemade sweets and snacks. Special discounts available for a limited time!'} placeholder="Subtitle" className="w-full bg-[#0b0b14] border border-[#2d2d44] rounded px-2 py-1 text-[10px] text-white h-16 resize-none" />
                <input type="text" name="buttonText" defaultValue={activeTheme?.hero_button_text || 'Shop the Sale'} placeholder="Button Text" className="w-full bg-[#0b0b14] border border-[#2d2d44] rounded px-2 py-1 text-[10px] text-white" />
                <input type="text" name="buttonLink" defaultValue={activeTheme?.hero_button_link || '/shop'} placeholder="Button Link" className="w-full bg-[#0b0b14] border border-[#2d2d44] rounded px-2 py-1 text-[10px] text-white" />
                
                <input type="hidden" name="desktopScale" value={desktopScale} />
                <input type="hidden" name="mobileScale" value={mobileScale} />
                <input type="hidden" name="showTextDesktop" value={showTextDesktop.toString()} />
                <input type="hidden" name="showTextMobile" value={showTextMobile.toString()} />
                <input type="hidden" name="showButtonDesktop" value={showButtonDesktop.toString()} />
                <input type="hidden" name="showButtonMobile" value={showButtonMobile.toString()} />

                <div className="pt-2 border-t border-[#2d2d44] space-y-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#a0a0c0]">Desktop Controls</span>
                    <div className="flex gap-2 items-center">
                      <label className="flex items-center gap-1 cursor-pointer text-[9px] text-[#a0a0c0]">
                        <input type="checkbox" checked={showTextDesktop} onChange={(e) => { setShowTextDesktop(e.target.checked); setTimeout(() => e.target.form?.requestSubmit(), 0); }} className="rounded border-[#2d2d44] bg-[#0b0b14]" />
                        Text
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer text-[9px] text-[#a0a0c0]">
                        <input type="checkbox" checked={showButtonDesktop} onChange={(e) => { setShowButtonDesktop(e.target.checked); setTimeout(() => e.target.form?.requestSubmit(), 0); }} className="rounded border-[#2d2d44] bg-[#0b0b14]" />
                        Btn
                      </label>
                      <div className="flex bg-[#0b0b14] rounded border border-[#2d2d44] overflow-hidden ml-1">
                        <button type="button" onClick={() => setDesktopScale(Math.max(0.5, desktopScale - 0.1))} className="px-1.5 py-0.5 hover:bg-[#2d2d44] text-white transition-colors">-</button>
                        <div className="px-1.5 py-0.5 text-[9px] text-white border-x border-[#2d2d44]">
                          {Number(desktopScale).toFixed(1)}x
                        </div>
                        <button type="button" onClick={() => setDesktopScale(Math.min(2.0, desktopScale + 0.1))} className="px-1.5 py-0.5 hover:bg-[#2d2d44] text-white transition-colors">+</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#a0a0c0]">Mobile Controls</span>
                    <div className="flex gap-2 items-center">
                      <label className="flex items-center gap-1 cursor-pointer text-[9px] text-[#a0a0c0]">
                        <input type="checkbox" checked={showTextMobile} onChange={(e) => { setShowTextMobile(e.target.checked); setTimeout(() => e.target.form?.requestSubmit(), 0); }} className="rounded border-[#2d2d44] bg-[#0b0b14]" />
                        Text
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer text-[9px] text-[#a0a0c0]">
                        <input type="checkbox" checked={showButtonMobile} onChange={(e) => { setShowButtonMobile(e.target.checked); setTimeout(() => e.target.form?.requestSubmit(), 0); }} className="rounded border-[#2d2d44] bg-[#0b0b14]" />
                        Btn
                      </label>
                      <div className="flex bg-[#0b0b14] rounded border border-[#2d2d44] overflow-hidden ml-1">
                        <button type="button" onClick={() => setMobileScale(Math.max(0.5, mobileScale - 0.1))} className="px-1.5 py-0.5 hover:bg-[#2d2d44] text-white transition-colors">-</button>
                        <div className="px-1.5 py-0.5 text-[9px] text-white border-x border-[#2d2d44]">
                          {Number(mobileScale).toFixed(1)}x
                        </div>
                        <button type="button" onClick={() => setMobileScale(Math.min(2.0, mobileScale + 0.1))} className="px-1.5 py-0.5 hover:bg-[#2d2d44] text-white transition-colors">+</button>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white text-[10px] py-1 rounded hover:bg-blue-700">Save Changes</button>
              </form>
            </div>
          )}

        </div>
      )}
    </nav>
  )
}
