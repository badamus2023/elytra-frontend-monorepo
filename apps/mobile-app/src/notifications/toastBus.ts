type Listener = () => void;
const listeners = new Set<Listener>();

export function emitMutationSuccess() {
  for (const listener of listeners) listener();
}

export function subscribeMutationSuccess(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
