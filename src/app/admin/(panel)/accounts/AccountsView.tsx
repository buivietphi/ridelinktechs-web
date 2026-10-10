'use client';

import Link from 'next/link';
import {
  CaretRight,
  Key,
  Lock,
  LockOpen,
  PencilSimple,
  Plus,
  SignOut,
  Trash,
  UserCircle,
} from 'phosphor-react';
import { useEffect, useState, useTransition } from 'react';
import { DeviceRow, type DeviceLite } from '@/components/admin/devices';
import { Dialog } from '@/components/admin/Dialog';
import {
  Actions,
  Credentials,
  Field,
  FormError,
  PasswordField,
  RolePicker,
} from '@/components/admin/forms';
import { Avatar, Chip, PageHead } from '@/components/admin/ui';
import { ago, when } from '@/lib/admin/format';
import { randomPassword } from '@/lib/admin/password';
import type { ActionResult } from '@/lib/admin/result';
import { ROLE_HINT, ROLE_LABEL, ROLES, type Role } from '@/lib/admin/roles';
import { cn } from '@/lib/cn';
import {
  createAccount,
  deleteAccount,
  logoutAccount,
  resetAccountPassword,
  setAccountBlocked,
  updateAccount,
} from './actions';

export type Account = {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  avatar: string | null;
  is_blocked: boolean;
  must_change_password: boolean;
  created_at: string;
  last_login_at: string | null;
  password_changed_at: string | null;
  device_count: number;
  session_count: number;
  is_self: boolean;
  can_manage: boolean;
  devices: DeviceLite[];
};

type Panel = { kind: 'create' } | { kind: 'edit' | 'reset' | 'delete'; account: Account };

const FAILED = 'Chưa làm được. Thử lại sau.';
const SMALL = 'min-h-10 px-4 text-[13px]';

function stateOf(account: Account): [string, string] {
  if (account.is_blocked) return ['Đã khoá', 'var(--warn)'];
  if (account.must_change_password) return ['Chờ đổi mật khẩu', 'var(--signal-cyan)'];
  return ['Hoạt động', 'var(--ok)'];
}

const rolesFor = (actor: Role): Role[] => (actor === 'admin' ? ROLES : ['sub']);

function CreateBody({ actor, onClose }: { actor: Role; onClose: () => void }) {
  const roles = rolesFor(actor);
  const [values, setValues] = useState(() => ({
    email: '',
    name: '',
    role: 'sub' as Role,
    password: randomPassword(),
  }));
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (created) {
    return (
      <Credentials
        title="Đã tạo tài khoản."
        email={created.email}
        password={created.password}
        note="Gửi riêng email và mật khẩu tạm này cho người đó."
        onDone={onClose}
      />
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        start(async () => {
          const result = await createAccount(values);
          if (result.ok) {
            setCreated({ email: values.email.trim().toLowerCase(), password: values.password });
          } else setError(result.message ?? FAILED);
        });
      }}
      className="flex flex-col gap-5"
    >
      <Field id="new-email" label="Email">
        <input
          id="new-email"
          data-autofocus
          type="email"
          required
          autoComplete="off"
          value={values.email}
          onChange={(event) => setValues((v) => ({ ...v, email: event.target.value }))}
          className="field"
        />
      </Field>
      <Field id="new-name" label="Tên hiển thị">
        <input
          id="new-name"
          required
          maxLength={80}
          autoComplete="off"
          value={values.name}
          onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
          className="field"
        />
      </Field>
      <RolePicker
        name="new-role"
        value={values.role}
        roles={roles}
        note={actor === 'owner' ? 'Owner chỉ tạo được tài khoản Sub.' : undefined}
        onChange={(role) => setValues((v) => ({ ...v, role }))}
      />
      <PasswordField
        id="new-password"
        label="Mật khẩu tạm"
        value={values.password}
        onChange={(password) => setValues((v) => ({ ...v, password }))}
      />
      <FormError message={error} />
      <Actions>
        <button type="button" onClick={onClose} className="btn">
          Huỷ
        </button>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Đang tạo…' : 'Tạo tài khoản'}
        </button>
      </Actions>
    </form>
  );
}

