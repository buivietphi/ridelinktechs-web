import { about } from '@/content/about';
import { company } from '@/content/company';
import { products } from '@/content/products';
import { SITE } from '@/lib/schema';

export const dynamic = 'force-static';

const STATUS: Record<string, string> = {
  'in-development': 'đang phát triển',
  upcoming: 'sắp ra mắt',
  shipped: 'đã bàn giao',
};

/**
 * Plain-text summary for LLM crawlers (GPTBot, ClaudeBot, PerplexityBot...).
 * Generated from products.json so adding a product needs no edit here.
 * https://llmstxt.org
 */
function build(): string {
  const lines: string[] = [
    `# ${company.name}`,
    '',
    `> ${company.tagline.vi} Tự phát triển sản phẩm riêng và nhận làm dự án phần mềm trọn gói trên mobile, web, desktop và backend, bàn giao đầy đủ mã nguồn cùng tài liệu kỹ thuật.`,
    '',
    '## Sản phẩm của chúng tôi',
    '',
  ];

  for (const p of products) {
    const status = STATUS[p.status] ?? p.status;
    const kind = p.kind.vi;
    const name = p.name.en !== p.name.vi ? `${p.name.vi} (${p.name.en})` : p.name.vi;
    lines.push(
      `- [${name}](${SITE}/products/${p.slug}) [${status}]: ${p.tagline.vi} ${p.description.vi}`,
    );
  }

  lines.push(
    '',
    '## Dịch vụ',
    '',
    ...about.focusAreas.map((f) => `- ${f.title.vi}: ${f.description.vi}`),
    '',
    '## Công nghệ',
    '',
    ...about.practice.stack.map((g) => `- ${g.label.vi}: ${g.items.join(', ')}`),
    '',
    '## Liên hệ',
    '',
    `- Email: ${company.email}`,
    `- Điện thoại: ${company.phoneDisplay}`,
    `- Địa chỉ: ${company.address.vi}`,
    `- Website: ${SITE}`,
    '',
    '## Ghi chú',
    '',
    `- Trang này được sinh tự động từ ${SITE}/sitemap.xml và dữ liệu sản phẩm của website.`,
    `- Ngôn ngữ chính: tiếng Việt. Bản tiếng Anh có tại cùng đường dẫn với locale en.`,
  );

  return `${lines.join('\n')}\n`;
}

export async function GET() {
  return new Response(build(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
