import type { ReactNode } from 'react';
import styled from 'styled-components/native';

type PortalKpiProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: 'sky' | 'emerald' | 'amber' | 'violet';
};

const tones: Record<NonNullable<PortalKpiProps['tone']>, string> = {
  sky: '#0ea5e9',
  emerald: '#10b981',
  amber: '#f59e0b',
  violet: '#8b5cf6',
};

const Card = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.xl}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

const IconWrap = styled.View<{ $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $color }) => $color};
`;

const IconText = styled.Text`
  font-size: 18px;
`;

const Label = styled.Text`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Value = styled.Text`
  margin-top: 4px;
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Hint = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Body = styled.View`
  flex: 1;
`;

export const PortalKpi = ({
  label,
  value,
  hint,
  icon,
  tone = 'sky',
}: PortalKpiProps) => {
  return (
    <Card>
      {icon ? (
        <IconWrap $color={tones[tone]}>
          <IconText>{icon}</IconText>
        </IconWrap>
      ) : null}
      <Body>
        <Label>{label}</Label>
        <Value>{value}</Value>
        {hint ? <Hint>{hint}</Hint> : null}
      </Body>
    </Card>
  );
};
