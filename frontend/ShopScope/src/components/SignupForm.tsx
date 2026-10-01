import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import {
  CheckboxField,
  CheckboxGroupField,
  DateField,
  Field,
  FileField,
  NumberField,
  RadioGroupField,
  RangeField,
  SelectField,
  TextField,
} from './fields';
import {
  COUNTRIES,
  GENDERS,
  INTERESTS,
  ROLES,
  SIGNUP_EMPTY,
  signupSchema,
  type Gender,
  type SignupValues,
} from '../lib/validation';
import type { Role } from '../types';

interface SignupFormProps {
  show: boolean;
  onClose: () => void;
}

export function SignupForm({ show, onClose }: SignupFormProps) {
  const [welcome, setWelcome] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    formState: { isSubmitting, isDirty },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: SIGNUP_EMPTY,
  });

  const watchedAge = useWatch({ control, name: 'age' });

  useEffect(() => {
    if (!watchedAge || Number.isNaN(Number(watchedAge)) || Number(watchedAge) < 0) return;

    const currentYear = new Date().getFullYear();
    const calculatedYear = currentYear - Number(watchedAge);

    const currentBirthDate = getValues('birthDate');
    const monthDay =
      currentBirthDate && currentBirthDate.includes('-')
        ? currentBirthDate.slice(currentBirthDate.indexOf('-') + 1)
        : '01-01';

    setValue('birthDate', `${calculatedYear}-${monthDay}`, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [watchedAge, setValue, getValues]);

  async function onValid(values: SignupValues) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (values.email.endsWith('@taken.com')) {
      setError('email', { message: 'That email is already registered.' });
      return;
    }
    setWelcome(
      `${values.firstName}, your account is ready. Role: ${values.role}. Following: ${values.interests.join(', ')}.`
    );
    reset();
  }

  function handleClose() {
    reset();
    setWelcome(null);
    onClose();
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" backdrop={isSubmitting ? 'static' : true}>
      <Form noValidate onSubmit={handleSubmit(onValid)}>
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title className="h6">Create your ShopScope account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {welcome && (
            <Alert variant="success" dismissible onClose={() => setWelcome(null)}>
              {welcome}
            </Alert>
          )}

          <Row>
            <Col sm={6}>
              <Field name="firstName" control={control}>
                {(f) => <TextField controlId="su-firstName" label="First name" autoComplete="given-name" {...f} />}
              </Field>
            </Col>
            <Col sm={6}>
              <Field name="lastName" control={control}>
                {(f) => <TextField controlId="su-lastName" label="Last name" autoComplete="family-name" {...f} />}
              </Field>
            </Col>
          </Row>

          <Row>
            <Col sm={6}>
              <Field name="email" control={control}>
                {(f) => (
                  <TextField
                    controlId="su-email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="try someone@taken.com"
                    {...f}
                  />
                )}
              </Field>
            </Col>
            <Col sm={6}>
              <Field name="password" control={control}>
                {(f) => (
                  <TextField
                    controlId="su-password"
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    hint="At least 8 characters, including a number."
                    {...f}
                  />
                )}
              </Field>
            </Col>
          </Row>

          <Row>
            <Col sm={3}>
              <Field name="age" control={control}>
                {(f) => <NumberField controlId="su-age" label="Age" min={0} max={120} {...f} />}
              </Field>
            </Col>
            <Col sm={3}>
              <Field name="birthDate" control={control}>
                {(f) => <DateField controlId="su-birthDate" label="Date of birth" {...f} />}
              </Field>
            </Col>
            <Col sm={3}>
              <Field name="role" control={control}>
                {({ value, onChange, onBlur, error }) => (
                  <SelectField
                    controlId="su-role"
                    label="Role"
                    options={ROLES}
                    value={value}
                    onChange={(val) => onChange(val as Role)}
                    onBlur={onBlur}
                    error={error}
                  />
                )}
              </Field>
            </Col>
            <Col sm={3}>
              <Field name="country" control={control}>
                {(f) => <SelectField controlId="su-country" label="Country" placeholder="Choose..." options={COUNTRIES} {...f} />}
              </Field>
            </Col>
          </Row>

          <Field name="gender" control={control}>
            {({ value, onChange, error }) => (
              <RadioGroupField<Gender>
                controlId="su-gender"
                label="Gender"
                options={GENDERS}
                value={value as Gender}
                onChange={onChange}
                error={error}
              />
            )}
          </Field>

          <Field name="interests" control={control}>
            {(f) => (
              <CheckboxGroupField controlId="su-interests" label="Categories to follow" options={INTERESTS} hint="Pick any number." {...f} />
            )}
          </Field>

          <Field name="budget" control={control}>
            {(f) => (
              <RangeField controlId="su-budget" label="Monthly budget" min={0} max={5000} step={50} format={(n) => `$${n}`} {...f} />
            )}
          </Field>

          <Field name="avatar" control={control}>
            {({ value, onChange, error }) => (
              <FileField controlId="su-avatar" label="Profile picture (optional)" accept="image/*" file={value} onChange={onChange} error={error} />
            )}
          </Field>

          <Field name="newsletter" control={control}>
            {({ value, onChange }) => (
              <CheckboxField controlId="su-newsletter" type="switch" label="Email me about deals" checked={value} onChange={onChange} />
            )}
          </Field>

          <Field name="terms" control={control}>
            {({ value, onChange, error }) => (
              <CheckboxField controlId="su-terms" label="I accept the terms and conditions" checked={value} onChange={onChange} error={error} />
            )}
          </Field>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => reset()} disabled={!isDirty || isSubmitting}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner as="span" size="sm" animation="border" className="me-2" />}
            {isSubmitting ? 'Creating...' : 'Create account'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}