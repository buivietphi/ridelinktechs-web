import { CountUp } from '@/components/motion/CountUp';
import { RevealGroup } from '@/components/motion/Reveal';

type Fact = { to: number; from?: number; label: string };

export function FactsStrip({ facts }: { facts: Fact[] }) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3" stagger={0.1} y={26}>
        {facts.map((fact) => (
          <div
            key={fact.label}
            data-reveal-item
            className="panel flex items-end justify-between gap-6 border border-[var(--rule)] px-7 py-8 sm:min-h-[250px] sm:flex-col sm:items-start sm:gap-10 sm:py-9"
          >
            <p className="text-brand text-[clamp(3.25rem,6vw,5.5rem)] leading-[0.85] font-extrabold tracking-[-0.05em]">
              <CountUp to={fact.to} from={fact.from} />
            </p>
            <p className="max-w-[18ch] text-right text-[15px] leading-[1.45] text-[var(--ink-soft)] sm:text-left">
              {fact.label}
            </p>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}
