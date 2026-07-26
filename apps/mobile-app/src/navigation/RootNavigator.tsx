import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import styled from 'styled-components/native';
import { useAuth } from '../auth/AuthContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

const linking = {
  prefixes: ['drones://'],
  config: {
    screens: {
      VerifyEmail: 'verify-email',
      ResetPassword: 'reset-password',
    },
  },
};

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const RootNavigator = () => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn === null) {
    return (
      <LoadingContainer>
        <ActivityIndicator />
      </LoadingContainer>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
