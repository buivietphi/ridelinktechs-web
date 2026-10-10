'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';
import { ArrowLeft } from 'phosphor-react';
import { useRef } from 'react';
import { LogoMark } from '@/components/ui/LogoMark';
import { prefersReducedMotion } from '@/lib/animations';
import type { EndReason } from '@/lib/admin/session';
import { LoginForm } from './LoginForm';

gsap.registerPlugin(useGSAP);

const ENDED: Record<EndReason, string> = {
  admin_logout: 'Admin đã đăng xuất bạn khỏi thiết bị này. Đăng nhập lại để tiếp tục.',
  self_logout: 'Bạn đã đăng xuất thiết bị này từ một thiết bị khác. Đăng nhập lại để tiếp tục.',
  account_blocked: 'Tài khoản của bạn vừa bị khoá. Liên hệ admin để mở lại.',
  device_blocked:
    'Thiết bị này vừa bị khoá. Mở khoá trong Tài khoản của tôi ở thiết bị khác, hoặc nhờ admin.',
  password_reset: 'Admin vừa đặt lại mật khẩu của bạn. Hỏi admin mật khẩu tạm mới để đăng nhập.',
  password_changed:
    'Mật khẩu vừa được đổi trên một thiết bị khác. Đăng nhập lại bằng mật khẩu mới.',
  expired: 'Phiên đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục.',
  ended: 'Phiên đăng nhập đã kết thúc. Đăng nhập lại để tiếp tục.',
};

export function LoginScreen({ ended }: { ended: EndReason | null }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(
          '[data-logo]',
          { scale: 0.86, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.56 },
        )
        .fromTo(
          '[data-rise]',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.48, stagger: 0.06, clearProps: 'transform,opacity' },
          '-=0.34',
        );
    },
    { scope: root },
  );

  return (
    <main
      ref={root}
      id="main"
      className="grid min-h-dvh bg-[var(--ground)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
    >
      <section
        aria-hidden
        className="wash relative hidden flex-col justify-between overflow-hidden p-12 lg:flex xl:p-16"
      >
        <p data-rise className="data-label">
          ridelinktechs.com/admin
        </p>
        <div>
          <div data-logo className="inline-block">
            <LogoMark size={112} plateOnDark priority className="rounded-[var(--radius-xl)]" />
          </div>
          <p data-rise className="display-xl mt-8">
            RideLink Techs
          </p>
          <p
            data-rise
            className="mt-3 max-w-[38ch] text-[17px] leading-[1.6] text-[var(--ink-soft)]"
          >
            Brief liên hệ, tài khoản và thiết bị đăng nhập của công ty, ở cùng một chỗ.
          </p>
        </div>
        <p data-rise className="text-[13px] text-[var(--ink-faint)]">
          Đà Nẵng, Việt Nam
        </p>
      </section>

      <section className="flex flex-col justify-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-[400px]">
          <div data-rise className="flex items-center gap-3 lg:hidden">
            <LogoMark size={48} plateOnDark priority className="rounded-[var(--radius-md)]" />
            <div>
              <p className="text-[16px] leading-tight font-bold">RideLink Techs</p>
              <p className="data-label mt-0.5">Quản trị</p>
            </div>
          </div>
          <h1 data-rise className="display-xl mt-10 lg:mt-0">
            Đăng nhập
          </h1>
          <p data-rise className="mt-2 text-[15px] leading-[1.6] text-[var(--ink-soft)]">
            Dùng tài khoản được cấp. Thiết bị này sẽ được ghi nhận khi bạn đăng nhập.
          </p>
          <LoginForm notice={ended ? ENDED[ended] : null} />
          <Link
            data-rise
            href="/"
            className="mt-10 inline-flex items-center gap-2 text-[14px] text-[var(--ink-soft)] transition-colors duration-200 hover:text-[var(--ink)]"
          >
            <ArrowLeft size={16} aria-hidden />
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
