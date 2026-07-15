import styled from 'styled-components/native';

type LinkButtonProps = {
  label: string;
  onPress: () => void;
};

const PressableLink = styled.Pressable`
  padding: ${({ theme }) => theme.spacing.sm}px 0;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  font-size: 15px;
`;

export const LinkButton = ({ label, onPress }: LinkButtonProps) => {
  return (
    <PressableLink onPress={onPress}>
      <Label>{label}</Label>
    </PressableLink>
  );
};
