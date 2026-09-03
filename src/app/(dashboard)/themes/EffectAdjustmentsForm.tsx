'use client'

import { updateEffectSettings, updateThemeEffect, createCustomEffect, deleteCustomEffect } from './actions'
import { useTransition, useState, useRef } from 'react'

// Mirror the particle count logic from EffectsOverlay so the label is accurate
function getParticleCount(activeEffect: string | null, density: number) {
  if (!activeEffect) return null;
  const d = density;
  switch (activeEffect) {
    case 'rain':       return { count: Math.max(1, Math.round(50 * d)), unit: 'raindrops' };
    case 'snow':       return { count: Math.max(1, Math.round(60 * d)), unit: 'snowflakes' };
    case 'confetti':   return { count: Math.max(1, Math.round(60 * d)), unit: 'pieces' };
    case 'kites':      return { count: Math.max(1, Math.round(15 * d)), unit: 'kites' };
    case 'sparkles':   return { count: Math.max(1, Math.round(30 * d)), unit: 'sparkles' };
    default:           return { count: Math.max(1, Math.round(30 * d)), unit: 'particles' };
  }
}

export default function EffectAdjustmentsForm({ activeTheme, customEffects, onSaveCallback }: { activeTheme: any, customEffects: any[], onSaveCallback?: () => void }) {
  const [isPending, startTransition] = useTransition()
  
  const [newEffectName, setNewEffectName] = useState('')
  const [newEffectAnim, setNewEffectAnim] = useState('falling')
  const [isCreating, setIsCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Live slider states
  const [opacity, setOpacity] = useState<number>(activeTheme?.effect_opacity ?? 0.7)
  const [scale, setScale] = useState<number>(activeTheme?.effect_scale ?? 1.0)
  const [speed, setSpeed] = useState<number>(activeTheme?.effect_speed ?? 1.0)
  const [density, setDensity] = useState<number>(activeTheme?.effect_density ?? 1.0)
  const [duration, setDuration] = useState<number>(activeTheme?.effect_duration ?? 0)

  const particleInfo = getParticleCount(activeTheme?.active_effect, density)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEffectName || !fileInputRef.current?.files?.[0]) return
    
    setIsCreating(true)
    const formData = new FormData()
    formData.append('name', newEffectName)
    formData.append('animation_type', newEffectAnim)
    formData.append('file', fileInputRef.current.files[0])
    
    startTransition(async () => {
      const result = await createCustomEffect(formData)
      if (result && !result.success) {
        alert("Error creating effect: " + result.error)
      }
      setIsCreating(false)
      setNewEffectName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this effect?')) return
    startTransition(async () => {
      await deleteCustomEffect(id)
      if (activeTheme?.active_effect === id) {
        await updateThemeEffect(null)
      }
    })
  }

  const handleActivate = (id: string) => {
    startTransition(async () => {
      await updateThemeEffect(id)
    })
  }

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateEffectSettings(formData)
      if (onSaveCallback) onSaveCallback()
    })
  }

  return (
    <div className="w-full">
      {/* Sliders */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-white/80 mb-1 flex justify-between items-center">
            <span>Opacity (Transparency)</span>
            <span className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">{Math.round(opacity * 100)}%</span>
          </label>
          <input 
            type="range" name="opacity" min="0.1" max="1" step="0.05" 
            value={opacity}
            onChange={e => setOpacity(parseFloat(e.target.value))}
            className="w-full accent-orange-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/80 mb-1 flex justify-between items-center">
            <span>Scale (Size)</span>
            <span className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">{scale.toFixed(1)}x</span>
          </label>
          <input 
            type="range" name="scale" min="0.5" max="3" step="0.1" 
            value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            className="w-full accent-orange-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/80 mb-1 flex justify-between items-center">
            <span>Speed</span>
            <span className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">{speed.toFixed(1)}x</span>
          </label>
          <input 
            type="range" name="speed" min="0.2" max="3" step="0.1" 
            value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-orange-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/80 mb-1 flex justify-between items-center">
            <span>Amount of Particles</span>
            <span className="text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded text-xs">
              {particleInfo
                ? `${particleInfo.count} ${particleInfo.unit}`
                : `${density.toFixed(1)}x`}
            </span>
          </label>
          <input 
            type="range" name="density" min="0.1" max="3" step="0.1" 
            value={density}
            onChange={e => setDensity(parseFloat(e.target.value))}
            className="w-full accent-orange-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          {particleInfo && (
            <p className="text-sm text-white/40 mt-1">
              Move the slider to change how many {particleInfo.unit} appear
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-white/80 mb-1 flex justify-between items-center">
            <span>Duration (Timer)</span>
          </label>
          <select 
            name="duration" 
            value={duration}
            onChange={e => setDuration(parseInt(e.target.value, 10))}
            className="w-full bg-[#1e1e2e] text-white/90 border border-[#2d2d44] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500"
          >
            <option value="0">Infinite</option>
            <option value="5">5 seconds</option>
            <option value="10">10 seconds</option>
            <option value="30">30 seconds</option>
          </select>
          <p className="text-sm text-white/40 mt-1">
            If a time is selected, the effect will smoothly fade out after it finishes.
          </p>
        </div>

        <button 
          type="submit" disabled={isPending}
          className="mt-4 w-full py-2 rounded text-sm font-bold transition-all bg-orange-500 text-white hover:bg-orange-600 shadow-lg disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Adjustments'}
        </button>
      </form>
    </div>
  )
}