function EditBody({
  actor,
  account,
  onClose,
}: {
  actor: Role;
  account: Account;
  onClose: () => void;
}) {
  const [name, setName] = useState(account.display_name);
  const [role, setRole] = useState<Role>(account.role);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const roles = account.is_self ? [account.role] : rolesFor(actor);
  const note = account.is_self
    ? 'Bạn không thể tự đổi quyền của chính mình.'
    : actor === 'owner'
      ? 'Owner chỉ quản lý tài khoản Sub.'
      : undefined;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        start(async () => {
          const result = await updateAccount(account.id, name, role);
          if (!result.ok) return setError(result.message ?? FAILED);
          onClose();
        });
      }}
      className="flex flex-col gap-5"
    >
      <Field id="edit-name" label="Tên hiển thị">
        <input
          id="edit-name"
          data-autofocus
          required
          maxLength={80}
          autoComplete="off"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="field"
        />
      </Field>
      <RolePicker name="edit-role" value={role} roles={roles} note={note} onChange={setRole} />
      <FormError message={error} />
      <Actions>
        <button type="button" onClick={onClose} className="btn">
          Huỷ
        </button>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Đang lưu…' : 'Lưu'}
        </button>
      </Actions>
    </form>
  );
}

function ResetBody({ account, onClose }: { account: Account; onClose: () => void }) {
  const [password, setPassword] = useState(() => randomPassword());
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <Credentials
        title="Đã đặt mật khẩu tạm."
        email={account.email}
        password={done}
        note="Gửi riêng mật khẩu tạm này cho người đó."
        onDone={onClose}
      />
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        start(async () => {
          const result = await resetAccountPassword(account.id, password);
          if (result.ok) setDone(password);
          else setError(result.message ?? FAILED);
        });
      }}
      className="flex flex-col gap-5"
    >
      <PasswordField
        id="reset-password"
        label="Mật khẩu tạm mới"
        value={password}
        onChange={setPassword}
      />
      <FormError message={error} />
      <Actions>
        <button type="button" data-autofocus onClick={onClose} className="btn">
          Huỷ
        </button>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Đang đặt…' : 'Đặt mật khẩu tạm'}
        </button>
      </Actions>
    </form>
  );
}

function DeleteBody({ account, onClose }: { account: Account; onClose: () => void }) {
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ready = typed.trim().toLowerCase() === account.email;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!ready) return;
        setError(null);
        start(async () => {
          const result = await deleteAccount(account.id);
          if (!result.ok) return setError(result.message ?? FAILED);
          onClose();
        });
      }}
      className="flex flex-col gap-5"
    >
      <Field id="confirm-text" label={`Gõ ${account.email} để xác nhận`}>
        <input
          id="confirm-text"
          data-autofocus
          autoComplete="off"
          spellCheck={false}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          className="field"
        />
      </Field>
      <FormError message={error} />
      <Actions>
        <button type="button" onClick={onClose} className="btn">
          Huỷ
        </button>
        <button type="submit" disabled={pending || !ready} className="btn btn-danger">
          {pending ? 'Đang xoá…' : 'Xoá tài khoản'}
        </button>
      </Actions>
    </form>
  );
}

