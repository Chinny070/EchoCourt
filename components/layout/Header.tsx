'use client';

import Link from 'next/link';
import { WalletButton } from '@/components/wallet/WalletButton';
import { Scale } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Scale className="w-5 h-5 text-[var(--violet-echo)]" />
          <span className="text-base font-semibold tracking-tight">EchoCourt</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--muted)]">
          <Link href="/app/charter" className="hover:text-[var(--text)] transition-colors">Charter</Link>
          <Link href="/app/cases/new" className="hover:text-[var(--text)] transition-colors">Open Case</Link>
          <Link href="/app/archive" className="hover:text-[var(--text)] transition-colors">Archive</Link>
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}
