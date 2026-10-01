import type { ReactElement } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues, type PathValue, type RegisterOptions } from 'react-hook-form';
export interface FieldRenderProps<TValue> {
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur: () => void;
  error?: string;
}

interface FieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> {
  name: TName;
  control: Control<TValues>;
  rules?: Omit<RegisterOptions<TValues, TName>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  children: (field: FieldRenderProps<PathValue<TValues, TName>>) => ReactElement;
}

export function Field<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  name,
  control,
  rules,
  children,
}: FieldProps<TValues, TName>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) =>
        children({
          value: field.value,
          onChange: field.onChange,
          onBlur: field.onBlur,
          error: fieldState.error?.message,
        })
      }
    />
  );
}
