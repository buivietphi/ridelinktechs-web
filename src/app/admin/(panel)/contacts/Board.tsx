'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Flip } from 'gsap/Flip';
import { Envelope, NotePencil, Phone } from 'phosphor-react';
import {
  startTransition,
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Dialog } from '@/components/admin/Dialog';
import { useToast } from '@/components/admin/Toast';
import { Avatar } from '@/components/admin/ui';
import { prefersReducedMotion } from '@/lib/animations';
import {
  HANDLED_VERB,
  INQUIRY,
  STATUS,
  STATUSES,
  sourcePage,
  type Contact,
  type Person,
  type Status,
} from '@/lib/admin/contacts';
import { ago, when } from '@/lib/admin/format';
import { cn } from '@/lib/cn';
import { saveContactNote, setContactStatus } from './actions';

gsap.registerPlugin(useGSAP, Draggable, Flip);

type Move = { id: string; status: Status };
type MoveHandler = (contact: Contact, status: Status, quiet?: boolean) => void;
type Me = Person & { id: string };
type People = Record<string, Person>;
type Handler = Omit<Person, 'email' | 'role'> & { email: string | null; role?: Person['role'] };

const columnUnder = (event: Event) => {
  const { clientX, clientY } = event as PointerEvent;
  return (
    document
      .elementsFromPoint(clientX, clientY)
      .find((node): node is HTMLElement => node instanceof HTMLElement && !!node.dataset.column) ??
    null
  );
};

let droppedAt = 0;

function handlerOf(contact: Contact, people: People): Handler | null {
  if (contact.status === 'new' || (!contact.status_by && !contact.status_by_name)) return null;
  const person = contact.status_by ? people[contact.status_by] : undefined;
  if (person) return person;
  return { name: contact.status_by_name ?? 'Tài khoản đã xoá', email: null, avatar: null };
}

const verbOf = (contact: Contact) => HANDLED_VERB[contact.status as Exclude<Status, 'new'>];

const topic = (contact: Contact) =>
  [contact.inquiry_type ? INQUIRY[contact.inquiry_type] : 'Chưa phân loại', contact.project_name]
    .filter(Boolean)
    .join(' · ');

function Card({
  contact,
  handler,
  onOpen,
  onDrop,
}: {
  contact: Contact;
  handler: Handler | null;
  onOpen: (id: string) => void;
  onDrop: MoveHandler;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !window.matchMedia('(pointer: fine)').matches) return;
      let over: HTMLElement | null = null;
      const [drag] = Draggable.create(el, {
        type: 'x,y',
        minimumMovement: 6,
        zIndexBoost: true,
        autoScroll: 1,
        onDragStart() {
          el.dataset.dragging = '';
          if (!prefersReducedMotion()) {
            gsap.to(el, { scale: 1.04, rotation: -2, duration: 0.22, ease: 'power3.out' });
          }
        },
        onDrag() {
          const next = columnUnder(this.pointerEvent);
          if (next === over) return;
          over?.removeAttribute('data-over');
          next?.setAttribute('data-over', '');
          over = next;
        },
        onDragEnd() {
          droppedAt = performance.now();
          delete el.dataset.dragging;
          const status = over?.dataset.column as Status | undefined;
          over?.removeAttribute('data-over');
          over = null;
          if (status && status !== contact.status) {
            onDrop(contact, status);
            return;
          }
          gsap.to(el, {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: prefersReducedMotion() ? 0 : 0.42,
            ease: 'power3.out',
          });
        },
      });
      return () => drag.kill();
    },
    { scope: ref, dependencies: [contact.id, contact.status] },
  );

  return (
    <button
      ref={ref}
      type="button"
      data-card
      data-flip-id={contact.id}
      onClick={() => {
        if (performance.now() - droppedAt > 400) onOpen(contact.id);
      }}
      className="kanban-card"
    >
      <span className="line-clamp-2 text-[15px] leading-[1.35] font-semibold break-words">
        {contact.name}
      </span>
      <span className="mt-1 block truncate text-[13px] text-[var(--ink-soft)]">
        {topic(contact)}
      </span>
      <span className="mt-2 line-clamp-2 text-[13px] leading-[1.5] text-[var(--ink-faint)]">
        {contact.message}
      </span>
      {handler ? (
        <span className="mt-3 flex min-w-0 items-center gap-2 text-[12px] text-[var(--ink-soft)]">
          <Avatar name={handler.name} role={handler.role} src={handler.avatar} size={20} />
          <span className="truncate">{`${handler.name} ${verbOf(contact)}`}</span>
        </span>
      ) : null}
      <span className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[var(--ink-faint)]">
        <time dateTime={contact.submitted_at} suppressHydrationWarning>
          {ago(contact.submitted_at)}
        </time>
        {contact.admin_note ? (
          <span className="flex items-center gap-1 text-[var(--ink-soft)]">
            <NotePencil size={14} aria-hidden />
            Có ghi chú
          </span>
        ) : null}
      </span>
    </button>
  );
}

