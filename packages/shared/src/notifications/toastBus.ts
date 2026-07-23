type Listener = (title: string) => void
const listeners = new Set<Listener>()

export function emitMutationSuccess(title = 'Action completed') {
  for (const listener of listeners) listener(title)
}

export function subscribeMutationSuccess(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
