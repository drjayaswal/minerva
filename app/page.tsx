"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, ElementType } from "react";
import { toast } from "sonner";

function useReveal(threshold = 0.15) {
  const ref = useRef<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const { ref, visible } = useReveal(0.3);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(parseFloat((ease * to).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, to, decimals]);

  return (
    <span ref={ref}>
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val)}{suffix}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  as: Component = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
  as?: ElementType;
}) {
  const { ref, visible } = useReveal(0.1);
  const transforms: Record<string, string> = {
    up: "translateY(48px)",
    left: "translateX(-48px)",
    right: "translateX(48px)",
    none: "none",
  };
  return (
    <Component
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Component>
  );
}

const benchmarks = [
  { label: "MMLU", score: 68.4, max: 100, desc: "Multitask knowledge and problem solving" },
  { label: "HumanEval", score: 62.8, max: 100, desc: "Python coding tasks (Pass@1)" },
  { label: "MATH", score: 51.9, max: 100, desc: "Advanced mathematical reasoning" },
  { label: "HellaSwag", score: 80.4, max: 100, desc: "Common sense NLI" },
  { label: "GSM8K", score: 82.5, max: 100, desc: "Grade-school math word problems" },
  { label: "ARC-Challenge", score: 83.4, max: 100, desc: "Hard-set reasoning questions" },
];

const stats = [
  { value: 128, suffix: "K", label: "Context Window", sub: "tokens" },
  { value: 8.03, suffix: "B", label: "Parameters", sub: "dense architecture", decimals: 2 },
  { value: 15.6, suffix: "T", label: "Training Data", sub: "tokens", decimals: 1 },
  { value: 128, suffix: "K", label: "Vocabulary", sub: "tiktoken bpe", decimals: 0 },
];

const capabilities = [
  { icon: "aê",  title: "Multilingual", desc: "Native fluency in 8+ languages including English, German, French, Italian, and Hindi." },
  { icon: "⟨/⟩", title: "Tool Use", desc: "Zero-shot function calling for real-time API orchestration and search engine integration." },
  { icon: "∑",  title: "GQA Attention", desc: "Grouped-Query Attention for high-throughput, low-latency inference at scale." },
  { icon: "◎",  title: "Safety Aligned", desc: "Tuned with Llama Guard 3 and CyberSec Eval 2 for enterprise-grade deployments." },
  { icon: "⇌",  title: "FP8 Native", desc: "Optimized for 8-bit quantization with zero performance degradation on H100s." },
  { icon: "⬚",  title: "128K Context", desc: "Full 'Needle In A Haystack' retrieval accuracy across the entire 128,000 token range." },
];

