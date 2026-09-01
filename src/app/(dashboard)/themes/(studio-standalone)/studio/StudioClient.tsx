'use client'

import { useState, useRef, useTransition } from 'react'
import { Lottie } from 'lottie-react'
import { saveAllDecorations } from './actions'
import EffectAdjustmentsForm from '../../EffectAdjustmentsForm'
import { ICONS } from '../../icons'




export default function StudioClient({ initialDecorations, activeTheme, customEffects = [] }: { initialDecorations: any[], activeTheme?: any, customEffects?: any[] }) {
  const [decorations, setDecorations] = useState(initialDecorations)
  const [showAdjustments, setShowAdjustments] = useState(false)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, startTransition] = useTransition()

  const handlePointerDown = (id: number, e: React.PointerEvent) => {
    e.preventDefault()
    setDraggingId(id)
    setSelectedId(id)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingId === null || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    
    let x = e.clientX - canvasRect.left
    let y = e.clientY - canvasRect.top

    let xPercent = (x / canvasRect.width) * 100
    let yPercent = (y / canvasRect.height) * 100

    xPercent = Math.max(0, Math.min(100, xPercent))
    yPercent = Math.max(0, Math.min(100, yPercent))

    setDecorations(prev => prev.map(dec => 
      dec.id === draggingId ? { ...dec, x_percent: xPercent, y_percent: yPercent } : dec
    ))
  }

  const handlePointerUp = async (e: React.PointerEvent) => {
    if (draggingId === null) return
    setDraggingId(null)
    setHasUnsavedChanges(true)
  }

  const handleResize = (id: number, newSize: number) => {
    setDecorations(prev => prev.map(d => d.id === id ? { ...d, size: newSize } : d))
    setHasUnsavedChanges(true)
  }

  const handleDelete = (id: number) => {
    setDecorations(prev => prev.filter(d => d.id !== id))
    setHasUnsavedChanges(true)
  }

  const handleAdd = (iconName: string) => {
    const newDeco = {
      id: Date.now(), // Temporary frontend ID
      icon_name: iconName,
      x_percent: 50,
      y_percent: 20,
      size: 1.0,
      is_active: true
    }
    setDecorations(prev => [...prev, newDeco])
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    startTransition(async () => {
      await saveAllDecorations(decorations)
      setHasUnsavedChanges(false)
      alert("Changes published to the live website!")
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 1MB
    if (file.size > 1048576) {
      alert("This file is too large! Please upload a file smaller than 1MB.")
      return
    }
    
    if (file.type === "application/json") {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonText = event.target?.result as string
          JSON.parse(jsonText) // validate it's JSON
          const lottieString = `lottie:${jsonText}`
          handleAdd(lottieString)
        } catch (err) {
          alert("Invalid Lottie JSON file.")
        }
      }
      reader.readAsText(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      handleAdd(base64String)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900 overflow-hidden flex flex-col">
      
      {/* Top Toolbar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50">
        <div className="flex items-center gap-4">
          <a href="/themes" className="text-gray-500 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
            ← Back to Themes
          </a>
          <h1 className="text-lg font-bold text-gray-800 border-l border-gray-300 pl-4">Visual Decoration Studio</h1>
          
          <button 
            onClick={() => setShowAdjustments(!showAdjustments)}
            className={`ml-4 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${showAdjustments ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            ⚙️ Effect Adjustments
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`ml-4 px-4 py-1.5 rounded-md text-sm font-bold shadow-sm transition-all ${
              hasUnsavedChanges 
                ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSaving ? 'Publishing...' : hasUnsavedChanges ? 'Publish Changes' : 'All Changes Saved'}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedId ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-md shadow-sm mr-2">
              <span className="text-sm font-medium text-indigo-700">Selected Item:</span>
              <button 
                onClick={() => handleResize(selectedId, Math.max(0.2, (decorations.find(d => d.id === selectedId)?.size || 1) - 0.2))}
                className="w-6 h-6 flex items-center justify-center bg-white text-indigo-700 border border-indigo-300 rounded hover:bg-indigo-100 font-bold"
              >
                -
              </button>
              <button 
                onClick={() => handleResize(selectedId, (decorations.find(d => d.id === selectedId)?.size || 1) + 0.2)}
                className="w-6 h-6 flex items-center justify-center bg-white text-indigo-700 border border-indigo-300 rounded hover:bg-indigo-100 font-bold"
              >
                +
              </button>
              <div className="w-px h-4 bg-indigo-300 mx-1"></div>
              <button 
                onClick={() => { handleDelete(selectedId); setSelectedId(null); }}
                className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 border border-red-300 rounded hover:bg-red-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-500 mr-2">Click to spawn an icon:</span>
          )}
          {Object.keys(ICONS).map(iconName => (
            <button
              key={iconName}
              disabled={isSaving}
              onClick={() => handleAdd(iconName)}
              className="w-10 h-10 p-1 flex items-center justify-center bg-gray-50 border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-200 hover:scale-110 transition-all cursor-pointer disabled:opacity-50"
            >
              {ICONS[iconName]}
            </button>
          ))}
          <div className="border-l border-gray-300 h-8 mx-2"></div>
          <input 
            type="file" 
            accept="image/svg+xml,application/json" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button
            disabled={isSaving}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Upload SVG/Lottie
          </button>
        </div>
      </div>

      {/* The Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 w-full relative overflow-hidden select-none bg-gray-100"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerDown={(e) => {
          if (e.target === canvasRef.current) setSelectedId(null)
        }}
      >
        {/* Live Website Preview */}
        <iframe 
          src="http://localhost:3001?studio=true" 
          className="absolute inset-0 w-full h-full border-none"
          title="Client Website Preview"
        />

        {/* Floating Adjustments Panel */}
        {showAdjustments && (
          <div className="absolute top-4 left-4 w-96 max-h-[calc(100%-2rem)] overflow-y-auto bg-white/95 backdrop-blur shadow-2xl border border-gray-200 rounded-xl p-6 z-[200]">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 pb-2 z-10">
              <h2 className="text-lg font-bold text-gray-800">Effect Adjustments</h2>
              <button onClick={() => setShowAdjustments(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <EffectAdjustmentsForm activeTheme={activeTheme} customEffects={customEffects} onSaveCallback={() => setShowAdjustments(false)} />
          </div>
        )}

        {/* The Decorations */}
        {decorations.map(dec => (
          <div
            key={dec.id}
            onPointerDown={(e) => handlePointerDown(dec.id, e)}
            style={{
              position: 'absolute',
              left: `${dec.x_percent}%`,
              top: `${dec.y_percent}%`,
              transform: `translate(-50%, -50%) scale(${dec.size})`,
              cursor: draggingId === dec.id ? 'grabbing' : 'grab',
              width: '48px',
              height: '48px',
              fontSize: '48px',
              zIndex: selectedId === dec.id ? 150 : 100,
              userSelect: 'none',
              touchAction: 'none'
            }}
            className="group transition-transform"
          >
            {/* Highlight Ring */}
            {selectedId === dec.id && (
              <div className="absolute inset-[-10px] border-2 border-dashed border-indigo-500 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: '10s' }}></div>
            )}
            
            {ICONS[dec.icon_name] ? (
              ICONS[dec.icon_name]
            ) : dec.icon_name.startsWith('lottie:') ? (
              <Lottie src={JSON.parse(dec.icon_name.substring(7))} loop={true} className="w-full h-full pointer-events-none" />
            ) : dec.icon_name.startsWith('data:image/') ? (
              <img src={dec.icon_name} alt="Custom Decoration" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} draggable={false} />
            ) : (
              '🎉'
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
