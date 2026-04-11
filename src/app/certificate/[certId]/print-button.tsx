'use client'

import { Download } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-5 py-2 rounded-[30px] bg-[#9E50E5] hover:bg-[#7B3DB8] text-white text-sm font-semibold transition-colors"
    >
      <Download className="h-4 w-4" />
      Save as PDF
    </button>
  )
}
