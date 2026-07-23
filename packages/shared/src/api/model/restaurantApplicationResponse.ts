export interface RestaurantApplicationResponse {
  id?: string
  userId?: string
  email?: string
  companyName?: string
  taxId?: string
  contactPhone?: string
  restaurantName?: string
  address?: string
  latitude?: number
  longitude?: number
  description?: string | null
  openTime?: string
  closeTime?: string
  status?: string
  adminNote?: string | null
  createdAt?: string
  reviewedAt?: string | null
  restaurantId?: string | null
}
