import styled from 'styled-components/native';

type FormMessageVariant = 'error' | 'success' | 'info';

type FormMessageProps = {
  message: string;
  variant?: FormMessageVariant;
};

const Message = styled.Text<{ $variant: FormMessageVariant }>`
  font-size: 14px;
  text-align: center;
  color: ${({ theme, $variant }) => {
    if ($variant === 'error') return theme.colors.error;
    if ($variant === 'info') return theme.colors.muted;
    return theme.colors.primary;
  }};
`;

export const FormMessage = ({
  message,
  variant = 'error',
}: FormMessageProps) => {
  return <Message $variant={variant}>{message}</Message>;
};
