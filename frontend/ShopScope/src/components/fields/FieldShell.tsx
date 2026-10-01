import type { ReactNode } from 'react';
import { Form } from 'react-bootstrap';

export interface FieldShellProps {
   controlId: string;
  label: ReactNode;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FieldShell({ controlId, label, error, hint, children }: FieldShellProps) {
  return (
    <Form.Group className="mb-3" controlId={controlId}>
      <Form.Label className="small fw-semibold">{label}</Form.Label>
      {children}
      {hint && !error && <Form.Text>{hint}</Form.Text>}
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  );
}

export interface BaseFieldProps {
  controlId: string;
  label: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
}
