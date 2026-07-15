export type DroneResponse = {
  id: string;
  name: string;
  status: string;
  batteryLevel: number;
  maxPayloadKg: number;
  currentLatitude: number;
  currentLongitude: number;
  lastSeenAt?: string | null;
  createdAt: string;
};

export type OrderItemResponse = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type OrderResponse = {
  id: string;
  userId: string;
  status: string;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string | null;
  items: OrderItemResponse[];
};

export type AuthUser = {
  id: string;
  email: string;
  roles: string[];
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
  user: AuthUser;
};

export type DispatchResponse = {
  id: string;
  orderId: string;
  droneId: string;
  status: string;
  estimatedDeliveryMinutes?: number | null;
  estimatedDeliveryAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  droneLatitude: number;
  droneLongitude: number;
};

export type RestaurantResponse = {
  id?: string;
  name?: string | null;
  address?: string | null;
  latitude?: number;
  longitude?: number;
  isOpen?: boolean;
  description?: string | null;
  imageUrl?: string | null;
  averageRating?: number;
  reviewCount?: number;
};

export type CategoryResponse = {
  id?: number;
  restaurantId?: string;
  name?: string | null;
};

export type ProductResponse = {
  id?: string;
  categoryId?: number;
  name?: string | null;
  description?: string | null;
  price?: number;
  isAvailable?: boolean;
};
