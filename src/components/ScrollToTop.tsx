// src/components/ScrollToTop.tsx
'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ScrollToTop(): null {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll na vrh kada se promijeni ruta
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}