import { z } from 'zod';
import type { ProductDraft } from '../types';

export type ProductErrors = Partial<Record<keyof ProductDraft, string>>;

export const PRODUCT_EMPTY: ProductDraft = { title: '', price: NaN, category: '', stock: 10, description: '' };

export function validateProduct(values: ProductDraft): ProductErrors {
  const errors: ProductErrors = {};
  if (values.title.trim().length < 2) errors.title = 'Give it a name of at least 2 characters.';
  if (!(values.price > 0)) errors.price = 'Price must be more than zero.';
  if (!values.category) errors.category = 'Pick a category.';
  if (!Number.isInteger(values.stock) || values.stock < 0) errors.stock = 'Stock must be a whole number, zero or more.';
  if (values.description.length > 300) errors.description = 'Keep it under 300 characters.';
  return errors;
}

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

const GENDER_VALUES = ['female', 'male', 'other'] as const;
export type Gender = (typeof GENDER_VALUES)[number];

export const GENDERS: Option<Gender>[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other / prefer not to say' },
];

export const ROLES: Option[] = [
  { value: 'user', label: 'User' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin', label: 'Admin' },
];

export const COUNTRIES: Option[] = [
  { value: 'IN', label: 'India' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'DE', label: 'Germany' },
  { value: 'AU', label: 'Australia' },
];

export const INTERESTS: Option[] = [
  { value: 'beauty', label: 'Beauty' },
  { value: 'fragrances', label: 'Fragrances' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'smartphones', label: 'Smartphones' },
];

export const signupSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().email("That doesn't look like an email address."),
  password: z.string().min(8, 'Use at least 8 characters.').regex(/\d/, 'Include at least one number.'),
  age: z.number({ error: 'Age is required.' }).int('Whole years, please.').min(18, 'You must be 18 or over.').max(120, 'That seems unlikely.'),
  birthDate: z.string().min(1, 'Pick your date of birth.'),
  gender: z.enum(GENDER_VALUES).or(z.literal('')).refine((v) => v !== '', 'Pick one.'),
  role: z.enum(['admin', 'moderator', 'user'] as const),
  country: z.string().min(1, 'Pick a country.'),
  interests: z.array(z.string()).min(1, 'Follow at least one category.'),
  budget: z.number().min(0).max(5000),
  newsletter: z.boolean(),
  terms: z.boolean().refine((v) => v, 'You must accept the terms.'),
  avatar: z
    .instanceof(File)
    .nullable()
    .refine((f) => !f || f.type.startsWith('image/'), 'Images only, please.')
    .refine((f) => !f || f.size <= 2_000_000, 'Keep it under 2 MB.'),
});

export type SignupValues = z.input<typeof signupSchema>;

export const SIGNUP_EMPTY: SignupValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  age: NaN,
  birthDate: '',
  gender: '',
  role: 'user',
  country: '',
  interests: [],
  budget: 500,
  newsletter: true,
  terms: false,
  avatar: null,
};