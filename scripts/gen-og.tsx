/**
 * Renders public/og.png, the social share card.
 * Run via `pnpm gen:og` after changing the brand copy or logo.
 */
import React from 'react';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

const buf = async (p: string) => {
  const b = await readFile(join(process.cwd(), p));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
};

const dataUrl = async (p: string, mime: string) =>
  `data:${mime};base64,${(await readFile(join(process.cwd(), p))).toString('base64')}`;

async function main() {
  const [regular, bold, logo] = await Promise.all([
    buf('src/assets/fonts/BeVietnamPro-Regular.ttf'),
    buf('src/assets/fonts/BeVietnamPro-Bold.ttf'),
    dataUrl('public/logo/logo-dark.png', 'image/png'),
  ]);

  const res = new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: 'linear-gradient(135deg, #0C0E14 0%, #14182B 55%, #1B1035 100%)',
        fontFamily: 'BeVietnamPro',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- satori needs a plain img */}
        <img src={logo} width={62} height={62} style={{ borderRadius: 14 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#F5F6F8', letterSpacing: -0.5 }}>
            RideLink Techs
          </div>
          <div style={{ fontSize: 27, color: '#A0A5B8' }}>Công ty phần mềm · Đà Nẵng</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 92,
          fontWeight: 700,
          color: '#F5F6F8',
          lineHeight: 1.06,
        }}
      >
        <div>Chúng tôi xây.</div>
        <div>Chúng tôi chạy.</div>
        <div style={{ color: '#A78BFA' }}>Bạn làm chủ.</div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.14)',
          paddingTop: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #7C5CFF, #22D3EE)',
            }}
          />
          <div style={{ fontSize: 27, color: '#C9CCDA' }}>ridelinktechs.com</div>
        </div>
        <div style={{ fontSize: 24, color: '#8B90A5' }}>
          14 Tân Thái 1, Phường Sơn Trà, Đà Nẵng, Việt Nam
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'BeVietnamPro', data: regular, weight: 400, style: 'normal' },
        { name: 'BeVietnamPro', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );

  await writeFile(join(process.cwd(), 'public/og.png'), Buffer.from(await res.arrayBuffer()));
  console.log('wrote public/og.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
