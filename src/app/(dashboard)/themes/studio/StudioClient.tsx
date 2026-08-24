'use client'

import { useState, useRef, useTransition } from 'react'
import { updateDecorationPosition, deleteDecoration, addDecoration } from './actions'

export const ICONS: Record<string, string> = {
  'kite': '🪁',
  'diya': '🪔',
  'mango': '🥭',
  'flower': '🌸',
  'sparkle': '✨'
}

export default function StudioClient({ initialDecorations }: { initialDecorations: any[] }) {
  const [decorations, setDecorations] = useState(initialDecorations)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  const handlePointerDown = (id: number, e: React.PointerEvent) => {
    e.preventDefault()
    setDraggingId(id)
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
    const dec = decorations.find(d => d.id === draggingId)
    setDraggingId(null)

    if (dec) {
      await updateDecorationPosition(dec.id, dec.x_percent, dec.y_percent)
    }
  }

  const handleDelete = async (id: number) => {
    setDecorations(prev => prev.filter(d => d.id !== id))
    await deleteDecoration(id)
  }

  const handleAdd = (iconName: string) => {
    startTransition(async () => {
      await addDecoration(iconName)
      window.location.reload()
    })
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
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Auto-saving
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 mr-2">Click to spawn an icon:</span>
          {Object.keys(ICONS).map(iconName => (
            <button
              key={iconName}
              disabled={isPending}
              onClick={() => handleAdd(iconName)}
              className="w-10 h-10 flex items-center justify-center text-2xl bg-gray-50 border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-200 hover:scale-110 transition-all cursor-pointer disabled:opacity-50"
            >
              {ICONS[iconName]}
            </button>
          ))}
        </div>
      </div>

      {/* The Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 w-full relative overflow-hidden select-none bg-gray-100"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Live Website Preview */}
        <iframe 
          src="http://localhost:3001" 
          className="absolute inset-0 w-full h-full border-none pointer-events-none"
          title="Client Website Preview"
        />

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
              fontSize: '48px',
              zIndex: 100,
              userSelect: 'none',
              touchAction: 'none'
            }}
            className="group hover:scale-110 transition-transform"
          >
            {ICONS[dec.icon_name] || '🎉'}
            
            {draggingId !== dec.id && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(dec.id); }}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
