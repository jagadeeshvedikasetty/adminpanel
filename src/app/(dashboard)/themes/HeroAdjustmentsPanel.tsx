'use client'

import { useState, useEffect, useTransition } from 'react'
import { updateHeroAdjustments } from './actions'

export default function HeroAdjustmentsPanel({ 
  onClose,
  activeTheme,
  onChange
}: { 
  onClose: () => void,
  activeTheme?: any,
  onChange?: (adjustments: any) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [desktopHeight, setDesktopHeight] = useState(activeTheme?.hero_desktop_height ?? 100)
  const [mobileHeight, setMobileHeight] = useState(activeTheme?.hero_mobile_height ?? 60)
  const [desktopPosition, setDesktopPosition] = useState(activeTheme?.hero_desktop_position ?? 'center')
  const [mobilePosition, setMobilePosition] = useState(activeTheme?.hero_mobile_position ?? 'center')
  const [desktopZoom, setDesktopZoom] = useState(activeTheme?.hero_desktop_zoom ?? 1.0)
  const [mobileZoom, setMobileZoom] = useState(activeTheme?.hero_mobile_zoom ?? 1.0)

  // Notify parent of live changes
  useEffect(() => {
    if (onChange) {
      onChange({
        desktopHeight, mobileHeight,
        desktopPosition, mobilePosition,
        desktopZoom, mobileZoom
      })
    }
  }, [desktopHeight, mobileHeight, desktopPosition, mobilePosition, desktopZoom, mobileZoom])

  // Listen for dragged positions from the live preview
  useEffect(() => {
    const handleDrag = (e: any) => {
      const { isMobile, position } = e.detail;
      if (isMobile) {
        setMobilePosition(position);
      } else {
        setDesktopPosition(position);
      }
    };
    window.addEventListener('HERO_POSITION_CHANGED', handleDrag);
    return () => window.removeEventListener('HERO_POSITION_CHANGED', handleDrag);
  }, []);

  return (
    <div className="w-[280px]">


      <form action={(fd) => {
        startTransition(async () => {
          await updateHeroAdjustments(fd);
          onClose();
        });
      }} className="space-y-4">
        {/* Desktop */}
        <div className="space-y-2">
          <h4 className="text-[10px] text-orange-400 font-semibold uppercase">Desktop</h4>
          <div className="flex items-center gap-3">
            <span className="text-[9px] w-12 text-[#a0a0c0]">Height</span>
            <input type="range" name="heroDesktopHeight" min="30" max="100" value={desktopHeight} onChange={e => setDesktopHeight(Number(e.target.value))} className="flex-1 accent-orange-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
            <span className="text-[9px] w-8 text-right">{desktopHeight}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] w-12 text-[#a0a0c0]">Zoom</span>
            <input type="range" name="heroDesktopZoom" min="1" max="2" step="0.05" value={desktopZoom} onChange={e => setDesktopZoom(Number(e.target.value))} className="flex-1 accent-orange-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
            <span className="text-[9px] w-8 text-right">{desktopZoom.toFixed(2)}x</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] w-12 text-[#a0a0c0]">Crop</span>
            <select name="heroDesktopPosition" value={desktopPosition} onChange={e => setDesktopPosition(e.target.value)} className="flex-1 bg-white/10 border-none rounded px-2 py-1 text-[10px] text-white">
              {![ 'center', 'top', 'bottom', 'left', 'right' ].includes(desktopPosition) && (
                <option className="bg-[#2d2d44] text-white" value={desktopPosition}>Custom</option>
              )}
              <option className="bg-[#2d2d44] text-white" value="center">Center</option>
              <option className="bg-[#2d2d44] text-white" value="top">Top</option>
              <option className="bg-[#2d2d44] text-white" value="bottom">Bottom</option>
              <option className="bg-[#2d2d44] text-white" value="left">Left</option>
              <option className="bg-[#2d2d44] text-white" value="right">Right</option>
            </select>
          </div>
        </div>

        <div className="border-t border-white/10 my-2"></div>

        {/* Mobile */}
        <div className="space-y-2">
          <h4 className="text-[10px] text-orange-400 font-semibold uppercase">Mobile</h4>
          <div className="flex items-center gap-3">
            <span className="text-[9px] w-12 text-[#a0a0c0]">Height</span>
            <input type="range" name="heroMobileHeight" min="30" max="100" value={mobileHeight} onChange={e => setMobileHeight(Number(e.target.value))} className="flex-1 accent-orange-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
            <span className="text-[9px] w-8 text-right">{mobileHeight}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] w-12 text-[#a0a0c0]">Zoom</span>
            <input type="range" name="heroMobileZoom" min="1" max="2" step="0.05" value={mobileZoom} onChange={e => setMobileZoom(Number(e.target.value))} className="flex-1 accent-orange-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
            <span className="text-[9px] w-8 text-right">{mobileZoom.toFixed(2)}x</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] w-12 text-[#a0a0c0]">Crop</span>
            <select name="heroMobilePosition" value={mobilePosition} onChange={e => setMobilePosition(e.target.value)} className="flex-1 bg-white/10 border-none rounded px-2 py-1 text-[10px] text-white">
              {![ 'center', 'top', 'bottom', 'left', 'right' ].includes(mobilePosition) && (
                <option className="bg-[#2d2d44] text-white" value={mobilePosition}>Custom</option>
              )}
              <option className="bg-[#2d2d44] text-white" value="center">Center</option>
              <option className="bg-[#2d2d44] text-white" value="top">Top</option>
              <option className="bg-[#2d2d44] text-white" value="bottom">Bottom</option>
              <option className="bg-[#2d2d44] text-white" value="left">Left</option>
              <option className="bg-[#2d2d44] text-white" value="right">Right</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={isPending} className="w-full mt-4 bg-orange-500 text-white text-xs py-2 rounded font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isPending ? 'Saving...' : 'Save Adjustments'}
        </button>
      </form>
    </div>
  )
}
