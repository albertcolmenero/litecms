export type FormFieldType = 'text' | 'longText' | 'date' | 'email';
export type FormLayout = 'stacked' | 'inlineDesktop';

export type FormField = {
  id: string;
  key: string;
  label?: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  order: number;
};

export const FORM_FIELD_TYPES: FormFieldType[] = ['text', 'longText', 'date', 'email'];
export const FORM_LAYOUTS: FormLayout[] = ['stacked', 'inlineDesktop'];

export const DEFAULT_FORM_FIELDS: FormField[] = [
  {
    id: 'email',
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'Enter your email',
    order: 0,
  },
];

export function sanitizeKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export function sanitizeFormLayout(input: unknown): FormLayout {
  if (typeof input === 'string' && FORM_LAYOUTS.includes(input as FormLayout)) {
    return input as FormLayout;
  }
  return 'stacked';
}

export function sanitizeFormFields(input: unknown): FormField[] {
  if (!Array.isArray(input)) return [...DEFAULT_FORM_FIELDS];

  const fields = input
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const candidate = item as Partial<FormField>;
      const label = typeof candidate.label === 'string' ? candidate.label.trim() : '';
      const rawKey = (candidate.key || label || `field_${index + 1}`).toString();
      const key = sanitizeKey(rawKey) || `field_${index + 1}`;
      const type = FORM_FIELD_TYPES.includes(candidate.type as FormFieldType)
        ? (candidate.type as FormFieldType)
        : 'text';

      return {
        id: (candidate.id || key || `field_${index + 1}`).toString(),
        key,
        label: label || undefined,
        type,
        required: Boolean(candidate.required),
        placeholder: candidate.placeholder ? String(candidate.placeholder) : undefined,
        order: typeof candidate.order === 'number' ? candidate.order : index,
      } satisfies FormField;
    })
    .filter((field) => field !== null) as FormField[];

  if (!fields.length) return [...DEFAULT_FORM_FIELDS];

  const deduped: FormField[] = [];
  const keyCount = new Map<string, number>();

  for (const field of fields.sort((a, b) => a.order - b.order)) {
    const seen = keyCount.get(field.key) || 0;
    keyCount.set(field.key, seen + 1);
    const uniqueKey = seen > 0 ? `${field.key}_${seen + 1}` : field.key;
    deduped.push({ ...field, key: uniqueKey, order: deduped.length });
  }

  return deduped;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateFormValues(fields: FormField[], values: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const normalized: Record<string, string> = {};
  let extractedEmail: string | null = null;

  for (const field of fields) {
    const displayName = field.label?.trim() || field.key;
    const raw = values[field.key];
    const value = typeof raw === 'string' ? raw.trim() : '';
    normalized[field.key] = value;

    if (field.required && !value) {
      errors[field.key] = `${displayName} is required`;
      continue;
    }

    if (field.type === 'email' && value) {
      if (!isValidEmail(value)) {
        errors[field.key] = `${displayName} must be a valid email`;
      } else if (!extractedEmail) {
        extractedEmail = value;
      }
    }
  }

  return { errors, normalized, extractedEmail };
}
