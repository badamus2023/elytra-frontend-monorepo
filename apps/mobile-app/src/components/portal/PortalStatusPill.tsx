import styled from 'styled-components/native';

const Pill = styled.View<{ $tone: string }>`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  gap: 4px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ $tone }) => $tone};
`;

const Dot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: currentColor;
  opacity: 0.7;
`;

const Label = styled.Text<{ $textColor: string }>`
  font-size: 12px;
  font-weight: 500;
  color: ${({ $textColor }) => $textColor};
`;

function pillColors(value: string): { bg: string; text: string } {
  if (value.includes('complete') || value.includes('delivered')) {
    return { bg: '#ecfdf5', text: '#047857' };
  }
  if (
    value.includes('active') ||
    value.includes('transit') ||
    value.includes('online') ||
    value.includes('flight') ||
    value.includes('dispatch')
  ) {
    return { bg: '#f0f9ff', text: '#0369a1' };
  }
  if (
    value.includes('queue') ||
    value.includes('idle') ||
    value.includes('pending') ||
    value.includes('paid')
  ) {
    return { bg: '#fffbeb', text: '#b45309' };
  }
  if (
    value.includes('delay') ||
    value.includes('offline') ||
    value.includes('cancel')
  ) {
    return { bg: '#fff1f2', text: '#be123c' };
  }
  return { bg: '#f1f5f9', text: '#334155' };
}

export const PortalStatusPill = ({ value }: { value?: string | null }) => {
  const normalized = value?.toLowerCase() ?? 'unknown';
  const { bg, text } = pillColors(normalized);

  return (
    <Pill $tone={bg}>
      <Dot />
      <Label $textColor={text}>{value ?? 'Unknown'}</Label>
    </Pill>
  );
};
