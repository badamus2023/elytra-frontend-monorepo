export type AuthStackParamList = {
  Login:
    | {
        registered?: boolean;
        resetEmailSent?: boolean;
        passwordReset?: boolean;
        emailVerified?: boolean;
      }
    | undefined;
  Register: undefined;
  VerifyEmail: { token?: string } | undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
};

export type PortalTabParamList = {
  Dashboard: undefined;
  Restaurants: undefined;
  MyOrders: undefined;
  Track: { orderId?: string } | undefined;
  Profile: undefined;
};

export type RestaurantsStackParamList = {
  RestaurantsList: undefined;
  RestaurantDetail: { restaurantId: string };
  Checkout: { restaurantId: string };
  OrderConfirmed: { orderId: string };
};

export type AppStackParamList = {
  Portal: undefined;
};
