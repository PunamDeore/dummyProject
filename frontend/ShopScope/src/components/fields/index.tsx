import type { ReactNode } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FieldShell, type BaseFieldProps } from './FieldShell';

export { FieldShell } from './FieldShell';
export type { BaseFieldProps, FieldShellProps } from './FieldShell';
export { TextField } from './TextField';
export { Field } from './Field';

export interface Option<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

type ControlRest = Pick<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'defaultValue' | 'autoFocus' | 'required' | 'readOnly'>;

export interface NumberFieldProps extends BaseFieldProps, ControlRest {
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  emptyValue?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberField({
  controlId, label, value, onChange, onBlur, error, hint,
  min, max, step, emptyValue = NaN, prefix, suffix, disabled, ...rest
}: NumberFieldProps) {
  const control = (
    <Form.Control
      type="number"
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      isInvalid={Boolean(error)}
      {...(value !== undefined ? { value: Number.isNaN(value) ? '' : value } : {})}
      onChange={
        onChange
          ? (e) => {
              const n = (e.target as HTMLInputElement).valueAsNumber;
              onChange(Number.isNaN(n) ? emptyValue : n);
            }
          : undefined
      }
      onBlur={onBlur}
      {...rest}
    />
  );
  return (
    <FieldShell controlId={controlId} label={label} error={error} hint={hint}>
      {prefix || suffix ? (
        <InputGroup hasValidation>
          {prefix && <InputGroup.Text>{prefix}</InputGroup.Text>}
          {control}
          {suffix && <InputGroup.Text>{suffix}</InputGroup.Text>}
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </InputGroup>
      ) : (
        control
      )}
    </FieldShell>
  );
}

export interface TextAreaFieldProps extends BaseFieldProps, ControlRest {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
}

export function TextAreaField({
  controlId, label, value, onChange, onBlur, error, hint,
  rows = 3, maxLength, placeholder, disabled, ...rest
}: TextAreaFieldProps) {
  const length = value?.length ?? 0;
  const counter = maxLength && value !== undefined ? `${length}/${maxLength}` : undefined;
  return (
    <FieldShell
      controlId={controlId}
      label={
        <span className="d-flex justify-content-between">
          <span>{label}</span>
          {counter && <span className={maxLength && length > maxLength ? 'text-danger' : 'text-muted'}>{counter}</span>}
        </span>
      }
      error={error}
      hint={hint}
    >
      <Form.Control
        as="textarea"
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        isInvalid={Boolean(error)}
        {...(value !== undefined ? { value } : {})}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={onBlur}
        {...rest}
      />
    </FieldShell>
  );
}

export interface SelectFieldProps extends BaseFieldProps, ControlRest {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  options: readonly Option[];
  placeholder?: string;
}

export function SelectField({
  controlId, label, value, onChange, onBlur, options, error, hint, placeholder, disabled, ...rest
}: SelectFieldProps) {
  return (
    <FieldShell controlId={controlId} label={label} error={error} hint={hint}>
      <Form.Select
        disabled={disabled}
        isInvalid={Boolean(error)}
        {...(value !== undefined ? { value } : {})}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={onBlur}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </Form.Select>
    </FieldShell>
  );
}

export interface MultiSelectFieldProps extends BaseFieldProps {
  value: readonly string[];
  onChange: (value: string[]) => void;
  options: readonly Option[];
  size?: number;
}

export function MultiSelectField({ controlId, label, value, onChange, options, error, hint, size = 4, disabled }: MultiSelectFieldProps) {
  return (
    <FieldShell controlId={controlId} label={label} error={error} hint={hint}>
      <Form.Select
        multiple
        htmlSize={size}
        value={value as string[]}
        disabled={disabled}
        isInvalid={Boolean(error)}
        onChange={(e) => onChange(Array.from(e.target.selectedOptions, (o) => o.value))}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Form.Select>
    </FieldShell>
  );
}

export interface CheckboxFieldProps extends Omit<BaseFieldProps, 'label'> {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
  type?: 'checkbox' | 'switch';
}

export function CheckboxField({ controlId, label, checked, onChange, onBlur, error, hint, type = 'checkbox', disabled }: CheckboxFieldProps) {
  return (
    <Form.Group className="mb-3">
      <Form.Check
        id={controlId}
        type={type}
        label={<span className="small">{label}</span>}
        checked={checked}
        disabled={disabled}
        isInvalid={Boolean(error)}
        feedback={error}
        feedbackType="invalid"
        onChange={(e) => onChange(e.target.checked)}
        onBlur={onBlur}
      />
      {hint && !error && <Form.Text>{hint}</Form.Text>}
    </Form.Group>
  );
}

export interface RadioGroupFieldProps<T extends string> extends BaseFieldProps {
  value: T;
  onChange: (value: T) => void;
  options: readonly Option<T>[];
  inline?: boolean;
}

export function RadioGroupField<T extends string>({ controlId, label, value, onChange, options, error, hint, inline = true, disabled }: RadioGroupFieldProps<T>) {
  return (
    <Form.Group className="mb-3" controlId={controlId}>
      <Form.Label className="small fw-semibold d-block">{label}</Form.Label>
      <div className={inline ? 'd-flex flex-wrap gap-3' : ''}>
        {options.map((o, i) => (
          <Form.Check
            key={o.value}
            type="radio"
            id={`${controlId}-${o.value}`}
            name={controlId}
            label={o.label}
            value={o.value}
            checked={value === o.value}
            disabled={disabled || o.disabled}
            isInvalid={Boolean(error) && i === options.length - 1}
            feedback={i === options.length - 1 ? error : undefined}
            feedbackType="invalid"
            onChange={(e) => onChange(e.target.value as T)}
          />
        ))}
      </div>
      {hint && !error && <Form.Text>{hint}</Form.Text>}
    </Form.Group>
  );
}

export interface CheckboxGroupFieldProps extends BaseFieldProps {
  value: readonly string[];
  onChange: (value: string[]) => void;
  options: readonly Option[];
  inline?: boolean;
}

export function CheckboxGroupField({ controlId, label, value, onChange, options, error, hint, inline = true, disabled }: CheckboxGroupFieldProps) {
  function toggle(option: string, checked: boolean) {
    onChange(checked ? [...value, option] : value.filter((v) => v !== option));
  }
  return (
    <Form.Group className="mb-3">
      <Form.Label className="small fw-semibold d-block">{label}</Form.Label>
      <div className={inline ? 'd-flex flex-wrap gap-3' : ''}>
        {options.map((o) => (
          <Form.Check
            key={o.value}
            type="checkbox"
            id={`${controlId}-${o.value}`}
            label={o.label}
            checked={value.includes(o.value)}
            disabled={disabled || o.disabled}
            onChange={(e) => toggle(o.value, e.target.checked)}
          />
        ))}
      </div>
      {error ? <div className="text-danger small mt-1">{error}</div> : hint && <Form.Text>{hint}</Form.Text>}
    </Form.Group>
  );
}

export interface DateFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'date' | 'time' | 'datetime-local' | 'month';
  min?: string;
  max?: string;
}

