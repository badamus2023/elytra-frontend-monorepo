import styled from 'styled-components/native';

type TextLinkProps = {
  title: string;
  onPress: () => void;
};

const LinkPressable = styled.Pressable``;

const LinkText = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.link};
`;

export const TextLink = ({ title, onPress }: TextLinkProps) => (
  <LinkPressable onPress={onPress}>
    <LinkText>{title}</LinkText>
  </LinkPressable>
);
