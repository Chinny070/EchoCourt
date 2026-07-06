'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { getAccount, switchToStudioNet, getCurrentChainId } from '@/lib/genlayer/client';
import { STUDIONET } from '@/lib/genlayer/network';
import { Wallet } from 'lucide-react';

export function WalletButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [rightChain, setRightChain] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const acc = await getAccount().catch(() => null);
    setAccount(acc);
    if (acc) {
      const chain = await getCurrentChainId().catch(() => null);
      setRightChain(chain === STUDIONET.chainId);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', refresh);
      window.ethereum.on('chainChanged', refresh);
      return () => {
        window.ethereum?.removeListener('accountsChanged', refresh);
        window.ethereum?.removeListener('chainChanged', refresh);
      };
    }
  }, [refresh]);

  async function connect() {
    setLoading(true);
    try {
      const acc = await getAccount();
      if (acc) {
        setAccount(acc);
        await switchToStudioNet();
        await refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSwitchChain() {
    setLoading(true);
    try {
      await switchToStudioNet();
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!account) {
    return (
      <Button variant="primary" size="sm" onClick={connect} loading={loading}>
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    );
  }

  if (!rightChain) {
    return (
      <Button variant="danger" size="sm" onClick={handleSwitchChain} loading={loading}>
        Switch to StudioNet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--muted-paper)] border border-[var(--border)] text-xs">
      <span className="w-2 h-2 rounded-full bg-[var(--mediation-green)]" />
      <span className="hash-text text-[0.7rem]">{account.slice(0, 6)}...{account.slice(-4)}</span>
    </div>
  );
}