export function DateField({ controlId, label, value, onChange, onBlur, error, hint, type = 'date', min, max, disabled }: DateFieldProps) {
  return (
    <FieldShell controlId={controlId} label={label} error={error} hint={hint}>
      <Form.Control
        type={type}
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        isInvalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </FieldShell>
  );
}

export interface RangeFieldProps extends BaseFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
}

export function RangeField({ controlId, label, value, onChange, error, hint, min = 0, max = 100, step = 1, format, disabled }: RangeFieldProps) {
  return (
    <Form.Group className="mb-3" controlId={controlId}>
      <Form.Label className="small fw-semibold d-flex justify-content-between">
        <span>{label}</span>
        <span className="text-muted">{format ? format(value) : value}</span>
      </Form.Label>
      <Form.Range min={min} max={max} step={step} value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} />
      {error ? <div className="text-danger small">{error}</div> : hint && <Form.Text>{hint}</Form.Text>}
    </Form.Group>
  );
}

export interface FileFieldProps extends BaseFieldProps {
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
}

export function FileField({ controlId, label, file, onChange, error, hint, accept, disabled }: FileFieldProps) {
  return (
    <FieldShell
      controlId={controlId}
      label={label}
      error={error}
      hint={hint ?? (file ? `${file.name} — ${Math.round(file.size / 1024)} KB` : undefined)}
    >
      <Form.Control
        type="file"
        accept={accept}
        disabled={disabled}
        isInvalid={Boolean(error)}
        onChange={(e) => onChange((e.target as HTMLInputElement).files?.[0] ?? null)}
      />
    </FieldShell>
  );
}