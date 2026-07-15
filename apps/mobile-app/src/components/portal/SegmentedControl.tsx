import styled from 'styled-components/native';

type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

const Wrap = styled.View`
  flex-direction: row;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.portalBg};
  padding: 2px;
`;

const Item = styled.Pressable<{ $active?: boolean }>`
  flex: 1;
  padding-vertical: 8px;
  border-radius: 6px;
  align-items: center;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.white : 'transparent'};
  shadow-color: #000;
  shadow-opacity: ${({ $active }) => ($active ? 0.06 : 0)};
  shadow-radius: 2px;
  shadow-offset: 0px 1px;
  elevation: ${({ $active }) => ($active ? 1 : 0)};
`;

const Label = styled.Text<{ $active?: boolean }>`
  font-size: 12px;
  font-weight: 500;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text : theme.colors.textMuted};
  text-transform: capitalize;
`;

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <Wrap>
      {options.map((option) => {
        const active = option === value;
        return (
          <Item
            key={option}
            $active={active}
            onPress={() => onChange(option)}
          >
            <Label $active={active}>{option}</Label>
          </Item>
        );
      })}
    </Wrap>
  );
}
