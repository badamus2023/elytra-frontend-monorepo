import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AuthScreen,
  ControlledFormField,
  FormMessage,
  LinkButton,
  PrimaryButton,
} from '../components/auth';
import { usePostApiAuthForgotPassword } from '../api/generated/auth/auth';
import type { ForgotPasswordRequest } from '../api/model';
import type { AuthStackParamList } from '../navigation/types';
import { getErrorMessage } from '../utils/getErrorMessage';

type ForgotPasswordNavigation = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordNavigation>();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotPasswordRequest>({
    defaultValues: {
      email: '',
    },
  });

  const { mutateAsync, isPending } = usePostApiAuthForgotPassword();

  const onSubmit = async (data: ForgotPasswordRequest) => {
    setFormError(null);

    try {
      await mutateAsync({ data });
      navigation.navigate('Login', { resetEmailSent: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not send reset email'));
    }
  };

  return (
    <AuthScreen>
      <FormMessage
        variant="info"
        message="Enter your email and we will send you a password reset link."
      />

      <ControlledFormField
        control={control}
        name="email"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        rules={{ required: 'Email is required' }}
      />

      {formError ? <FormMessage message={formError} /> : null}

      {isPending ? (
        <ActivityIndicator />
      ) : (
        <PrimaryButton title="Send reset link" onPress={handleSubmit(onSubmit)} />
      )}

      <LinkButton
        label="Have a reset code?"
        onPress={() => navigation.navigate('ResetPassword')}
      />

      <LinkButton
        label="Back to sign in"
        onPress={() => navigation.navigate('Login')}
      />
    </AuthScreen>
  );
};

export default ForgotPasswordScreen;
