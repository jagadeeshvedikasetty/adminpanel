'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { saveAllDecorations } from './(studio-standalone)/studio/actions'
import { updateHeroTextCoordinates } from './actions'
import { ICONS } from './icons'
import EffectAdjustmentsForm from './EffectAdjustmentsForm'

const DECORATION_ICONS = ['kite', 'diya', 'mango', 'flower', 'sparkle']

export default function ThemesPreviewClient({ 
  initialDecorations, 
  version = '1',
  activeTheme,
  customEffects
}: { 
  initialDecorations: any[], 
  version?: string,
  activeTheme?: any,
  customEffects?: any[]
}) {
  const [decorations, setDecorations] = useState(initialDecorations)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [openSection, setOpenSection] = useState<string | null>(null)
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
  const [showEffectSettings, setShowEffectSettings] = useState(false)
  const [panelPos, setPanelPos] = useState<{ x: number, y: number } | null>(null)
  const [isDraggingPanel, setIsDraggingPanel] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Auto-open effect settings if an effect is active
  useEffect(() => {
    if (activeTheme?.active_effect && activeTheme.active_effect !== 'none') {
      setShowEffectSettings(true)
    } else {
      setShowEffectSettings(false)
    }
  }, [activeTheme?.active_effect])

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
    
    const handleSectionChange = (e: any) => setOpenSection(e.detail)
    window.addEventListener('ADMIN_SECTION_CHANGED', handleSectionChange)
    
    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('ADMIN_SECTION_CHANGED', handleSectionChange)
    }
  }, [decorations, selectedId, openSection])

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
    <div className="flex flex-col h-full bg-gray-900 overflow-hidden w-full m-0 p-0">
      {/* Studio Toolbar */}
      <div className="h-12 bg-[#1e1e2e] border-b border-[#2d2d44] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-semibold">🪁 Live Preview</span>
          <span className="text-[#a0a0c0] text-xs hidden sm:inline">Drag decorations on the preview below</span>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-[#12121a] p-0.5 rounded mr-2">
            <button 
              onClick={() => setViewMode('desktop')} 
              className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === 'desktop' ? 'bg-[#2d2d44] text-white font-bold shadow-sm' : 'text-[#8080a0] hover:text-white font-medium'}`}
            >
              Desktop
            </button>
            <button 
              onClick={() => setViewMode('mobile')} 
              className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === 'mobile' ? 'bg-[#2d2d44] text-white font-bold shadow-sm' : 'text-[#8080a0] hover:text-white font-medium'}`}
            >
              Mobile
            </button>
          </div>

          {/* Add decoration buttons */}
          {DECORATION_ICONS.map(icon => (
            <button
              key={icon}
              onClick={() => handleAdd(icon)}
              title={`Add ${icon}`}
              className="w-7 h-7 rounded bg-[#2d2d44] hover:bg-[#3d3d5c] text-white text-xs flex items-center justify-center transition-colors"
            >
              <span className="w-4 h-4">{ICONS[icon]}</span>
            </button>
          ))}

          {selected && (
            <div className="flex items-center gap-1 ml-2 bg-[#2d2d44] rounded px-2 py-1">
              <button onClick={() => handleResize(selected.id, -0.2)} className="text-white text-xs w-5 h-5 flex items-center justify-center hover:bg-[#3d3d5c] rounded">−</button>
              <button onClick={() => handleResize(selected.id, 0.2)} className="text-white text-xs w-5 h-5 flex items-center justify-center hover:bg-[#3d3d5c] rounded">+</button>
              <button onClick={() => { handleDelete(selected.id); setSelectedId(null) }} className="text-red-400 text-xs ml-1 hover:text-red-300">✕</button>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!hasUnsaved || isSaving}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${hasUnsaved ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-[#2d2d44] text-[#6c6c8a] cursor-not-allowed'}`}
          >
            {isSaving ? 'Saving…' : hasUnsaved ? '💾 Save' : '✓ Saved'}
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="flex-1 relative bg-[#12121a] flex items-center justify-center overflow-hidden">
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
            src={`http://localhost:3000?studio=true&v=${version}`}
            className="absolute inset-0 w-full h-full border-none bg-white"
            title="Live Website Preview"
          />
        </div>

        {/* Draggable Global Effect Settings Panel */}
        {showEffectSettings && activeTheme && (
          <div
            className="draggable-panel absolute z-[99999] backdrop-blur-md bg-black/60 border border-white/20 shadow-2xl rounded-xl flex flex-col min-w-[280px] overflow-hidden"
            style={panelPos ? {
              left: `${panelPos.x}px`,
              top: `${panelPos.y}px`,
            } : {
              right: '20px',
              bottom: '20px',
            }}
          >
            {/* Draggable Header */}
            <div 
              className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5 cursor-grab active:cursor-grabbing"
              onPointerDown={handlePanelPointerDown}
              onPointerMove={handlePanelPointerMove}
              onPointerUp={handlePanelPointerUp}
            >
              <span className="text-white text-xs font-bold uppercase tracking-wider select-none">
                {activeTheme.active_effect} Settings
              </span>
              <button 
                onClick={() => setShowEffectSettings(false)} 
                className="text-white/60 hover:text-white text-xs transition-colors p-1"
                onPointerDown={(e) => e.stopPropagation()}
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="p-4">
              <EffectAdjustmentsForm 
                activeTheme={activeTheme} 
                customEffects={customEffects || []} 
                onSaveCallback={() => setShowEffectSettings(false)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
