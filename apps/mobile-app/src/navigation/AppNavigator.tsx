import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PortalNavigator from './PortalNavigator';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Portal" component={PortalNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