const comparisons = [
  { model: "Minerva", mmlu: 68.4, humaneval: 62.8, math: 51.9, highlight: true },
  { model: "Llama 2 70B", mmlu: 67.3, humaneval: 32.2, math: 13.5, highlight: false },
  { model: "Gemma 7B", mmlu: 64.3, humaneval: 32.3, math: 24.3, highlight: false },
  { model: "GPT-3.5 Turbo", mmlu: 70.0, humaneval: 48.1, math: 34.1, highlight: false },
];
export default function HomePage() {
  const router = useRouter();
  
  return (
    <div className="bg-accent text-white overflow-x-hidden">
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="w-full max-w-4xl flex flex-col justify-center items-center space-y-8 sm:space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <svg viewBox="0 0 500 500" className="w-30 scale-150 h-30">
              <defs>
                <ellipse id="petal16" cx="340" cy="250" rx="90" ry="28" fill="none" stroke="white" strokeWidth="8" />
              </defs>
              <g>
                {[...Array(16)].map((_, i) => (
                  <use key={i} href="#petal16" transform={`rotate(${i * 22.5} 250 250)`} />
                ))}
              </g>
            </svg>
            <h1 className="relative text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-medium tracking-tight text-white">
              Minerva
            </h1>
          </div>
        </div>
      </div>

      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <Reveal direction="up" className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight">Built for scale, Tuned for precision</h2>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} direction="up">
              <div className="bg-accent p-8 sm:p-10 flex flex-col items-center text-center h-full">
                <span className="text-4xl sm:text-5xl font-medium tracking-tight mb-1">
                  <Counter to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
                </span>
                <span className="text-sm font-medium text-white/80 mt-1">{s.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <Reveal direction="left" className="mb-14">
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight">How Minerva is performing</h2>
        </Reveal>
        <div className="space-y-6">
          {benchmarks.map((b, i) => (
            <BenchmarkBar key={b.label} {...b} delay={i * 90} />
          ))}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <Reveal direction="up" className="text-left mb-14">
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight">What Minerva can do</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-none overflow-hidden border border-white/10">
          {capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 70} direction="up">
              <div className="bg-accent p-8 h-full group hover:bg-white/5 transition-colors duration-300">
                <div className="text-2xl mb-5 font-light opacity-60 group-hover:opacity-100 transition-opacity duration-300 select-none">
                  {c.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{c.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <Reveal direction="right" className="mb-14">
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight">How Minerva stacks up</h2>
        </Reveal>
        <Reveal delay={100} direction="up">
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-5 text-white font-normal text-xs uppercase tracking-widest">Model</th>
                  <th className="text-center p-5 text-white font-normal text-xs uppercase tracking-widest">MMLU</th>
                  <th className="text-center p-5 text-white font-normal text-xs uppercase tracking-widest">HumanEval</th>
                  <th className="text-center p-5 text-white font-normal text-xs uppercase tracking-widest">MATH</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <Reveal
                    as="tr"
                    key={row.model}
                    delay={i * 60}
                    direction="none"
                    className={`border-b border-white/5 last:border-0 transition-colors duration-200 ${row.highlight && "bg-white/8 text-lg"}`}
                  >
                    <td className="p-5 font-medium flex items-center gap-3">
                      {row.highlight && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                      {row.model}
                    </td>
                    <td className="p-5 text-center tabular-nums">{row.mmlu}</td>
                    <td className="p-5 text-center tabular-nums">{row.humaneval}</td>
                    <td className="p-5 text-center tabular-nums">{row.math}</td>
                  </Reveal>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-white/65 mt-4 text-right">Evaluated on public test sets · April 2025</p>
        </Reveal>
      </section>

      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <Reveal direction="right" className="mb-14">
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight">Miscellaneous</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-8">
          <Reveal direction="left" delay={0}>
            <div className="p-8 h-full">
              <div className="space-y-4">
                {[
                  ["Architecture", "Transformer, decoder-only"],
                  ["Training cutoff", "March 2025"],
                  ["Languages", "95+ languages"],
                  ["License", "Proprietary"],
                  ["Inference", "Optimized fp8 + KV cache"],
                  ["Fine-tuning", "RLHF · DPO · SFT"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <span className="text-white/50 text-sm shrink-0">{k}</span>
                    <span className="text-sm text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal direction="right" delay={100}>
            <div className="p-8 h-full flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white mb-6 underline underline-offset-4 decoration-white/50">Safety & Alignment</p>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Minerva is trained with Constitutional AI principles, reinforcement learning from human feedback, and red-team adversarial testing across 120+ harm categories. Responses are audited continuously in production.
                </p>
                <ul className="space-y-3">
                  {[
                    "Hallucination rate < 1.2% on TruthfulQA",
                    "Bias mitigation across 18 protected attributes",
                    "GDPR & SOC 2 Type II compliant",
                    "On-device option available for sensitive workloads",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                      <span className="mt-1 shrink-0 w-1 h-1 rounded-full bg-white/40 inline-block" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-28 px-4 text-center">
        <Reveal direction="up">
          <h2 className="text-4xl sm:text-6xl font-medium tracking-tight mb-10">Start using Minerva.</h2>
          <button
            onClick={() => router.push("/minerva")}
            className="group relative overflow-hidden cursor-pointer border-2 border-white rounded-full px-10 py-4 text-sm font-bold tracking-wide hover:text-accent transition-colors duration-500"
          >
            <div className="absolute inset-0 w-0 bg-white transition-all duration-500 ease-in-out group-hover:w-full" />
            <span className="relative z-10 flex items-center gap-2">
              Open Minerva
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
            </span>
          </button>
        </Reveal>
        <Reveal delay={200} direction="none">
          <p className="mt-16 text-xs text-white/80 tracking-widest uppercase">
            Minerva AI · @2026
          </p>
        </Reveal>
      </section>
    </div>
  );
}

function BenchmarkBar({ label, score, max, desc, delay }: {
  label: string; score: number; max: number; desc: string; delay: number;
}) {
  const { ref, visible } = useReveal(0.1);
  const pct = (score / max) * 100;

  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(-32px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="font-medium text-sm">{label}</span>
          <span className="ml-3 text-xs text-white/35">{desc}</span>
        </div>
        <span className="text-sm tabular-nums font-medium">{score}</span>
      </div>
      <div className="h-px bg-white/10 relative rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 h-full bg-white rounded-full"
          style={{
            width: visible ? `${pct}%` : "0%",
            transition: `width 1.2s cubic-bezier(.22,1,.36,1) ${delay + 100}ms`,
          }}
        />
      </div>
    </div>
  );
}