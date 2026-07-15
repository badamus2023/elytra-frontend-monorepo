import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateCategoryRequest,
  CreateDeliveryPointRequest,
  CreateDispatchRequest,
  CreateDroneRequest,
  CreateOrderRequest,
  CreateProductRequest,
  CreateRestaurantRequest,
  CreateReviewRequest,
  RegisterRequest,
  RestaurantResponse,
  UpdateCategoryRequest,
  UpdateDeliveryPointRequest,
  UpdateDroneRequest,
  UpdateProductRequest,
  UpdateRestaurantRequest,
  UpdateReviewRequest,
} from '../../api/model'
import {
  deleteApiCategoriesId,
  deleteApiDeliveryPointsId,
  deleteApiDronesDroneId,
  deleteApiProductsId,
  deleteApiRestaurantsId,
  deleteApiReviewsReviewId,
  patchApiCategoriesId,
  patchApiDeliveryPointsId,
  patchApiDispatchesDispatchIdStatus,
  patchApiDronesDroneId,
  patchApiProductsId,
  patchApiRestaurantsId,
  patchApiReviewsReviewId,
  postApiAuthForgotPassword,
  postApiAuthRegister,
  postApiAuthResendVerification,
  postApiAuthResetPassword,
  postApiAuthVerifyEmail,
  postApiCategories,
  postApiDeliveryPoints,
  postApiDispatches,
  postApiDispatchesDispatchIdSimulate,
  postApiDrones,
  postApiOrders,
  postApiOrdersOrderIdCancel,
  postApiPaymentsConfirm,
  postApiPaymentsOrderOrderIdCheckout,
  postApiProducts,
  postApiRestaurants,
  postApiReviews,
} from '../../api/client'
import { assertOk, withAuth } from '../../api/withAuth'

function useInvalidate(keys: string[]) {
  const queryClient = useQueryClient()
  return () => {
    for (const k of keys) {
      void queryClient.invalidateQueries({ queryKey: [k] })
    }
  }
}

export function useCreateDrone() {
  const invalidate = useInvalidate(['drones'])
  return useMutation({
    mutationFn: async (payload: CreateDroneRequest) => {
      const r = await postApiDrones(payload, withAuth())
      assertOk(r.status, r.data, 'Failed to create drone')
    },
    onSuccess: invalidate,
  })
}

export function useUpdateDrone() {
  const invalidate = useInvalidate(['drones'])
  return useMutation({
    mutationFn: async (args: { droneId: string; body: UpdateDroneRequest }) => {
      const r = await patchApiDronesDroneId(args.droneId, args.body, withAuth())
      assertOk(r.status, r.data, 'Failed to update drone')
    },
    onSuccess: invalidate,
  })
}

export function useDeleteDrone() {
  const invalidate = useInvalidate(['drones'])
  return useMutation({
    mutationFn: async (droneId: string) => {
      const r = await deleteApiDronesDroneId(droneId, withAuth())
      assertOk(r.status, r.data, 'Failed to delete drone')
    },
    onSuccess: invalidate,
  })
}

export function useCreateOrder() {
  const invalidate = useInvalidate(['orders'])
  return useMutation({
    mutationFn: async (payload: CreateOrderRequest) => {
      const r = await postApiOrders(payload, withAuth())
      assertOk(r.status, r.data, 'Failed to create order')
      return r.data
    },
    onSuccess: invalidate,
  })
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const r = await postApiPaymentsOrderOrderIdCheckout(orderId, withAuth())
      assertOk(r.status, r.data, 'Failed to start payment')
      return r.data
    },
  })
}

export function useConfirmPayment() {
  const invalidate = useInvalidate(['orders'])
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const r = await postApiPaymentsConfirm({ sessionId }, withAuth())
      assertOk(r.status, r.data, 'Failed to confirm payment')
      return r.data
    },
    onSuccess: invalidate,
  })
}

