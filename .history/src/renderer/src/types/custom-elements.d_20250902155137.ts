// Type declaration for Vue custom element used inside React (TSX)
import type React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'data-viz-app': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

export {}
