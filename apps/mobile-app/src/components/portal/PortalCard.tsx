import type { ReactNode } from 'react';
import styled from 'styled-components/native';

type PortalCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

const Card = styled.View`
  border-radius: ${({ theme }) => theme.radius.xl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const HeaderText = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.Text`
  margin-top: 2px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const PortalCard = ({
  title,
  description,
  action,
  children,
}: PortalCardProps) => {
  return (
    <Card>
      {title || action ? (
        <Header>
          <HeaderText>
            {title ? <Title>{title}</Title> : null}
            {description ? <Description>{description}</Description> : null}
          </HeaderText>
          {action}
        </Header>
      ) : null}
      {children}
    </Card>
  );
};
