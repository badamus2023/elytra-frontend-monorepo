import type { ReactNode } from 'react';
import styled from 'styled-components/native';

type AuthScreenProps = {
  children: ReactNode;
};

const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const AuthScreen = ({ children }: AuthScreenProps) => {
  return <Container>{children}</Container>;
};
