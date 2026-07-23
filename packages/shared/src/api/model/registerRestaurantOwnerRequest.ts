export interface RegisterRestaurantOwnerRequest {
  email: string
  password: string
  confirmPassword: string
  companyName: string
  taxId: string
  contactPhone: string
  restaurantName: string
  address: string
  latitude: number
  longitude: number
  description?: string | null
  openTime: string
  closeTime: string
}
