'use client';

import Form from 'next/form';
import Link from 'next/link';
import { CaretDown, MagnifyingGlass } from 'phosphor-react';
import { INQUIRIES, INQUIRY } from '@/lib/admin/contacts';

export function Toolbar({ q, inquiry }: { q: string; inquiry: string }) {
  return (
    <Form action="/admin/contacts" className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      <div className="relative min-w-0 basis-full sm:w-64 sm:basis-auto">
        <label htmlFor="contact-q" className="sr-only">
          Tìm brief
        </label>
        <MagnifyingGlass
          size={16}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--ink-faint)]"
        />
        <input
          id="contact-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Tên, email, nội dung"
          className="field h-10 min-h-0 py-0 pl-9 text-[14px]"
        />
      </div>
      <div className="relative">
        <label htmlFor="contact-type" className="sr-only">
          Nhu cầu
        </label>
        <select
          id="contact-type"
          name="type"
          defaultValue={inquiry}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="field h-10 min-h-0 w-auto cursor-pointer appearance-none py-0 pr-9 pl-3.5 text-[14px]"
        >
          <option value="">Mọi nhu cầu</option>
          {INQUIRIES.map((key) => (
            <option key={key} value={key}>
              {INQUIRY[key]}
            </option>
          ))}
        </select>
        <CaretDown
          size={14}
          weight="bold"
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--ink-faint)]"
        />
      </div>
      {q || inquiry ? (
        <Link href="/admin/contacts" className="btn h-10 min-h-0 px-4 text-[13px]">
          Bỏ lọc
        </Link>
      ) : null}
    </Form>
  );
}