export function useCancelOrder() {
  const invalidate = useInvalidate(['orders'])
  return useMutation({
    mutationFn: async (orderId: string) => {
      const r = await postApiOrdersOrderIdCancel(orderId, withAuth())
      assertOk(r.status, r.data, 'Failed to cancel order')
    },
    onSuccess: invalidate,
  })
}

export function useCreateDispatch() {
  const invalidate = useInvalidate(['dispatch', 'dispatches', 'orders', 'drones'])
  return useMutation({
    mutationFn: async (payload: CreateDispatchRequest) => {
      const r = await postApiDispatches(payload, withAuth())
      assertOk(r.status, r.data, 'Failed to create dispatch')
    },
    onSuccess: invalidate,
  })
}

export function useUpdateDispatchStatus() {
  const invalidate = useInvalidate(['dispatch'])
  return useMutation({
    mutationFn: async (args: { dispatchId: string; status: string }) => {
      const r = await patchApiDispatchesDispatchIdStatus(
        args.dispatchId,
        args.status,
        withAuth({ headers: { 'Content-Type': 'application/json' } }),
      )
      assertOk(r.status, r.data, 'Failed to update dispatch status')
    },
    onSuccess: invalidate,
  })
}

export function useCreateRestaurant() {
  const invalidate = useInvalidate(['restaurants', 'restaurant'])
  return useMutation({
    mutationFn: async (payload: CreateRestaurantRequest) => {
      const r = await postApiRestaurants(payload, withAuth())
      assertOk(r.status, r.data, 'Failed to create restaurant')
      return r.data as RestaurantResponse
    },
    onSuccess: invalidate,
  })
}

export function useUpdateRestaurant() {
  const invalidate = useInvalidate(['restaurants', 'restaurant'])
  return useMutation({
    mutationFn: async (args: {
      restaurantId: string
      body: UpdateRestaurantRequest
    }) => {
      const r = await patchApiRestaurantsId(args.restaurantId, args.body, withAuth())
      assertOk(r.status, r.data, 'Failed to update restaurant')
    },
    onSuccess: invalidate,
  })
}

export function useDeleteRestaurant() {
  const invalidate = useInvalidate(['restaurants', 'restaurant', 'categories', 'products'])
  return useMutation({
    mutationFn: async (restaurantId: string) => {
      const r = await deleteApiRestaurantsId(restaurantId, withAuth())
      assertOk(r.status, r.data, 'Failed to delete restaurant')
    },
    onSuccess: invalidate,
  })
}

export function useCreateCategory() {
  const invalidate = useInvalidate(['categories'])
  return useMutation({
    mutationFn: async (payload: CreateCategoryRequest) => {
      const r = await postApiCategories(payload, withAuth())
      assertOk(r.status, r.data, 'Failed to create category')
    },
    onSuccess: invalidate,
  })
}

