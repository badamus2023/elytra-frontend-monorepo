import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { usePostApiOrdersOrderIdConfirmReceipt } from '../api/generated/order/order';
import { useAuth } from '../auth/AuthContext';
import { useOrders } from '../hooks/useOrders';

export function CustomerReceiptGate() {
  const { isLoggedIn } = useAuth();
  const { data: orders } = useOrders();
  const queryClient = useQueryClient();
  const confirmReceipt = usePostApiOrdersOrderIdConfirmReceipt();
  const [error, setError] = useState('');

  const order = useMemo(
    () =>
      [...orders]
        .filter(item => item.status?.toLowerCase() === 'delivered')
        .sort((a, b) =>
          String(a.updatedAt ?? a.createdAt).localeCompare(
            String(b.updatedAt ?? b.createdAt),
          ),
        )[0],
    [orders],
  );

  if (!isLoggedIn || !order?.id) return null;

  const confirm = async () => {
    setError('');
    try {
      await confirmReceipt.mutateAsync({ orderId: order.id });
      await queryClient.invalidateQueries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm receipt.');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible
      onRequestClose={() => undefined}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.card}>
          <Text style={styles.eyebrow}>DELIVERY ARRIVED</Text>
          <Text style={styles.title}>Confirm receipt</Text>
          <Text style={styles.body}>
            Your drone reports that order {order.id.slice(0, 8)} reached{' '}
            {order.deliveryAddress}. Confirm receipt to complete the order.
          </Text>
          <View style={styles.summary}>
            <Text>{order.items?.length ?? 0} line item(s)</Text>
            <Text style={styles.total}>
              Total: {Number(order.totalAmount ?? 0).toFixed(2)}
            </Text>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            disabled={confirmReceipt.isPending}
            onPress={confirm}
            style={styles.button}>
            {confirmReceipt.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>I received my order</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2,6,23,0.75)',
    padding: 20,
  },
  card: { width: '100%', maxWidth: 440, borderRadius: 20, backgroundColor: '#fff', padding: 24 },
  eyebrow: { color: '#047857', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  title: { color: '#0f172a', fontSize: 22, fontWeight: '700', marginTop: 8 },
  body: { color: '#475569', fontSize: 14, lineHeight: 21, marginTop: 8 },
  summary: { backgroundColor: '#f8fafc', borderRadius: 10, marginTop: 16, padding: 12 },
  total: { color: '#0f172a', fontWeight: '700', marginTop: 4 },
  error: { color: '#be123c', marginTop: 12 },
  button: { alignItems: 'center', backgroundColor: '#059669', borderRadius: 10, marginTop: 20, minHeight: 46, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
