import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'styled-components/native';
import CheckoutScreen from '../screens/portal/CheckoutScreen';
import OrderConfirmedScreen from '../screens/portal/OrderConfirmedScreen';
import RestaurantDetailScreen from '../screens/portal/RestaurantDetailScreen';
import RestaurantsListScreen from '../screens/portal/RestaurantsListScreen';
import type { RestaurantsStackParamList } from './types';

const Stack = createNativeStackNavigator<RestaurantsStackParamList>();

const RestaurantsStack = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.white },
        headerTitleStyle: { fontWeight: '600', fontSize: 16 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="RestaurantsList"
        component={RestaurantsListScreen}
        options={{ title: 'Restaurants' }}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ title: 'Menu' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="OrderConfirmed"
        component={OrderConfirmedScreen}
        options={{ title: 'Order placed', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
};

export default RestaurantsStack;
