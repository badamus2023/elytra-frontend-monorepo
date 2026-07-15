import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import {
  AuthScreen,
  ControlledFormField,
  FormMessage,
  LinkButton,
  PrimaryButton,
} from '../components/auth';
import { usePostApiAuthRegister } from '../api/generated/auth/auth';
import type { RegisterRequest } from '../api/model';
import type { AuthStackParamList } from '../navigation/types';
import { getErrorMessage } from '../utils/getErrorMessage';

type RegisterNavigation = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

const Subtitle = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterNavigation>();
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { control, handleSubmit, getValues } = useForm<RegisterRequest>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { mutateAsync, isPending } = usePostApiAuthRegister();

  const onSubmit = async (data: RegisterRequest) => {
    setFormError(null);

    try {
      await mutateAsync({ data });
      setDone(true);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Registration failed'));
    }
  };

  if (done) {
    return (
      <AuthScreen>
        <FormMessage
          variant="success"
          message="Check your inbox. We sent a verification link — confirm your email before signing in."
        />
        <LinkButton
          label="Open email verification"
          onPress={() => navigation.navigate('VerifyEmail')}
        />
        <LinkButton
          label="Go to sign in"
          onPress={() => navigation.navigate('Login', { registered: true })}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <Subtitle>
        New accounts receive the User role. You must verify your email before
        signing in.
      </Subtitle>

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

      <ControlledFormField
        control={control}
        name="confirmPassword"
        placeholder="Confirm password"
        secureTextEntry
        rules={{
          required: 'Confirm password is required',
          validate: value =>
            value === getValues('password') || 'Passwords do not match',
        }}
      />

      {formError ? <FormMessage message={formError} /> : null}

      {isPending ? (
        <ActivityIndicator />
      ) : (
        <PrimaryButton
          title="Create account"
          onPress={handleSubmit(onSubmit)}
        />
      )}

      <LinkButton
        label="Already have an account? Sign in"
        onPress={() => navigation.navigate('Login')}
      />

      <LinkButton
        label="Already registered? Confirm email"
        onPress={() => navigation.navigate('VerifyEmail')}
      />
    </AuthScreen>
  );
};

export default RegisterScreen;