function AccountDetail({
  account,
  onPanel,
}: {
  account: Account;
  onPanel: (panel: Panel) => void;
}) {
  const [label, color] = stateOf(account);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const run = (action: () => Promise<ActionResult>, success?: string) =>
    start(async () => {
      setNote(null);
      const result = await action();
      if (!result.ok) return setNote({ ok: false, text: result.message ?? FAILED });
      setAsking(false);
      if (success) setNote({ ok: true, text: success });
    });

  const facts: [string, string][] = [
    ['Quyền', ROLE_HINT[account.role]],
    ['Tạo lúc', when(account.created_at)],
    ['Đăng nhập gần nhất', account.last_login_at ? when(account.last_login_at) : 'Chưa đăng nhập'],
    [
      'Đổi mật khẩu gần nhất',
      account.password_changed_at ? when(account.password_changed_at) : 'Chưa đổi',
    ],
    ['Phiên đang mở', String(account.session_count)],
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-4">
        <Avatar name={account.display_name} role={account.role} src={account.avatar} size={64} />
        <div className="flex flex-wrap gap-2">
          <Chip>{ROLE_LABEL[account.role]}</Chip>
          <Chip color={color}>{label}</Chip>
          {account.is_self ? <span className="self-chip">Bạn</span> : null}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
        {facts.map(([term, value]) => (
          <div key={term} className="min-w-0">
            <dt className="data-label">{term}</dt>
            <dd className="mt-1 break-words" suppressHydrationWarning>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {account.is_self ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-autofocus
            onClick={() => onPanel({ kind: 'edit', account })}
            className={cn('btn', SMALL)}
          >
            <PencilSimple size={16} aria-hidden />
            Sửa tên hiển thị
          </button>
          <Link href="/admin/profile" className={cn('btn', SMALL)}>
            <UserCircle size={16} aria-hidden />
            Tài khoản của tôi
          </Link>
        </div>
      ) : account.can_manage ? (
        <section aria-labelledby="account-actions" className="flex flex-col gap-3">
          <h3 id="account-actions" className="label mb-0">
            Thao tác
          </h3>
          {asking ? (
            <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--admin-lane)] p-4">
              <p className="text-[14px] leading-[1.5]">
                Khoá {account.display_name}? Mọi phiên bị đăng xuất ngay, và người này không đăng
                nhập được cho đến khi mở khoá.
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setAsking(false)} className={cn('btn', SMALL)}>
                  Huỷ
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => setAccountBlocked(account.id, true))}
                  className={cn('btn btn-danger', SMALL)}
                >
                  {pending ? 'Đang khoá…' : 'Khoá tài khoản'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2" aria-busy={pending}>
              <button
                type="button"
                data-autofocus
                onClick={() => onPanel({ kind: 'edit', account })}
                className={cn('btn', SMALL)}
              >
                <PencilSimple size={16} aria-hidden />
                Sửa
              </button>
              <button
                type="button"
                onClick={() => onPanel({ kind: 'reset', account })}
                className={cn('btn', SMALL)}
              >
                <Key size={16} aria-hidden />
                Đặt lại mật khẩu
              </button>
              {account.session_count > 0 ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    run(() => logoutAccount(account.id), 'Đã đăng xuất khỏi mọi thiết bị.')
                  }
                  className={cn('btn', SMALL)}
                >
                  <SignOut size={16} aria-hidden />
                  Đăng xuất mọi thiết bị
                </button>
              ) : null}
              {account.is_blocked ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => setAccountBlocked(account.id, false))}
                  className={cn('btn', SMALL)}
                >
                  <LockOpen size={16} aria-hidden />
                  Mở khoá
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNote(null);
                    setAsking(true);
                  }}
                  className={cn('btn', SMALL)}
                >
                  <Lock size={16} aria-hidden />
                  Khoá tài khoản
                </button>
              )}
              <button
                type="button"
                onClick={() => onPanel({ kind: 'delete', account })}
                className={cn('btn text-[var(--warn)]', SMALL)}
              >
                <Trash size={16} aria-hidden />
                Xoá tài khoản
              </button>
            </div>
          )}
          {note ? (
            <p
              role="status"
              className={cn(
                'text-[13px]',
                note.ok ? 'text-[var(--ink-soft)]' : 'text-[var(--warn)]',
              )}
            >
              {note.text}
            </p>
          ) : null}
        </section>
      ) : (
        <p className="text-[14px] leading-[1.55] text-[var(--ink-soft)]">
          Bạn chỉ xem được tài khoản này. Owner quản lý tài khoản Sub, Admin quản lý mọi tài khoản.
        </p>
      )}

      {account.is_self || account.can_manage ? (
        <section aria-labelledby="account-devices">
          <h3 id="account-devices" className="label">
            Thiết bị ({account.devices.length})
          </h3>
          {account.devices.length ? (
            <ul className="divide-y divide-[var(--rule-2)]">
              {account.devices.map((device) => (
                <DeviceRow key={device.id} device={device} manage={device.can_manage} />
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-[var(--ink-soft)]">Chưa đăng nhập trên thiết bị nào.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}

function AccountCard({ account, onOpen }: { account: Account; onOpen: () => void }) {
  const [label, color] = stateOf(account);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'account-card panel block w-full p-5 text-left sm:p-6',
        account.is_blocked && 'opacity-75',
      )}
    >
      <span className="flex items-start gap-3.5">
        <Avatar name={account.display_name} role={account.role} src={account.avatar} size={46} />
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="flex flex-wrap items-center gap-2 text-[16px] leading-tight font-semibold">
            <span className="min-w-0 break-words">{account.display_name}</span>
            {account.is_self ? <span className="self-chip">Bạn</span> : null}
          </span>
          <span className="mt-1 block truncate text-[13px] text-[var(--ink-soft)]">
            {account.email}
          </span>
        </span>
        <CaretRight size={18} aria-hidden className="mt-1 shrink-0 text-[var(--ink-faint)]" />
      </span>
      <span className="mt-5 flex flex-wrap gap-2">
        <Chip>{ROLE_LABEL[account.role]}</Chip>
        <Chip color={color}>{label}</Chip>
      </span>
      <span className="mt-5 grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-t border-[var(--rule-2)] pt-4 text-[13px]">
        <span className="min-w-0">
          <span className="data-label block">Đăng nhập</span>
          <span className="mt-1 block" suppressHydrationWarning>
            {ago(account.last_login_at, 'Chưa có')}
          </span>
        </span>
        <span>
          <span className="data-label block">Thiết bị</span>
          <span className="tabnum mt-1 block">{account.device_count}</span>
        </span>
        <span>
          <span className="data-label block">Phiên mở</span>
          <span className="tabnum mt-1 block">{account.session_count}</span>
        </span>
      </span>
    </button>
  );
}

const PANEL_COPY = {
  create: {
    title: 'Thêm tài khoản',
    description: () =>
      'Người mới đăng nhập bằng mật khẩu tạm, rồi phải đổi sang mật khẩu của mình.',
  },
  edit: { title: 'Sửa tài khoản', description: (a?: Account) => a?.email ?? '' },
  reset: {
    title: 'Đặt lại mật khẩu',
    description: (a?: Account) =>
      `${a?.display_name ?? ''} bị đăng xuất khỏi mọi thiết bị ngay và phải đổi mật khẩu khi đăng nhập lại.`,
  },
  delete: {
    title: 'Xoá tài khoản?',
    description: (a?: Account) =>
      `Xoá hẳn ${a?.email ?? ''} cùng thiết bị và phiên đăng nhập của tài khoản này. Không hoàn tác được.`,
  },
} satisfies Record<Panel['kind'], { title: string; description: (a?: Account) => string }>;

export function AccountsView({ accounts, role }: { accounts: Account[]; role: Role }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [nonce, setNonce] = useState(0);
  const selected = accounts.find((account) => account.id === selectedId) ?? null;

  useEffect(() => {
    if (drawer && !selected) setDrawer(false);
  }, [drawer, selected]);

  const showPanel = (next: Panel) => {
    setPanel(next);
    setNonce((n) => n + 1);
    setPanelOpen(true);
  };
  const closePanel = () => setPanelOpen(false);
  const target = panel && panel.kind !== 'create' ? panel.account : undefined;
  const copy = panel ? PANEL_COPY[panel.kind] : null;

  return (
    <div className="flex flex-col gap-7">
      <PageHead
        title="Tài khoản"
        description={
          role === 'admin'
            ? 'Admin quản lý mọi tài khoản và thiết bị. Owner quản lý tài khoản Sub. Sub làm việc với liên hệ.'
            : 'Bạn quản lý được tài khoản Sub: tạo mới, sửa, đặt lại mật khẩu, khoá và thiết bị của họ.'
        }
      >
        <button
          type="button"
          onClick={() => showPanel({ kind: 'create' })}
          className="btn btn-primary"
        >
          <Plus size={16} weight="bold" aria-hidden />
          Thêm tài khoản
        </button>
      </PageHead>

      <ul data-enter className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => (
          <li key={account.id}>
            <AccountCard
              account={account}
              onOpen={() => {
                setSelectedId(account.id);
                setDrawer(true);
              }}
            />
          </li>
        ))}
      </ul>

      <Dialog
        side
        open={drawer}
        onClose={() => setDrawer(false)}
        title={selected?.display_name ?? ''}
        description={selected?.email}
      >
        {selected ? (
          <AccountDetail key={selected.id} account={selected} onPanel={showPanel} />
        ) : null}
      </Dialog>

      <Dialog
        open={panelOpen}
        onClose={closePanel}
        title={copy?.title ?? ''}
        description={copy?.description(target)}
      >
        {panel?.kind === 'create' ? (
          <CreateBody key={nonce} actor={role} onClose={closePanel} />
        ) : null}
        {panel?.kind === 'edit' ? (
          <EditBody key={nonce} actor={role} account={panel.account} onClose={closePanel} />
        ) : null}
        {panel?.kind === 'reset' ? (
          <ResetBody key={nonce} account={panel.account} onClose={closePanel} />
        ) : null}
        {panel?.kind === 'delete' ? (
          <DeleteBody key={nonce} account={panel.account} onClose={closePanel} />
        ) : null}
      </Dialog>
    </div>
  );
}
