'use client'

import { useState, useEffect } from 'react'

export default function ClientSidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile && isOpen) {
        setIsOpen(false)
      }
    }
    
    // Initial check
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <aside className={`transition-all duration-300 ease-in-out bg-[#1e1e2e] flex flex-col h-screen overflow-hidden shrink-0 ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative z-40'} ${isOpen ? 'w-[300px] min-w-[300px] shadow-2xl' : 'w-0 min-w-0'}`}>
        <div className={`w-[300px] flex flex-col h-full transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {children}
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[60] p-2 text-white transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? 'top-3 left-[255px] bg-[#1e1e2e] rounded-md shadow-md border border-[#2d2d44] hover:bg-[#2d2d44]' 
            : isMobile 
              ? 'bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl rounded-full w-12 h-12 border-none' 
              : 'top-3 left-3 bg-[#1e1e2e] rounded-md shadow-md border border-[#2d2d44] hover:bg-[#2d2d44]'
        }`}
        title={isOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        <span className={`leading-none flex items-center justify-center ${!isOpen && isMobile ? 'text-xl' : 'text-xs w-4 h-4'}`}>
          {isOpen ? '◀' : '☰'}
        </span>
      </button>
    </>
  )
}