export function useUpdateCategory() {
  const invalidate = useInvalidate(['categories'])
  return useMutation({
    mutationFn: async (args: { categoryId: number; body: UpdateCategoryRequest }) => {
      const r = await patchApiCategoriesId(args.categoryId, args.body, withAuth())
      assertOk(r.status, r.data, 'Failed to update category')
    },
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidate(['categories', 'products'])
  return useMutation({
    mutationFn: async (categoryId: number) => {
      const r = await deleteApiCategoriesId(categoryId, withAuth())
      assertOk(r.status, r.data, 'Failed to delete category')
    },
    onSuccess: invalidate,
  })
}

export function useCreateProduct() {
  const invalidate = useInvalidate(['products'])
  return useMutation({
    mutationFn: async (payload: CreateProductRequest) => {
      const r = await postApiProducts(payload, withAuth())
      assertOk(r.status, r.data, 'Failed to create product')
    },
    onSuccess: invalidate,
  })
}

export function useUpdateProduct() {
  const invalidate = useInvalidate(['products'])
  return useMutation({
    mutationFn: async (args: { productId: string; body: UpdateProductRequest }) => {
      const r = await patchApiProductsId(args.productId, args.body, withAuth())
      assertOk(r.status, r.data, 'Failed to update product')
    },
    onSuccess: invalidate,
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidate(['products'])
  return useMutation({
    mutationFn: async (productId: string) => {
      const r = await deleteApiProductsId(productId, withAuth())
      assertOk(r.status, r.data, 'Failed to delete product')
    },
    onSuccess: invalidate,
  })
}

export function useCreateReview() {
  const invalidate = useInvalidate(['reviews'])
  return useMutation({
    mutationFn: async (payload: CreateReviewRequest) => {
      const r = await postApiReviews(payload, withAuth())
      assertOk(r.status, r.data, 'Failed to submit review')
    },
    onSuccess: invalidate,
  })
}

export function useUpdateReview() {
  const invalidate = useInvalidate(['reviews'])
  return useMutation({
    mutationFn: async (args: { reviewId: string; body: UpdateReviewRequest }) => {
      const r = await patchApiReviewsReviewId(args.reviewId, args.body, withAuth())
      assertOk(r.status, r.data, 'Failed to update review')
    },
    onSuccess: invalidate,
  })
}

export function useDeleteReview() {
  const invalidate = useInvalidate(['reviews'])
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const r = await deleteApiReviewsReviewId(reviewId, withAuth())
      assertOk(r.status, r.data, 'Failed to delete review')
    },
    onSuccess: invalidate,
  })
}

export function useRegisterUser() {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const r = await postApiAuthRegister(payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      assertOk(r.status, r.data, 'Registration failed')
    },
  })
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const r = await postApiAuthVerifyEmail(
        { token },
        { headers: { 'Content-Type': 'application/json' } },
      )
      assertOk(r.status, r.data, 'Verification failed')
    },
  })
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: async (email: string) => {
      const r = await postApiAuthResendVerification(
        { email },
        { headers: { 'Content-Type': 'application/json' } },
      )
      assertOk(r.status, r.data, 'Could not resend email')
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const r = await postApiAuthForgotPassword(
        { email },
        { headers: { 'Content-Type': 'application/json' } },
      )
      assertOk(r.status, r.data, 'Request failed')
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (args: {
      token: string
      newPassword: string
      confirmPassword: string
    }) => {
      const r = await postApiAuthResetPassword(args, {
        headers: { 'Content-Type': 'application/json' },
      })
      assertOk(r.status, r.data, 'Password reset failed')
    },
  })
}

export function useSimulateDispatch() {
  const invalidate = useInvalidate(['dispatch', 'drones', 'orders'])
  return useMutation({
    mutationFn: async (dispatchId: string) => {
      const r = await postApiDispatchesDispatchIdSimulate(dispatchId, withAuth())
      assertOk(r.status, r.data, 'Failed to start simulation')
    },
    onSuccess: invalidate,
  })
}

export function useCreateDeliveryPoint() {
  const invalidate = useInvalidate(['delivery-points'])
  return useMutation({
    mutationFn: async (payload: CreateDeliveryPointRequest) => {
      const r = await postApiDeliveryPoints(payload, withAuth())
      assertOk(r.status, r.data, 'Failed to create pickup point')
      return r.data
    },
    onSuccess: invalidate,
  })
}

export function useUpdateDeliveryPoint() {
  const invalidate = useInvalidate(['delivery-points'])
  return useMutation({
    mutationFn: async (args: { id: string; body: UpdateDeliveryPointRequest }) => {
      const r = await patchApiDeliveryPointsId(args.id, args.body, withAuth())
      assertOk(r.status, r.data, 'Failed to update pickup point')
      return r.data
    },
    onSuccess: invalidate,
  })
}

export function useDeactivateDeliveryPoint() {
  const invalidate = useInvalidate(['delivery-points'])
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await deleteApiDeliveryPointsId(id, withAuth())
      assertOk(r.status, r.data, 'Failed to deactivate pickup point')
      return r.data
    },
    onSuccess: invalidate,
  })
}
