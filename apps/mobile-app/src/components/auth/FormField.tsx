import type { TextInputProps } from 'react-native';
import styled from 'styled-components/native';

type FormFieldProps = TextInputProps & {
  error?: string;
};

const Field = styled.View`
  gap: 4px;
`;

const Input = styled.TextInput`
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  font-size: 13px;
`;

export const FormField = ({
  error,
  ...inputProps
}: FormFieldProps) => {
  return (
    <Field>
      <Input placeholderTextColor="#999" {...inputProps} />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </Field>
  );
};
