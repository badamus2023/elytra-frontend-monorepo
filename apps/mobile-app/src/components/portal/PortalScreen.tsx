import type { ReactNode } from 'react';
import type { ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

type PortalScreenProps = {
  children: ReactNode;
  scroll?: boolean;
} & Pick<ScrollViewProps, 'keyboardShouldPersistTaps'>;

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.portalBg};
`;

const Scroll = styled.ScrollView.attrs<{
  $paddingTop: number;
  $paddingBottom: number;
}>(({ $paddingTop, $paddingBottom, theme }) => ({
  contentContainerStyle: {
    paddingTop: $paddingTop,
    paddingBottom: $paddingBottom,
    paddingHorizontal: theme.spacing.lg,
  },
}))``;

const StaticContent = styled.View<{ $paddingTop: number }>`
  flex: 1;
  padding-top: ${({ $paddingTop }) => $paddingTop}px;
`;

const StaticInner = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

const ScrollContent = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const PortalScreen = ({
  children,
  scroll = true,
  keyboardShouldPersistTaps,
}: PortalScreenProps) => {
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + 8;
  const paddingBottom = insets.bottom + 24;

  if (!scroll) {
    return (
      <Container>
        <StaticContent $paddingTop={insets.top}>
          <StaticInner>{children}</StaticInner>
        </StaticContent>
      </Container>
    );
  }

  return (
    <Container>
      <Scroll
        $paddingTop={paddingTop}
        $paddingBottom={paddingBottom}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      >
        <ScrollContent>{children}</ScrollContent>
      </Scroll>
    </Container>
  );
};
