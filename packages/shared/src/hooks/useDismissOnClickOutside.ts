import { useEffect, type RefObject } from 'react'

export function useDismissOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (ref.current?.contains(target)) return
      onDismiss()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [isOpen, onDismiss, ref])
}
