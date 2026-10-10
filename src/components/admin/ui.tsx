import Image from 'next/image';
import { initials } from '@/lib/admin/format';
import type { Role } from '@/lib/admin/roles';
import { cn } from '@/lib/cn';

const AVATAR: Record<Role, string> = {
  admin: 'bg-[var(--signal-deep)]',
  owner: 'bg-[var(--signal-violet)]',
  sub: 'bg-[var(--signal-cyan)]',
};

export function Avatar({
  name,
  role,
  src,
  size = 40,
}: {
  name: string;
  role?: Role;
  src?: string | null;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover shadow-[var(--shadow-1)]"
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-semibold shadow-[var(--shadow-1)]',
        role
          ? cn(AVATAR[role], 'text-[var(--ink-on-signal)]')
          : 'bg-[var(--ground-lift)] text-[var(--ink)]',
      )}
    >
      {initials(name)}
    </span>
  );
}

export function Chip({
  color,
  children,
  className,
}: {
  color?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[var(--rule)] px-2.5 py-1 text-[12px] leading-none font-medium whitespace-nowrap text-[var(--ink-soft)]',
        className,
      )}
    >
      {color ? (
        <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      {children}
    </span>
  );
}

export function PageHead({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div data-enter className="min-w-0">
        <h1 className="display-xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[62ch] text-[15px] leading-[1.6] text-[var(--ink-soft)]">
            {description}
          </p>
        ) : null}
      </div>
      {children ? (
        <div data-enter className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {children}
        </div>
      ) : null}
    </div>
  );
}
