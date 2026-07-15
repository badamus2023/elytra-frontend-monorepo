import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import styled, { useTheme } from 'styled-components/native';
import { useAuth } from '../auth/AuthContext';
import CustomerDashboardScreen from '../screens/portal/CustomerDashboardScreen';
import MyPackagesScreen from '../screens/portal/MyPackagesScreen';
import TrackDeliveryScreen from '../screens/portal/TrackDeliveryScreen';
import CustomerProfileScreen from '../screens/portal/CustomerProfileScreen';
import RestaurantsStack from './RestaurantsStack';
import type { PortalTabParamList } from './types';

const Tab = createBottomTabNavigator<PortalTabParamList>();

const LogoutPressable = styled.Pressable`
  margin-right: 12px;
  padding-vertical: 4px;
  padding-horizontal: 8px;
`;

const LogoutText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.link};
`;

const LogoutButton = () => {
  const { signOut } = useAuth();
  return (
    <LogoutPressable onPress={() => signOut()}>
      <LogoutText>Logout</LogoutText>
    </LogoutPressable>
  );
};

const PortalNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerTitle: 'Customer Portal',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.white },
        headerTitleStyle: { fontWeight: '600', fontSize: 16 },
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: theme.colors.link,
        tabBarInactiveTintColor: theme.colors.placeholder,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={CustomerDashboardScreen}
        options={{ title: 'Dashboard', tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Restaurants"
        component={RestaurantsStack}
        options={{ title: 'Restaurants', tabBarLabel: 'Restaurants', headerShown: false }}
      />
      <Tab.Screen
        name="MyOrders"
        component={MyPackagesScreen}
        options={{ title: 'My orders', tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="Track"
        component={TrackDeliveryScreen}
        options={{ title: 'Track delivery', tabBarLabel: 'Track' }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default PortalNavigator;
