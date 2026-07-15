import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'warning';

type GradientButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
};

const Button = styled.Pressable<{
  $variant: ButtonVariant;
  $disabled?: boolean;
  $pressed?: boolean;
}>`
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: 12px 16px;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  opacity: ${({ $disabled, $pressed }) => {
    if ($disabled) return 0.6;
    if ($pressed) return 0.9;
    return 1;
  }};
  background-color: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'outline':
        return theme.colors.white;
      case 'danger':
        return theme.colors.errorBg;
      case 'warning':
        return theme.colors.warningBg;
      default:
        return theme.colors.sky;
    }
  }};
  border-width: ${({ $variant }) => ($variant === 'primary' ? 0 : 1)}px;
  border-color: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'outline':
        return theme.colors.inputBorder;
      case 'danger':
        return theme.colors.errorBorder;
      case 'warning':
        return theme.colors.warningBorder;
      default:
        return 'transparent';
    }
  }};
`;

const Label = styled.Text<{ $variant: ButtonVariant }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'outline':
        return theme.colors.textSecondary;
      case 'danger':
        return theme.colors.errorText;
      case 'warning':
        return theme.colors.warningText;
      default:
        return theme.colors.white;
    }
  }};
`;

export const GradientButton = ({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
}: GradientButtonProps) => {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <Button
      $variant={variant}
      $disabled={isDisabled}
      $pressed={pressed}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#0369a1' : '#ffffff'}
        />
      ) : (
        <Label $variant={variant}>{title}</Label>
      )}
    </Button>
  );
};
