import styled from 'styled-components/native';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

const Button = styled.Pressable<{ $disabled?: boolean }>`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  align-items: center;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
`;

const Label = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
`;

export const PrimaryButton = ({
  title,
  onPress,
  disabled,
}: PrimaryButtonProps) => {
  return (
    <Button onPress={onPress} disabled={disabled} $disabled={disabled}>
      <Label>{title}</Label>
    </Button>
  );
};
