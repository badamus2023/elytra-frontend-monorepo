import {
  CircleUserRound,
  House,
  MapPinned,
  ReceiptText,
  Utensils,
} from 'lucide-react-native';
import type { PortalTabParamList } from './types';

type TabIconProps = {
  color: string;
  size: number;
};

export const portalTabIcons: Record<
  keyof PortalTabParamList,
  (props: TabIconProps) => React.JSX.Element
> = {
  Dashboard: ({ color, size }) => (
    <House color={color} size={size} strokeWidth={2.2} />
  ),
  Restaurants: ({ color, size }) => (
    <Utensils color={color} size={size} strokeWidth={2.2} />
  ),
  MyOrders: ({ color, size }) => (
    <ReceiptText color={color} size={size} strokeWidth={2.2} />
  ),
  Track: ({ color, size }) => (
    <MapPinned color={color} size={size} strokeWidth={2.2} />
  ),
  Profile: ({ color, size }) => (
    <CircleUserRound color={color} size={size} strokeWidth={2.2} />
  ),
};