function NoteForm({ contact }: { contact: Contact }) {
  const [note, setNote] = useState(contact.admin_note ?? '');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        start(async () => {
          const result = await saveContactNote(contact.id, note);
          setMessage({ ok: result.ok, text: result.message ?? '' });
        });
      }}
    >
      <label htmlFor={`note-${contact.id}`} className="label">
        Ghi chú nội bộ
      </label>
      <textarea
        id={`note-${contact.id}`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={4}
        maxLength={2000}
        className="field min-h-24 resize-y"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary min-h-11 px-5">
          {pending ? 'Đang lưu…' : 'Lưu ghi chú'}
        </button>
        <p
          role="status"
          className={cn(
            'text-[13px]',
            message?.ok ? 'text-[var(--ink-soft)]' : 'text-[var(--warn)]',
          )}
        >
          {message?.text}
        </p>
      </div>
    </form>
  );
}

function Detail({
  contact,
  handler,
  onMove,
}: {
  contact: Contact;
  handler: Handler | null;
  onMove: MoveHandler;
}) {
  const facts: [string, string][] = [
    ['Nhu cầu', contact.inquiry_type ? INQUIRY[contact.inquiry_type] : 'Chưa phân loại'],
    ['Dự án', contact.project_name ?? contact.project ?? 'Không chọn'],
    ['Ngôn ngữ', contact.locale === 'en' ? 'Tiếng Anh' : 'Tiếng Việt'],
    ['Biết đến qua', contact.from_source ?? 'Không ghi'],
    ['Gửi từ trang', sourcePage(contact.source_url)],
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
        <a
          href={`mailto:${contact.email}`}
          data-autofocus
          className="link inline-flex items-center gap-2 break-all"
        >
          <Envelope size={16} aria-hidden />
          {contact.email}
        </a>
        {contact.phone ? (
          <a href={`tel:${contact.phone}`} className="link inline-flex items-center gap-2">
            <Phone size={16} aria-hidden />
            {contact.phone}
          </a>
        ) : null}
      </div>

      <fieldset>
        <legend className="label">Trạng thái</legend>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((status) => {
            const checked = contact.status === status;
            return (
              <label key={status} className={cn('choice-pill', checked && 'is-checked')}>
                <input
                  type="radio"
                  name={`status-${contact.id}`}
                  value={status}
                  checked={checked}
                  onChange={() => onMove(contact, status, true)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ backgroundColor: STATUS[status].color }}
                />
                {STATUS[status].label}
              </label>
            );
          })}
        </div>
        {handler ? (
          <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--rule-2)] px-4 py-3">
            <Avatar name={handler.name} role={handler.role} src={handler.avatar} size={36} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] leading-[1.4]">
                <span className="font-semibold">{handler.name}</span> {verbOf(contact)}
              </p>
              <p className="truncate text-[13px] text-[var(--ink-soft)]">
                {handler.email ?? 'Tài khoản này đã bị xoá'}
                {contact.status_at ? ` · ${when(contact.status_at)}` : ''}
              </p>
            </div>
          </div>
        ) : null}
      </fieldset>

      <div className="rounded-[var(--radius-lg)] border border-[var(--rule-2)] bg-[var(--admin-lane)] px-5 py-4">
        <p className="text-[15px] leading-[1.7] break-words whitespace-pre-wrap">
          {contact.message}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
        {facts.map(([term, value]) => (
          <div key={term} className="min-w-0">
            <dt className="data-label">{term}</dt>
            <dd className="mt-1 break-words">{value}</dd>
          </div>
        ))}
      </dl>

      <NoteForm contact={contact} />
    </div>
  );
}

