import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { FormField } from './FormField';

type ControlledFormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  rules?: RegisterOptions<T>;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'>;

export const ControlledFormField = <T extends FieldValues>({
  control,
  name,
  rules,
  ...inputProps
}: ControlledFormFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <FormField
          {...inputProps}
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
};
