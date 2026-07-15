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
import { usePostApiAuthResetPassword } from '../api/generated/auth/auth';
import type { ResetPasswordRequest } from '../api/model';
import type { AuthStackParamList } from '../navigation/types';
import { getErrorMessage } from '../utils/getErrorMessage';

type ResetPasswordNavigation = NativeStackNavigationProp<
  AuthStackParamList,
  'ResetPassword'
>;

const ResetPasswordScreen = () => {
  const navigation = useNavigation<ResetPasswordNavigation>();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, getValues } = useForm<ResetPasswordRequest>({
    defaultValues: {
      token: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { mutateAsync, isPending } = usePostApiAuthResetPassword();

  const onSubmit = async (data: ResetPasswordRequest) => {
    setFormError(null);

    try {
      await mutateAsync({ data });
      navigation.navigate('Login', { passwordReset: true });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not reset password'));
    }
  };

  return (
    <AuthScreen>
      <ControlledFormField
        control={control}
        name="token"
        placeholder="Reset code"
        autoCapitalize="none"
        rules={{ required: 'Reset code is required' }}
      />

      <ControlledFormField
        control={control}
        name="newPassword"
        placeholder="New password"
        secureTextEntry
        rules={{ required: 'New password is required' }}
      />

      <ControlledFormField
        control={control}
        name="confirmPassword"
        placeholder="Confirm new password"
        secureTextEntry
        rules={{
          required: 'Confirm password is required',
          validate: value =>
            value === getValues('newPassword') || 'Passwords do not match',
        }}
      />

      {formError ? <FormMessage message={formError} /> : null}

      {isPending ? (
        <ActivityIndicator />
      ) : (
        <PrimaryButton title="Reset password" onPress={handleSubmit(onSubmit)} />
      )}

      <LinkButton
        label="Back to sign in"
        onPress={() => navigation.navigate('Login')}
      />
    </AuthScreen>
  );
};

export default ResetPasswordScreen;
