'use client'

import { useState, useRef, useTransition } from 'react'
import Lottie from 'lottie-react'
import { updateDecorationPosition, updateDecorationSize, deleteDecoration, addDecoration } from './actions'

export const ICONS: Record<string, React.ReactNode> = {
  'kite': (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ animation: 'sway 3s ease-in-out infinite alternate', transformOrigin: 'bottom center' }}>
      <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="#ff4d4d"/>
      <path d="M50 10 L90 50 L50 50 Z" fill="#ff1a1a"/>
      <path d="M50 90 L50 10" stroke="white" strokeWidth="2"/>
      <path d="M10 50 L90 50" stroke="white" strokeWidth="2"/>
      <style>{`@keyframes sway { 0% { transform: rotate(-10deg); } 100% { transform: rotate(10deg); } }`}</style>
    </svg>
  ),
  'diya': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M20 60 Q50 90 80 60 Z" fill="#cc6600"/>
      <ellipse cx="50" cy="60" rx="30" ry="10" fill="#994d00"/>
      <path d="M50 55 Q40 30 50 20 Q60 30 50 55 Z" fill="#ffcc00" style={{ animation: 'flicker 0.5s infinite alternate', transformOrigin: 'bottom center' }}/>
      <style>{`@keyframes flicker { 0% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.1) rotate(-2deg); opacity: 0.9; } 100% { transform: scale(0.9) rotate(2deg); opacity: 1; } }`}</style>
    </svg>
  ),
  'mango': (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ animation: 'bounce-slow 2s infinite ease-in-out alternate' }}>
      <path d="M30 70 C 10 70, 10 30, 40 20 C 70 10, 90 40, 80 60 C 70 80, 50 70, 30 70 Z" fill="#ffcc00"/>
      <path d="M40 20 Q50 10 60 5" stroke="green" strokeWidth="4" fill="none"/>
      <path d="M50 10 Q65 10 70 20 Q55 25 50 10 Z" fill="green"/>
      <style>{`@keyframes bounce-slow { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }`}</style>
    </svg>
  ),
  'flower': (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ animation: 'spin-slow 10s linear infinite', transformOrigin: 'center' }}>
      <circle cx="50" cy="50" r="15" fill="#ffcc00"/>
      <path d="M50 15 C60 15, 65 35, 50 35 C35 35, 40 15, 50 15 Z" fill="#ff66b2"/>
      <path d="M50 85 C60 85, 65 65, 50 65 C35 65, 40 85, 50 85 Z" fill="#ff66b2"/>
      <path d="M15 50 C15 60, 35 65, 35 50 C35 35, 15 40, 15 50 Z" fill="#ff66b2"/>
      <path d="M85 50 C85 60, 65 65, 65 50 C65 35, 85 40, 85 50 Z" fill="#ff66b2"/>
      <style>{`@keyframes spin-slow { 100% { transform: rotate(360deg); } }`}</style>
    </svg>
  ),
  'sparkle': (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ animation: 'pulse-glow 1.5s infinite alternate' }}>
      <path d="M50 10 L55 45 L90 50 L55 55 L50 90 L45 55 L10 50 L45 45 Z" fill="#ffff66"/>
      <style>{`@keyframes pulse-glow { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.2); opacity: 1; } }`}</style>
    </svg>
  )
}

export default function StudioClient({ initialDecorations }: { initialDecorations: any[] }) {
  const [decorations, setDecorations] = useState(initialDecorations)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleResize = async (id: number, newSize: number) => {
    setDecorations(prev => prev.map(d => d.id === id ? { ...d, size: newSize } : d))
    await updateDecorationSize(id, newSize)
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
          startTransition(async () => {
            await addDecoration(lottieString)
            window.location.reload()
          })
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
      startTransition(async () => {
        await addDecoration(base64String) // Save base64 directly to database
        window.location.reload()
      })
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
            disabled={isPending}
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
      >
        {/* Live Website Preview */}
        <iframe 
          src="http://localhost:3001?studio=true" 
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
              width: '48px',
              height: '48px',
              fontSize: '48px',
              zIndex: 100,
              userSelect: 'none',
              touchAction: 'none'
            }}
            className="group hover:scale-110 transition-transform"
          >
            {ICONS[dec.icon_name] ? (
              ICONS[dec.icon_name]
            ) : dec.icon_name.startsWith('lottie:') ? (
              <Lottie animationData={JSON.parse(dec.icon_name.substring(7))} loop={true} className="w-full h-full pointer-events-none" />
            ) : dec.icon_name.startsWith('data:image/') ? (
              <img src={dec.icon_name} alt="Custom Decoration" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} draggable={false} />
            ) : (
              '🎉'
            )}
            
            {draggingId !== dec.id && (
              <div className="absolute -top-6 -right-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); handleResize(dec.id, Math.max(0.2, dec.size - 0.2)); }}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center cursor-pointer shadow-md"
                  title="Decrease Size"
                >
                  -
                </button>
                <button 
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); handleResize(dec.id, dec.size + 0.2); }}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center cursor-pointer shadow-md"
                  title="Increase Size"
                >
                  +
                </button>
                <button 
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); handleDelete(dec.id); }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center cursor-pointer shadow-md"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
