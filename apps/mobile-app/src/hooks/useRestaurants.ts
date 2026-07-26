import {
  useGetApiRestaurants,
  useGetApiRestaurantsId,
} from '../api/generated/restaurant/restaurant';
import { useGetApiCategoriesRestaurantRestaurantId } from '../api/generated/category/category';
import { useGetApiProductsRestaurantRestaurantId } from '../api/generated/product/product';

export function useRestaurants() {
  return useGetApiRestaurants();
}

export function useRestaurant(restaurantId: string) {
  return useGetApiRestaurantsId(restaurantId, {
    query: { enabled: Boolean(restaurantId) },
  });
}

export function useCategoriesByRestaurant(restaurantId: string) {
  return useGetApiCategoriesRestaurantRestaurantId(restaurantId, {
    query: { enabled: Boolean(restaurantId) },
  });
}

export function useProductsByRestaurant(restaurantId: string) {
  return useGetApiProductsRestaurantRestaurantId(restaurantId, {
    query: { enabled: Boolean(restaurantId) },
  });
}
