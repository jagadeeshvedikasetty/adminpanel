'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { saveAllDecorations } from './(studio-standalone)/studio/actions'
import { updateHeroTextCoordinates } from './actions'
import { ICONS } from './icons'
import EffectAdjustmentsForm from './EffectAdjustmentsForm'
import HeroAdjustmentsPanel from './HeroAdjustmentsPanel'
export default function ThemesPreviewClient({ 
  initialDecorations, 
  version = '1',
  activeTheme,
  customEffects,
  clientUrl = 'http://localhost:3000'
}: { 
  initialDecorations: any[], 
  version?: string,
  activeTheme?: any,
  customEffects?: any[],
  clientUrl?: string
}) {
  const [decorations, setDecorations] = useState(initialDecorations)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [isSaving, startTransition] = useTransition()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [heroTextPos, setHeroTextPos] = useState({
    xDesktop: activeTheme?.hero_text_x_desktop ?? 50,
    yDesktop: activeTheme?.hero_text_y_desktop ?? 50,
    xMobile: activeTheme?.hero_text_x_mobile ?? 50,
    yMobile: activeTheme?.hero_text_y_mobile ?? 50
  })

  // Draggable Effect Settings Panel State
  const [panelPos, setPanelPos] = useState<{ x: number, y: number } | null>(null)
  const [isDraggingPanel, setIsDraggingPanel] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Removed auto-open effect
  const handlePanelPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDraggingPanel(true)
    const rect = (e.currentTarget as HTMLElement).closest('.draggable-panel')?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePanelPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPanel) return
    const containerRect = iframeRef.current?.parentElement?.getBoundingClientRect()
    if (!containerRect) return
    
    // Calculate new position relative to the preview canvas container
    let newX = e.clientX - containerRect.left - dragOffset.x
    let newY = e.clientY - containerRect.top - dragOffset.y
    
    // clamp it roughly to keep it visible
    newX = Math.max(0, Math.min(newX, containerRect.width - 250))
    newY = Math.max(0, Math.min(newY, containerRect.height - 100))
    
    setPanelPos({ x: newX, y: newY })
  }

  const handlePanelPointerUp = (e: React.PointerEvent) => {
    setIsDraggingPanel(false)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STUDIO_READY') {
        // Iframe is ready, send the current decorations
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'STUDIO_SYNC',
            decorations,
            selectedId
          }, '*')
        }
      } else if (e.data?.type === 'STUDIO_DECORATION_UPDATED') {
        const { id, x_percent, y_percent, isMobile } = e.data
        setDecorations(prev => prev.map(d => {
          if (d.id === id) {
            if (isMobile) {
              return { ...d, mobile_x_percent: x_percent, mobile_y_percent: y_percent }
            } else {
              return { ...d, x_percent, y_percent }
            }
          }
          return d
        }))
        setHasUnsaved(true)
      } else if (e.data?.type === 'STUDIO_SELECTION_CHANGED') {
        setSelectedId(e.data.selectedId)
      } else if (e.data?.type === 'HERO_TEXT_MOVE') {
        setHeroTextPos(prev => {
          if (e.data.isMobile) {
            return { ...prev, xMobile: e.data.x, yMobile: e.data.y }
          } else {
            return { ...prev, xDesktop: e.data.x, yDesktop: e.data.y }
          }
        })
        setHasUnsaved(true)
      } else if (e.data?.type === 'HERO_IMAGE_DRAGGED') {
        const { isMobile, position } = e.data
        // Dispatch event for HeroAdjustmentsPanel to pick up
        window.dispatchEvent(new CustomEvent('HERO_POSITION_CHANGED', { 
          detail: { isMobile, position } 
        }))
        setHasUnsaved(true)
      } else if (e.data?.type === 'REQUEST_STUDIO_SYNC') {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'STUDIO_SYNC',
            decorations,
            selectedId,
            openSection
          }, '*')
        }
      }
    }
    window.addEventListener('message', handleMessage)
    
    const handleSectionChange = (e: any) => {
      if (['effects-settings', 'hero'].includes(e.detail)) {
        setOpenSection(e.detail)
        setIsMinimized(false)
      } else {
        setOpenSection(null)
      }
    }
    window.addEventListener('ADMIN_SECTION_CHANGED', handleSectionChange)

    const handleSetViewMode = (e: any) => {
      setViewMode(e.detail)
    }
    window.addEventListener('SET_VIEW_MODE', handleSetViewMode)

    const handleAddDecorationEvent = (e: any) => {
      handleAdd(e.detail)
    }
    window.addEventListener('ADD_DECORATION', handleAddDecorationEvent)

    const handleRequestSave = () => {
      handleSave()
    }
    window.addEventListener('REQUEST_SAVE_DECORATIONS', handleRequestSave)
    
    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('ADMIN_SECTION_CHANGED', handleSectionChange)
      window.removeEventListener('SET_VIEW_MODE', handleSetViewMode)
      window.removeEventListener('ADD_DECORATION', handleAddDecorationEvent)
      window.removeEventListener('REQUEST_SAVE_DECORATIONS', handleRequestSave)
    }
  }, [decorations, selectedId, openSection, hasUnsaved])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('UNSAVED_CHANGES', { detail: hasUnsaved }))
  }, [hasUnsaved])

  // Send updates to the iframe when state changes
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'STUDIO_SYNC',
        decorations,
        selectedId,
        openSection
      }, '*')
    }
  }, [decorations, selectedId, openSection])

  const handleAdd = (iconName: string) => {
    setDecorations(prev => [...prev, { 
      id: Date.now(), 
      icon_name: iconName, 
      x_percent: 50, 
      y_percent: 30, 
      size: 1.0, 
      is_active: true,
      show_on_desktop: true,
      show_on_mobile: true
    }])
    setHasUnsaved(true)
  }

  const handleDelete = (id: number) => {
    setDecorations(prev => prev.map(d => {
      if (d.id === id) {
        if (viewMode === 'mobile') {
          return { ...d, show_on_mobile: false }
        } else {
          return { ...d, show_on_desktop: false }
        }
      }
      return d
    }).filter(d => d.show_on_mobile !== false || d.show_on_desktop !== false))
    setHasUnsaved(true)
  }

  const handleResize = (id: number, delta: number) => {
    setDecorations(prev => prev.map(d => d.id === id ? { ...d, size: Math.max(0.2, Math.min(4, d.size + delta)) } : d))
    setHasUnsaved(true)
  }

  const handleSave = () => {
    startTransition(async () => {
      await saveAllDecorations(decorations)
      await updateHeroTextCoordinates(heroTextPos.xDesktop, heroTextPos.yDesktop, heroTextPos.xMobile, heroTextPos.yMobile)
      setHasUnsaved(false)
    })
  }

  const selected = decorations.find(d => d.id === selectedId)

  return (
    <div className="flex flex-col h-screen bg-[#12121a] overflow-hidden w-full m-0 p-0 relative">
      
      {/* Floating Decoration Controls */}
      {selected && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1e1e2e]/90 backdrop-blur border border-[#2d2d44] shadow-2xl rounded-full px-4 py-2 pointer-events-auto">
          <span className="text-[10px] text-[#a0a0c0] font-semibold tracking-wider uppercase mr-2">Selected Icon</span>
          <button onClick={() => handleResize(selected.id, -0.2)} className="text-white text-sm w-7 h-7 flex items-center justify-center hover:bg-[#3d3d5c] rounded-full bg-[#2d2d44] transition-colors">−</button>
          <button onClick={() => handleResize(selected.id, 0.2)} className="text-white text-sm w-7 h-7 flex items-center justify-center hover:bg-[#3d3d5c] rounded-full bg-[#2d2d44] transition-colors">+</button>
          <div className="w-px h-4 bg-[#3d3d5c] mx-1"></div>
          <button onClick={() => { handleDelete(selected.id); setSelectedId(null) }} className="text-red-400 text-xs w-7 h-7 flex items-center justify-center hover:bg-red-500/20 hover:text-red-300 rounded-full transition-colors">✕</button>
        </div>
      )}

      {/* Preview Canvas */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden">
        {/* Client website iframe container */}
        <div 
          className={`relative transition-all duration-500 ease-in-out ${
            viewMode === 'mobile' 
              ? 'w-[393px] h-[876px] max-h-[95%] border-[12px] border-black rounded-[3rem] shadow-2xl overflow-hidden' 
              : 'w-full h-full'
          }`}
        >
          <iframe
            ref={iframeRef}
            src={`${clientUrl}?studio=true&v=${version}`}
            className="absolute inset-0 w-full h-full border-none bg-white"
            title="Live Website Preview"
          />
        </div>

        {/* Floating Panels */}
        {openSection && (
          <div
            className={`draggable-panel absolute z-[99999] ${isMinimized ? 'w-10 h-10 rounded-full' : 'rounded-xl'} flex flex-col overflow-hidden backdrop-blur-md bg-black/60 border border-white/20 shadow-2xl transition-all`}
            style={panelPos ? {
              left: `${panelPos.x}px`,
              top: `${panelPos.y}px`,
            } : {
              right: '20px',
              top: '20px',
            }}
          >
            {isMinimized ? (
              <button 
                className="w-full h-full flex items-center justify-center text-white cursor-grab active:cursor-grabbing bg-white/10 hover:bg-white/20 transition-colors"
                onPointerDown={handlePanelPointerDown}
                onPointerMove={handlePanelPointerMove}
                onPointerUp={handlePanelPointerUp}
                onClick={() => setIsMinimized(false)}
                title="Restore Panel"
              >
                ⚙️
              </button>
            ) : (
              <>
                {/* Draggable Header */}
                <div 
                  className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5 cursor-grab active:cursor-grabbing"
                  onPointerDown={handlePanelPointerDown}
                  onPointerMove={handlePanelPointerMove}
                  onPointerUp={handlePanelPointerUp}
                >
                  <span className="text-white text-xs font-bold uppercase tracking-wider select-none">
                    {openSection === 'effects-settings' ? `${activeTheme?.active_effect} Settings` : 'Hero Adjustments'}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setIsMinimized(true)} 
                      className="text-white/60 hover:text-white text-xs transition-colors p-1"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      —
                    </button>
                    <button 
                      onClick={() => setOpenSection(null)} 
                      className="text-white/60 hover:text-white text-xs transition-colors p-1"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {/* Body */}
                <div className="p-4 bg-[#16162a]">
                  {openSection === 'effects-settings' ? (
                    <EffectAdjustmentsForm 
                      activeTheme={activeTheme} 
                      customEffects={customEffects || []} 
                      onSaveCallback={() => setOpenSection(null)} 
                    />
                  ) : (
                    <HeroAdjustmentsPanel 
                      activeTheme={activeTheme}
                      onClose={() => setOpenSection(null)} 
                      onChange={(adjustments) => {
                        if (iframeRef.current?.contentWindow) {
                          iframeRef.current.contentWindow.postMessage({
                            type: 'STUDIO_HERO_ADJUSTMENTS',
                            ...adjustments
                          }, '*')
                        }
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
