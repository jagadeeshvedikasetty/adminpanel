import React from 'react'

export const ICONS: Record<string, React.ReactNode> = {
  'kite': (
    <svg viewBox="0 0 100 100" className="w-full h-full" overflow="visible">
      <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="#ff4d4d"/>
      <path d="M50 10 L90 50 L50 50 Z" fill="#ff1a1a"/>
      <path d="M50 90 L50 10" stroke="white" strokeWidth="2"/>
      <path d="M10 50 L90 50" stroke="white" strokeWidth="2"/>
      <path d="M50 90 Q35 110 50 130 T50 170" stroke="rgba(255,255,255,0.7)" strokeWidth="3" fill="none" />
    </svg>
  ),
  'diya': (
    <svg viewBox="0 0 100 100" className="w-full h-full" overflow="visible">
      <path d="M20 60 Q50 90 80 60 Z" fill="#cc6600"/>
      <ellipse cx="50" cy="60" rx="30" ry="10" fill="#994d00"/>
      <path d="M50 55 Q40 30 50 20 Q60 30 50 55 Z" fill="#ffcc00" style={{ animation: 'flicker 0.5s infinite alternate', transformOrigin: 'bottom center' }}/>
      <style>{`@keyframes flicker { 0% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.1) rotate(-2deg); opacity: 0.9; } 100% { transform: scale(0.9) rotate(2deg); opacity: 1; } }`}</style>
    </svg>
  ),
  'mango': (
    <svg viewBox="0 0 100 100" className="w-full h-full" overflow="visible" style={{ animation: 'bounce-slow 2s infinite ease-in-out alternate' }}>
      <path d="M30 70 C 10 70, 10 30, 40 20 C 70 10, 90 40, 80 60 C 70 80, 50 70, 30 70 Z" fill="#ffcc00"/>
      <path d="M40 20 Q50 10 60 5" stroke="green" strokeWidth="4" fill="none"/>
      <path d="M50 10 Q65 10 70 20 Q55 25 50 10 Z" fill="green"/>
      <style>{`@keyframes bounce-slow { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }`}</style>
    </svg>
  ),
  'flower': (
    <svg viewBox="0 0 100 100" className="w-full h-full" overflow="visible" style={{ animation: 'spin-slow 10s linear infinite', transformOrigin: 'center' }}>
      <circle cx="50" cy="50" r="15" fill="#ffcc00"/>
      <path d="M50 15 C60 15, 65 35, 50 35 C35 35, 40 15, 50 15 Z" fill="#ff66b2"/>
      <path d="M50 85 C60 85, 65 65, 50 65 C35 65, 40 85, 50 85 Z" fill="#ff66b2"/>
      <path d="M15 50 C15 60, 35 65, 35 50 C35 35, 15 40, 15 50 Z" fill="#ff66b2"/>
      <path d="M85 50 C85 60, 65 65, 65 50 C65 35, 85 40, 85 50 Z" fill="#ff66b2"/>
      <style>{`@keyframes spin-slow { 100% { transform: rotate(360deg); } }`}</style>
    </svg>
  ),
  'sparkle': (
    <svg viewBox="0 0 100 100" className="w-full h-full" overflow="visible" style={{ animation: 'pulse-glow 1.5s infinite alternate' }}>
      <path d="M50 10 L55 45 L90 50 L55 55 L50 90 L45 55 L10 50 L45 45 Z" fill="#ffff66"/>
      <style>{`@keyframes pulse-glow { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.2); opacity: 1; } }`}</style>
    </svg>
  )
}
