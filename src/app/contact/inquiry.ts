export const INQUIRIES = ['invest', 'build', 'other'] as const;

export type Inquiry = (typeof INQUIRIES)[number];

export const isInquiry = (value: unknown): value is Inquiry =>
  typeof value === 'string' && (INQUIRIES as readonly string[]).includes(value);
