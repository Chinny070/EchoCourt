'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Scale, MessageSquareWarning, Users, ShieldCheck, Gavel, ArrowRight, Zap } from 'lucide-react';

const useCases = [
  { icon: <Users className="w-5 h-5" />, title: 'DAO Communities', desc: 'Resolve delegate disputes and governance conduct reviews transparently.' },
  { icon: <MessageSquareWarning className="w-5 h-5" />, title: 'Creator Groups', desc: 'Interpret whether a post broke community values or brand guidelines.' },
  { icon: <Gavel className="w-5 h-5" />, title: 'Gaming Guilds', desc: 'Determine whether player conduct was toxic or fair banter.' },
  { icon: <ShieldCheck className="w-5 h-5" />, title: 'Moderation Councils', desc: 'Get an outside interpretive layer before removing someone.' },
];

const steps = [
  { num: '01', title: 'Create Charter', desc: 'Define your community standards, norms, and remedy policies.' },
  { num: '02', title: 'Open Case', desc: 'Submit a dispute with evidence, context, and requested outcome.' },
  { num: '03', title: 'Respond', desc: 'The respondent provides their side, counter-evidence, and context.' },
  { num: '04', title: 'Interpret', desc: 'GenLayer validators evaluate tone, intent, impact, and norms.' },
  { num: '05', title: 'Verdict', desc: 'A consensus-backed interpretation with confidence and remedy.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-[var(--violet-echo)]" />
            <span className="text-base font-semibold tracking-tight">EchoCourt</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--muted)]">
            <Link href="/app/charter" className="hover:text-[var(--text)] transition-colors">Charter</Link>
            <Link href="/app/cases/new" className="hover:text-[var(--text)] transition-colors">Open Case</Link>
            <Link href="/app/archive" className="hover:text-[var(--text)] transition-colors">Archive</Link>
          </nav>
          <Link href="/app/cases/new">
            <Button size="sm">Launch App</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--muted-paper)] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--violet-echo)]/10 px-4 py-1.5 text-xs font-medium text-[var(--violet-echo)] mb-6">
            <Zap className="w-3.5 h-3.5" />
            Powered by GenLayer Consensus
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] mb-6">
            When communities disagree about what something{' '}
            <span className="text-[var(--violet-echo)]">meant</span>,<br />
            EchoCourt gives them a place to interpret it.
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10">
            A GenLayer-powered protocol for social-context disputes, where validators evaluate tone, intent, impact, evidence, and community norms before conflict turns into chaos.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/app/cases/new">
              <Button size="lg">
                Open a Case <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/app/charter">
              <Button variant="secondary" size="lg">Create Charter</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-medium mb-4">Why social conflict needs context</h2>
          <p className="text-[var(--muted)] max-w-2xl mx-auto">
            Moderation often fails because context is missing, power is centralized, or outrage moves faster than judgement.
            EchoCourt is not deterministic moderation. Validators evaluate nuance.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Card variant="parchment" className="text-center">
            <div className="text-2xl mb-2">Context</div>
            <p className="text-sm text-[var(--muted)]">Tone, timing, audience, and relationship history all shape meaning.</p>
          </Card>
          <Card variant="parchment" className="text-center">
            <div className="text-2xl mb-2">Consensus</div>
            <p className="text-sm text-[var(--muted)]">Multiple validators independently interpret the same evidence.</p>
          </Card>
          <Card variant="parchment" className="text-center">
            <div className="text-2xl mb-2">Nuance</div>
            <p className="text-sm text-[var(--muted)]">Verdicts preserve complexity instead of forcing binary outcomes.</p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[var(--deep-ink)] text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-medium text-center mb-14">How EchoCourt works</h2>
          <div className="space-y-8">
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-6">
                <div className="text-2xl font-light text-[var(--violet-echo)] w-12 flex-shrink-0">{s.num}</div>
                <div>
                  <h3 className="text-lg font-medium mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-medium text-center mb-12">Built for communities that care about meaning</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {useCases.map((uc) => (
            <Card key={uc.title} className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-[var(--violet-echo)]/10 text-[var(--violet-echo)]">{uc.icon}</div>
              <div>
                <h3 className="font-medium mb-1">{uc.title}</h3>
                <p className="text-sm text-[var(--muted)]">{uc.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Example Verdict */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-medium text-center mb-8">Example verdict</h2>
        <Card variant="parchment" className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <div className="inline-flex flex-col items-center rounded-xl border-2 border-orange-400 bg-orange-50 px-6 py-4">
              <div className="text-[0.65rem] uppercase tracking-[0.15em] text-orange-500 mb-1">Interpretation</div>
              <div className="text-xl font-medium text-orange-700">Careless harm</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">Impact Level</span><span>Medium</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">Intent</span><span>Careless</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">Charter Alignment</span><span>Misaligned</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
              <span className="text-[var(--muted)]">Recommended Remedy</span><span>Public clarification</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[var(--muted)]">Confidence</span><span className="font-semibold">72%</span>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="bg-[var(--muted-paper)] py-16 text-center">
        <h2 className="text-3xl font-medium mb-4">Ready to give conflict structure?</h2>
        <p className="text-[var(--muted)] mb-8">Create a charter for your community or open your first case.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/app/charter">
            <Button size="lg">Create Charter</Button>
          </Link>
          <Link href="/app/cases/new">
            <Button variant="secondary" size="lg">Open a Case</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[var(--violet-echo)]" />
            <span>EchoCourt</span>
          </div>
          <span>Decentralized social-context arbitration on GenLayer</span>
        </div>
      </footer>
    </div>
  );
}
