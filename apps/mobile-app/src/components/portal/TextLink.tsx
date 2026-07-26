import styled from 'styled-components/native';

type TextLinkProps = {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'inverse';
};

const LinkPressable = styled.Pressable`
  min-height: 44px;
  justify-content: center;
`;

const LinkText = styled.Text<{ $variant: 'default' | 'inverse' }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme, $variant }) =>
    $variant === 'inverse' ? theme.colors.white : theme.colors.link};
`;

export const TextLink = ({
  title,
  onPress,
  variant = 'default',
}: TextLinkProps) => (
  <LinkPressable accessibilityRole="link" onPress={onPress}>
    <LinkText $variant={variant}>{title}</LinkText>
  </LinkPressable>
);
