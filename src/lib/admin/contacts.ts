import type { Role } from './roles';

export const STATUSES = ['new', 'processing', 'handled', 'rejected', 'spam'] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS: Record<Status, { label: string; color: string }> = {
  new: { label: 'Mới', color: 'var(--signal-violet)' },
  processing: { label: 'Đang xử lý', color: 'var(--signal-cyan)' },
  handled: { label: 'Đã xử lý', color: 'var(--ok)' },
  rejected: { label: 'Từ chối', color: 'var(--quiet)' },
  spam: { label: 'Spam', color: 'var(--warn)' },
};

export const HANDLED_VERB: Record<Exclude<Status, 'new'>, string> = {
  processing: 'đang xử lý',
  handled: 'đã xử lý',
  rejected: 'đã từ chối',
  spam: 'đã đánh dấu spam',
};

export const INQUIRIES = ['invest', 'build', 'other'] as const;
export type Inquiry = (typeof INQUIRIES)[number];

export const INQUIRY: Record<Inquiry, string> = {
  invest: 'Đầu tư',
  build: 'Làm sản phẩm',
  other: 'Khác',
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  message: string;
  phone: string | null;
  locale: 'vi' | 'en';
  status: Status;
  source_url: string | null;
  from_source: string | null;
  admin_note: string | null;
  submitted_at: string;
  inquiry_type: Inquiry | null;
  project: string | null;
  project_name: string | null;
  status_by: string | null;
  status_by_name: string | null;
  status_at: string | null;
};

export type Person = { name: string; email: string; role: Role; avatar: string | null };

export const sourcePage = (path: string | null) =>
  !path ? 'Không rõ' : path === '/contact' ? 'Trang Liên hệ' : path;
