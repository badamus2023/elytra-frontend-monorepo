import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  CategoryResponse,
  DispatchResponse,
  DroneResponse,
  OrderResponse,
  ProductResponse,
  RestaurantResponse,
  ReviewResponse,
} from "../../api/model";
import {
  getApiCategories,
  getApiCategoriesRestaurantRestaurantId,
  getApiDispatchesDispatchId,
  getApiDispatchesOrderOrderId,
  getApiDrones,
  getApiDronesAvailable,
  getApiDronesDroneId,
  getApiOrders,
  getApiOrdersOrderId,
  getApiProducts,
  getApiProductsRestaurantRestaurantId,
  getApiRestaurants,
  getApiRestaurantsId,
  getApiReviewsRestaurantRestaurantId,
} from "../../api/client";
import { assertOk, withAuth } from "../../api/withAuth";

function normalizeOrder(
  data: OrderResponse | OrderResponse[],
): OrderResponse | undefined {
  return Array.isArray(data) ? data[0] : data;
}

export function useDrones() {
  return useQuery({
    queryKey: ["drones"],
    queryFn: async (): Promise<DroneResponse[]> => {
      const r = await getApiDrones(withAuth());
      assertOk(r.status, r.data, "Failed to load drones");
      return r.data;
    },
  });
}

export function useDrone(droneId: string) {
  return useQuery({
    queryKey: ["drone", droneId],
    queryFn: async (): Promise<DroneResponse> => {
      const r = await getApiDronesDroneId(droneId, withAuth());
      assertOk(r.status, r.data, "Failed to load drone");
      return r.data;
    },
    enabled: Boolean(droneId),
  });
}

export function useAvailableDrones() {
  return useQuery({
    queryKey: ["drones", "available"],
    queryFn: async (): Promise<DroneResponse[]> => {
      const r = await getApiDronesAvailable(withAuth());
      assertOk(r.status, r.data, "Failed to load available drones");
      return r.data;
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async (): Promise<OrderResponse[]> => {
      const r = await getApiOrders(withAuth());
      assertOk(r.status, r.data, "Failed to load orders");
      return r.data;
    },
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async (): Promise<OrderResponse | undefined> => {
      const r = await getApiOrdersOrderId(orderId, withAuth());
      assertOk(r.status, r.data, "Failed to load order");
      return normalizeOrder(r.data);
    },
    enabled: Boolean(orderId),
  });
}

export function useDispatchForOrder(orderId: string) {
  return useQuery({
    queryKey: ["dispatch", "order", orderId],
    queryFn: async (): Promise<DispatchResponse | null> => {
      const r = await getApiDispatchesOrderOrderId(orderId, withAuth());
      if ((r.status as number) === 404) return null;
      assertOk(r.status, r.data, "No dispatch for this order");
      return r.data;
    },
    enabled: Boolean(orderId),
    retry: false,
  });
}

export function useDispatch(dispatchId: string) {
  return useQuery({
    queryKey: ["dispatch", dispatchId],
    queryFn: async (): Promise<DispatchResponse> => {
      const r = await getApiDispatchesDispatchId(dispatchId, withAuth());
      assertOk(r.status, r.data, "Failed to load dispatch");
      return r.data;
    },
    enabled: Boolean(dispatchId),
  });
}

export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async (): Promise<RestaurantResponse[]> => {
      const r = await getApiRestaurants(withAuth());
      assertOk(r.status, r.data, "Failed to load restaurants");
      return r.data;
    },
  });
}

export function useRestaurant(restaurantId: string) {
  return useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async (): Promise<RestaurantResponse> => {
      const r = await getApiRestaurantsId(restaurantId, withAuth());
      assertOk(r.status, r.data, "Failed to load restaurant");
      return r.data;
    },
    enabled: Boolean(restaurantId),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<CategoryResponse[]> => {
      const r = await getApiCategories(withAuth());
      assertOk(r.status, r.data, "Failed to load categories");
      return r.data;
    },
  });
}

export function useCategoriesByRestaurant(restaurantId: string) {
  return useQuery({
    queryKey: ["categories", "restaurant", restaurantId],
    queryFn: async (): Promise<CategoryResponse[]> => {
      const r = await getApiCategoriesRestaurantRestaurantId(
        restaurantId,
        withAuth(),
      );
      assertOk(r.status, r.data, "Failed to load categories");
      return r.data;
    },
    enabled: Boolean(restaurantId),
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<ProductResponse[]> => {
      const r = await getApiProducts(withAuth());
      assertOk(r.status, r.data, "Failed to load products");
      return r.data;
    },
  });
}

export function useProductsByRestaurant(restaurantId: string) {
  return useQuery({
    queryKey: ["products", "restaurant", restaurantId],
    queryFn: async (): Promise<ProductResponse[]> => {
      const r = await getApiProductsRestaurantRestaurantId(
        restaurantId,
        withAuth(),
      );
      assertOk(r.status, r.data, "Failed to load products");
      return r.data;
    },
    enabled: Boolean(restaurantId),
  });
}

export function useReviewsByRestaurant(restaurantId: string) {
  return useQuery({
    queryKey: ["reviews", "restaurant", restaurantId],
    queryFn: async (): Promise<ReviewResponse[]> => {
      const r = await getApiReviewsRestaurantRestaurantId(
        restaurantId,
        withAuth(),
      );
      assertOk(r.status, r.data, "Failed to load reviews");
      return r.data;
    },
    enabled: Boolean(restaurantId),
  });
}

export function useRestaurantNameMap() {
  const { data } = useRestaurants();
  return useMemo(() => {
    const map = new Map<string, string>();
    for (const restaurant of data ?? []) {
      if (restaurant.id) {
        map.set(restaurant.id, restaurant.name ?? "Unnamed restaurant");
      }
    }
    return map;
  }, [data]);
}
