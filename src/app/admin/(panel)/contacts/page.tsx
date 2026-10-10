import type { Metadata } from 'next';
import { PageHead } from '@/components/admin/ui';
import { findProduct } from '@/content/products';
import { INQUIRIES, type Contact, type Inquiry, type Person } from '@/lib/admin/contacts';
import { callAs, requireSession } from '@/lib/admin/session';
import { Board } from './Board';
import { Toolbar } from './Toolbar';

export const metadata: Metadata = { title: 'Liên hệ' };

type ContactList = {
  items: Omit<Contact, 'project_name'>[];
  total: number;
  people: Record<string, Person>;
};

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function ContactsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const session = await requireSession('sub');
  const params = await searchParams;
  const inquiry = (INQUIRIES as readonly string[]).includes(one(params.type))
    ? (one(params.type) as Inquiry)
    : null;
  const q = one(params.q).trim().slice(0, 100);

  const data = await callAs<ContactList>('ridelink_contact_list', {
    p_status: null,
    p_inquiry: inquiry,
    p_search: q || null,
    p_limit: 100,
    p_offset: 0,
  });

  const items: Contact[] = data.items.map((item) => ({
    ...item,
    project_name: item.project ? (findProduct(item.project)?.name.vi ?? null) : null,
  }));
  const fresh = items.filter((item) => item.status === 'new').length;

  return (
    <div className="flex flex-col gap-7">
      <PageHead
        title="Liên hệ"
        description={
          <>
            {data.total} brief{fresh ? `, ${fresh} mới` : ''}.{' '}
            <span className="hidden pointer-fine:inline">
              Kéo thẻ sang cột khác để đổi trạng thái.
            </span>
            <span className="pointer-fine:hidden">Chạm vào thẻ để xem và đổi trạng thái.</span>
          </>
        }
      >
        <Toolbar key={`${inquiry ?? ''}|${q}`} q={q} inquiry={inquiry ?? ''} />
      </PageHead>

      {items.length === 0 ? (
        <p data-enter className="text-[15px] text-[var(--ink-soft)]">
          {q || inquiry
            ? 'Không có brief nào khớp bộ lọc.'
            : 'Chưa có brief nào. Brief gửi từ trang liên hệ sẽ hiện ở đây.'}
        </p>
      ) : null}

      <Board
        key={`${inquiry ?? ''}|${q}`}
        items={items}
        total={data.total}
        people={data.people}
        me={{
          id: session.userId,
          name: session.displayName,
          email: session.email,
          role: session.role,
          avatar: session.avatar,
        }}
      />
    </div>
  );
}
