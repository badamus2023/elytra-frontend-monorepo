import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import {
  AuthScreen,
  ControlledFormField,
  FormMessage,
  LinkButton,
  PrimaryButton,
} from '../components/auth';
import { usePostApiAuthVerifyEmail } from '../api/generated/auth/auth';
import type { VerifyEmailRequest } from '../api/model';
import type { AuthStackParamList } from '../navigation/types';
import { getErrorMessage } from '../utils/getErrorMessage';

type VerifyEmailNavigation = NativeStackNavigationProp<
  AuthStackParamList,
  'VerifyEmail'
>;
type VerifyEmailRoute = RouteProp<AuthStackParamList, 'VerifyEmail'>;

const Eyebrow = styled.Text`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Title = styled.Text`
  margin-top: 4px;
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.Text`
  margin-top: 8px;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const VerifyEmailScreen = () => {
  const navigation = useNavigation<VerifyEmailNavigation>();
  const route = useRoute<VerifyEmailRoute>();
  const [formError, setFormError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const verifyForm = useForm<VerifyEmailRequest>({
    defaultValues: { token: route.params?.token ?? '' },
  });

  const verifyMutation = usePostApiAuthVerifyEmail();

  useEffect(() => {
    if (route.params?.token) {
      verifyForm.setValue('token', route.params.token);
    }
  }, [route.params?.token, verifyForm]);

  const onVerify = async (data: VerifyEmailRequest) => {
    setFormError(null);
    const token = data.token?.trim() ?? '';
    if (!token) {
      setFormError('Token is required.');
      return;
    }

    try {
      await verifyMutation.mutateAsync({ data: { token } });
      setVerified(true);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Verification failed'));
    }
  };

  return (
    <AuthScreen>
      <Eyebrow>Account</Eyebrow>
      <Title>Confirm email</Title>
      <Subtitle>
        Paste the token from your verification email. Opening the link in mail may
        pre-fill it if you configure deep linking later.
      </Subtitle>

      {verified ? (
        <>
          <FormMessage
            variant="success"
            message="Email verified. You can sign in now."
          />
          <LinkButton
            label="Go to sign in"
            onPress={() => navigation.navigate('Login', { emailVerified: true })}
          />
        </>
      ) : (
        <>
          <ControlledFormField
            control={verifyForm.control}
            name="token"
            placeholder="Verification token"
            autoCapitalize="none"
            autoCorrect={false}
            rules={{ required: 'Token is required' }}
          />

          {formError ? <FormMessage message={formError} /> : null}

          {verifyMutation.isPending ? (
            <ActivityIndicator />
          ) : (
            <PrimaryButton
              title="Verify email"
              onPress={verifyForm.handleSubmit(onVerify)}
            />
          )}
        </>
      )}

      <LinkButton
        label="Back to sign in"
        onPress={() => navigation.navigate('Login')}
      />
    </AuthScreen>
  );
};

export default VerifyEmailScreen;
