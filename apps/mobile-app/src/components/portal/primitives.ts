import { ScrollView, TextInput } from 'react-native';
import styled from 'styled-components/native';

export const PortalInput = styled(TextInput).attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.placeholder,
}))`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: 10px 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.white};
`;

export const PortalInputSpaced = styled(PortalInput)`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const PortalSearchInput = styled(PortalInput)`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const FieldLabel = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const MutedText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 20px;
`;

export const SectionEyebrow = styled.Text`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const SectionTitle = styled.Text`
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const Row = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Half = styled.View`
  flex: 1;
`;

export const ErrorBanner = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.errorBg};
  color: ${({ theme }) => theme.colors.errorText};
  font-size: 14px;
`;

export const SuccessBox = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.successBg};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.successBorder};
`;

export const SuccessTitle = styled.Text`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.successText};
  font-size: 15px;
`;

export const SuccessBody = styled.Text`
  margin-top: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.successBody};
`;

export const LineItemBox = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.portalBg};
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const LineItemHeading = styled.Text`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 4px;
`;

export const ActionsRow = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const TipText = styled.Text<{ $spaced?: boolean }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 20px;
  margin-top: ${({ $spaced, theme }) => ($spaced ? theme.spacing.sm : 0)}px;
`;

export const EmptyText = styled.Text`
  text-align: center;
  padding-vertical: 24px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

export const SpacedTop = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

export const PortalScroll = styled(ScrollView)``;

export const ScreenContainer = styled.View<{ $paddingTop: number }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.portalBg};
  padding-top: ${({ $paddingTop }) => $paddingTop}px;
`;

export const ScreenContent = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;
