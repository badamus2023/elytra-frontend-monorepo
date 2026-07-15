import { useQuery } from '@tanstack/react-query';
import { customInstance } from '../api/axios-instance';
import type {
  CategoryResponse,
  ProductResponse,
  RestaurantResponse,
} from '../api/domain';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: () =>
      customInstance<RestaurantResponse[]>({
        url: '/api/restaurants',
        method: 'GET',
      }),
  });
}

export function useRestaurant(restaurantId: string) {
  return useQuery({
    queryKey: ['restaurants', restaurantId],
    queryFn: () =>
      customInstance<RestaurantResponse>({
        url: `/api/restaurants/${restaurantId}`,
        method: 'GET',
      }),
    enabled: Boolean(restaurantId),
  });
}

export function useCategoriesByRestaurant(restaurantId: string) {
  return useQuery({
    queryKey: ['categories', 'restaurant', restaurantId],
    queryFn: () =>
      customInstance<CategoryResponse[]>({
        url: `/api/categories/restaurant/${restaurantId}`,
        method: 'GET',
      }),
    enabled: Boolean(restaurantId),
  });
}

export function useProductsByRestaurant(restaurantId: string) {
  return useQuery({
    queryKey: ['products', 'restaurant', restaurantId],
    queryFn: () =>
      customInstance<ProductResponse[]>({
        url: `/api/products/restaurant/${restaurantId}`,
        method: 'GET',
      }),
    enabled: Boolean(restaurantId),
  });
}
