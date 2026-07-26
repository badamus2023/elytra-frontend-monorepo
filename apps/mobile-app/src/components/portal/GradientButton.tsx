import { useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'warning' | 'checkout';
type ButtonSize = 'compact' | 'standard' | 'icon';

type GradientButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  accessibilityLabel?: string;
};

const Button = styled.Pressable<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $disabled?: boolean;
  $pressed?: boolean;
}>`
  flex-direction: row;
  gap: 8px;
  border-radius: ${({ theme, $size }) =>
    $size === 'icon' ? theme.radius.pill : theme.radius.md}px;
  padding-vertical: ${({ $size }) => ($size === 'standard' ? 10 : 6)}px;
  padding-horizontal: ${({ $size }) => {
    if ($size === 'icon') return 0;
    return $size === 'standard' ? 16 : 12;
  }}px;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  width: ${({ $size }) => ($size === 'icon' ? '44px' : 'auto')};
  align-self: ${({ $fullWidth }) => ($fullWidth ? 'stretch' : 'flex-start')};
  opacity: ${({ $disabled, $pressed }) => {
    if ($disabled) return 0.6;
    if ($pressed) return 0.82;
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
      case 'checkout':
        return theme.colors.orange;
      default:
        return theme.colors.sky;
    }
  }};
  border-width: ${({ $variant }) =>
    $variant === 'primary' || $variant === 'checkout' ? 0 : 1}px;
  border-color: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'outline':
        return theme.colors.inputBorder;
      case 'danger':
        return theme.colors.errorBorder;
      case 'warning':
        return theme.colors.warningBorder;
      case 'checkout':
        return 'transparent';
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
      case 'checkout':
        return theme.colors.white;
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
  size = 'standard',
  fullWidth = true,
  icon,
  accessibilityLabel,
}: GradientButtonProps) => {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <Button
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $disabled={isDisabled}
      $pressed={pressed}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={size === 'compact' ? 2 : 0}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#0369a1' : '#ffffff'}
        />
      ) : (
        <>
          {icon}
          {size === 'icon' ? null : <Label $variant={variant}>{title}</Label>}
        </>
      )}
    </Button>
  );
};
