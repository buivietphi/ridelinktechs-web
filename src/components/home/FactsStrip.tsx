import { CountUp } from '@/components/motion/CountUp';
import { RevealGroup } from '@/components/motion/Reveal';

type Fact = { to: number; from?: number; suffix?: string; label: string };

export function FactsStrip({ facts }: { facts: Fact[] }) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3" stagger={0.1} y={26}>
        {facts.map((fact) => (
          <div
            key={fact.label}
            data-reveal-item
            className="panel group/fact flex flex-col gap-7 border border-[var(--rule)] px-7 py-8 transition-colors duration-500 hover:border-[color-mix(in_oklab,var(--signal-violet)_30%,var(--rule))] sm:py-9"
          >
            <p className="text-brand flex items-baseline text-[clamp(2.75rem,4.5vw,4rem)] leading-[0.9] font-extrabold tracking-[-0.04em]">
              <CountUp to={fact.to} from={fact.from} />
              {fact.suffix ? (
                <span className="text-[0.55em] font-bold tracking-normal">{fact.suffix}</span>
              ) : null}
            </p>
            <div className="mt-auto flex flex-col gap-3.5">
              <span
                aria-hidden
                className="h-px w-9 origin-left bg-[linear-gradient(90deg,var(--signal-violet),transparent)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/fact:w-16"
              />
              <p className="text-[15px] leading-[1.45] text-[var(--ink-soft)]">{fact.label}</p>
            </div>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}
