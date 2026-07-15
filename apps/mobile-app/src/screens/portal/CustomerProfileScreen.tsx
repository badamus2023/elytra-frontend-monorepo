import { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import {
  GradientButton,
  PortalCard,
  PortalScreen,
  FieldLabel,
  PortalInput,
  SuccessBox,
  MutedText,
} from '../../components/portal';
import { useAuth } from '../../auth/AuthContext';

const SavedBanner = styled(SuccessBox)`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SavedText = styled(MutedText)`
  color: ${({ theme }) => theme.colors.successText};
`;

const Field = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const FieldLabelText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FieldMono = styled.Text`
  margin-top: 2px;
  font-family: Menlo;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const FieldValue = styled.Text`
  margin-top: 2px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const CustomerProfileScreen = () => {
  const { user, displayName, setDisplayName } = useAuth();
  const [name, setName] = useState(displayName);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(displayName);
  }, [displayName]);

  const onSave = async () => {
    await setDisplayName(name.trim() || 'Customer');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <PortalScreen keyboardShouldPersistTaps="handled">
      <PortalCard
        title="My profile"
        description="How we greet you in the app."
      >
        <FieldLabel>Display name</FieldLabel>
        <PortalInput value={name} onChangeText={setName} />
        {saved ? (
          <SavedBanner>
            <SavedText>Profile updated.</SavedText>
          </SavedBanner>
        ) : null}
        <GradientButton title="Save changes" onPress={onSave} />
      </PortalCard>

      <PortalCard title="Your account">
        <Field>
          <FieldLabelText>User id</FieldLabelText>
          <FieldMono>{user?.id ?? '—'}</FieldMono>
        </Field>
        <Field>
          <FieldLabelText>Email</FieldLabelText>
          <FieldValue>{user?.email ?? '—'}</FieldValue>
        </Field>
        <Field>
          <FieldLabelText>Roles</FieldLabelText>
          <FieldValue>
            {user?.roles?.length ? user.roles.join(', ') : '—'}
          </FieldValue>
        </Field>
      </PortalCard>
    </PortalScreen>
  );
};

export default CustomerProfileScreen;
