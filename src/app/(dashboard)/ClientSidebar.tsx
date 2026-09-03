'use client'

import { useState } from 'react'

export default function ClientSidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <aside className={`transition-all duration-300 ease-in-out bg-[#1e1e2e] flex flex-col h-screen overflow-hidden shrink-0 relative z-40 ${isOpen ? 'w-[300px] min-w-[300px]' : 'w-0 min-w-0'}`}>
        <div className={`w-[300px] flex flex-col h-full transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {children}
        </div>
      </aside>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-3 z-50 p-2 bg-[#1e1e2e] text-white rounded-md shadow-md border border-[#2d2d44] transition-all duration-300 flex items-center justify-center hover:bg-[#2d2d44] ${isOpen ? 'left-[255px]' : 'left-3'}`}
        title={isOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        <span className="text-xs leading-none w-4 h-4 flex items-center justify-center">
          {isOpen ? '◀' : '☰'}
        </span>
      </button>
    </>
  )
}
