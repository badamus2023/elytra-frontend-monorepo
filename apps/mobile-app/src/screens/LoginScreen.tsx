import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AuthScreen,
  ControlledFormField,
  FormMessage,
  LinkButton,
  PrimaryButton,
} from '../components/auth';
import { usePostApiAuthLogin } from '../api/generated/auth/auth';
import type { LoginRequest } from '../api/model';
import { parseLoginResponse } from '../api/auth/parseLoginResponse';
import { useAuth } from '../auth/AuthContext';
import { isCustomerAccount, isStaffAccount } from '../auth/workspace';
import type { AuthStackParamList } from '../navigation/types';
import { getErrorMessage } from '../utils/getErrorMessage';

type LoginNavigation = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
type LoginRoute = RouteProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginNavigation>();
  const route = useRoute<LoginRoute>();
  const { signIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const registered = route.params?.registered;
  const resetEmailSent = route.params?.resetEmailSent;
  const passwordReset = route.params?.passwordReset;
  const emailVerified = route.params?.emailVerified;

  const { control, handleSubmit } = useForm<LoginRequest>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutateAsync, isPending } = usePostApiAuthLogin();

  const onSubmit = async (data: LoginRequest) => {
    setFormError(null);

    try {
      const response = await mutateAsync({ data });
      const auth = parseLoginResponse(response);
      if (isStaffAccount(auth.user.roles) && !isCustomerAccount(auth.user.roles)) {
        throw new Error(
          'Staff accounts should use the admin web portal. This app is for customers only.',
        );
      }
      if (!isCustomerAccount(auth.user.roles)) {
        throw new Error('This account cannot sign in to the customer app.');
      }
      await signIn(auth);
    } catch (error) {
      const message = getErrorMessage(error, 'Login failed');
      if (/verify|verified|EMAIL_NOT_VERIFIED/i.test(message)) {
        setFormError(
          `${message} Open "Confirm email" below to verify your account.`,
        );
      } else {
        setFormError(message);
      }
    }
  };

  return (
    <AuthScreen>
      <ControlledFormField
        control={control}
        name="email"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        rules={{ required: 'Email is required' }}
      />

      <ControlledFormField
        control={control}
        name="password"
        placeholder="Password"
        secureTextEntry
        rules={{ required: 'Password is required' }}
      />

      {registered ? (
        <FormMessage
          variant="success"
          message="Account created. Sign in with your credentials."
        />
      ) : null}

      {resetEmailSent ? (
        <FormMessage
          variant="success"
          message="If an account exists for that email, a reset link has been sent."
        />
      ) : null}

      {passwordReset ? (
        <FormMessage
          variant="success"
          message="Password updated. You can sign in now."
        />
      ) : null}

      {emailVerified ? (
        <FormMessage
          variant="success"
          message="Email verified. Sign in with your credentials."
        />
      ) : null}

      {formError ? <FormMessage message={formError} /> : null}

      {isPending ? (
        <ActivityIndicator />
      ) : (
        <PrimaryButton title="Sign in" onPress={handleSubmit(onSubmit)} />
      )}

      <LinkButton
        label="Confirm email"
        onPress={() => navigation.navigate('VerifyEmail')}
      />

      <LinkButton
        label="Forgot password?"
        onPress={() => navigation.navigate('ForgotPassword')}
      />

      <LinkButton
        label="Create an account"
        onPress={() => navigation.navigate('Register')}
      />
    </AuthScreen>
  );
};

export default LoginScreen;
