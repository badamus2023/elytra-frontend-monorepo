import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { subscribeMutationSuccess } from './toastBus';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Severity = 'success' | 'info' | 'warning' | 'error';
type Toast = { id: string; title: string; message?: string; severity: Severity };
type ToastContextValue = {
  showToast: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(current => [...current.slice(-2), { ...toast, id }]);
    setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);
  const value = useMemo(() => ({ showToast }), [showToast]);
  useEffect(
    () =>
      subscribeMutationSuccess(() =>
        showToast({
          title: 'Action completed',
          message: 'Your changes were saved successfully.',
          severity: 'success',
        }),
      ),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={styles.stack}>
        {toasts.map(toast => (
          <Pressable
            key={toast.id}
            accessibilityRole="alert"
            onPress={() => dismiss(toast.id)}
            style={[styles.toast, styles[toast.severity]]}>
            <Text style={styles.title}>{toast.title}</Text>
            {toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}
          </Pressable>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const styles = StyleSheet.create({
  stack: { position: 'absolute', top: 52, left: 16, right: 16, zIndex: 100 },
  toast: { borderRadius: 12, borderWidth: 1, marginBottom: 8, padding: 14 },
  success: { backgroundColor: '#ecfdf5', borderColor: '#6ee7b7' },
  info: { backgroundColor: '#f0f9ff', borderColor: '#7dd3fc' },
  warning: { backgroundColor: '#fffbeb', borderColor: '#fcd34d' },
  error: { backgroundColor: '#fff1f2', borderColor: '#fda4af' },
  title: { color: '#0f172a', fontSize: 14, fontWeight: '700' },
  message: { color: '#475569', fontSize: 12, marginTop: 3 },
});