export function Board({
  items,
  total,
  people,
  me,
}: {
  items: Contact[];
  total: number;
  people: People;
  me: Me;
}) {
  const toast = useToast();
  const board = useRef<HTMLDivElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);
  const [list, apply] = useOptimistic(items, (current: Contact[], move: Move) =>
    current.map((contact) =>
      contact.id === move.id
        ? {
            ...contact,
            status: move.status,
            status_by: me.id,
            status_by_name: me.name,
            status_at: new Date().toISOString(),
          }
        : contact,
    ),
  );
  const everyone: People = { ...people, [me.id]: me };
  const [openId, setOpenId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const selected = list.find((contact) => contact.id === openId) ?? null;

  const snapshot = () => {
    if (!board.current || prefersReducedMotion()) return;
    flip.current = Flip.getState(board.current.querySelectorAll('[data-card]'));
  };

  useLayoutEffect(() => {
    const state = flip.current;
    if (!state || !board.current) return;
    flip.current = null;
    Flip.from(state, {
      targets: board.current.querySelectorAll('[data-card]'),
      duration: 0.48,
      ease: 'power3.out',
      scale: true,
      zIndex: 30,
    });
  }, [list]);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !board.current) return;
      gsap.fromTo(
        board.current.querySelectorAll('[data-card]'),
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.42,
          ease: 'power3.out',
          stagger: 0.035,
          delay: 0.1,
          clearProps: 'transform,opacity',
        },
      );
    },
    { scope: board },
  );

  const move: MoveHandler = (contact, status, quiet = false) => {
    if (contact.status === status) return;
    const from = contact.status;
    snapshot();
    startTransition(async () => {
      apply({ id: contact.id, status });
      const result = await setContactStatus(contact.id, status);
      if (!result.ok) {
        snapshot();
        toast({ tone: 'error', message: result.message ?? 'Chưa đổi được trạng thái.' });
        return;
      }
      if (quiet) return;
      toast({
        message: `Đã chuyển ${contact.name} sang ${STATUS[status].label}.`,
        action: { label: 'Hoàn tác', run: () => move({ ...contact, status }, from) },
      });
    });
  };

  return (
    <>
      {total > items.length ? (
        <p data-enter className="mb-3 text-[13px] text-[var(--ink-faint)]">
          Đang hiện {items.length} brief mới nhất trên tổng {total}.
        </p>
      ) : null}
      <div
        ref={board}
        data-enter
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 xl:mx-0 xl:grid xl:grid-cols-5 xl:overflow-visible xl:px-0 xl:pb-0"
      >
        {STATUSES.map((status) => {
          const cards = list.filter((contact) => contact.status === status);
          return (
            <section
              key={status}
              data-column={status}
              aria-labelledby={`lane-${status}`}
              className="kanban-lane"
            >
              <header className="flex items-center gap-2 px-2 pt-1 pb-3">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ backgroundColor: STATUS[status].color }}
                />
                <h2 id={`lane-${status}`} className="text-[14px] font-semibold tracking-normal">
                  {STATUS[status].label}
                </h2>
                <span className="tabnum ml-auto rounded-full bg-[var(--admin-card)] px-2 py-0.5 text-[12px] text-[var(--ink-soft)] shadow-[var(--shadow-1)]">
                  {cards.length}
                </span>
              </header>
              <ul className="flex flex-1 flex-col gap-2.5">
                {cards.map((contact) => (
                  <li key={contact.id}>
                    <Card
                      contact={contact}
                      handler={handlerOf(contact, everyone)}
                      onOpen={(id) => {
                        setOpenId(id);
                        setOpen(true);
                      }}
                      onDrop={move}
                    />
                  </li>
                ))}
                {cards.length === 0 ? (
                  <li className="grid min-h-28 flex-1 place-items-center rounded-[var(--radius-lg)] border border-dashed border-[var(--rule)] px-3 text-center text-[13px] text-[var(--ink-faint)]">
                    <span className="pointer-fine:hidden">Chưa có brief</span>
                    <span className="hidden pointer-fine:inline">Thả thẻ vào đây</span>
                  </li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>

      <Dialog
        side
        open={open}
        onClose={() => setOpen(false)}
        title={selected?.name ?? ''}
        description={selected ? `Gửi lúc ${when(selected.submitted_at)}` : undefined}
      >
        {selected ? (
          <Detail
            key={selected.id}
            contact={selected}
            handler={handlerOf(selected, everyone)}
            onMove={move}
          />
        ) : null}
      </Dialog>
    </>
  );
}
