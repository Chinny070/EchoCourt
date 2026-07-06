'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Label } from '@/components/ui/Input';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { callReadMethod } from '@/lib/genlayer/client';
import { CASE_TYPE_LABELS } from '@/lib/genlayer/types';
import { Archive, Search, ArrowRight } from 'lucide-react';

interface CaseSummary {
  case_id: string;
  title: string;
  case_type: string;
  status: string;
  community_id: string;
}

export default function ArchivePage() {
  const [communityId, setCommunityId] = useState('');
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!communityId.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const raw = await callReadMethod('get_community_cases', [communityId.trim()]);
      const parsed = JSON.parse(raw);
      setCases(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCases([]);
    }
    setLoading(false);
  }, [communityId]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Archive className="w-6 h-6 text-[var(--signal-blue)]" />
        <h1 className="text-3xl font-medium">Case Archive</h1>
      </div>
      <p className="text-[var(--muted)] mb-8">
        Browse past cases for a community. View dispute summaries, verdicts, and remedies.
      </p>

      {/* Search */}
      <Card className="mb-8">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="communitySearch">Community ID</Label>
            <Input
              id="communitySearch"
              placeholder="my-dao-community"
              value={communityId}
              onChange={e => setCommunityId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} loading={loading}>
            <Search className="w-4 h-4" /> Search
          </Button>
        </div>
      </Card>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <span className="inline-block w-6 h-6 border-2 border-[var(--violet-echo)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && searched && cases.length === 0 && (
        <EmptyState
          icon={<Archive className="w-10 h-10" />}
          title="No cases found"
          description="No disputes have been opened for this community. When conflict appears, EchoCourt gives it structure."
          action={<Link href="/app/cases/new"><Button>Open a Case</Button></Link>}
        />
      )}

      {!loading && cases.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <Link key={c.case_id} href={`/app/cases/${c.case_id}`}>
              <Card className="hover:border-[var(--violet-echo)] transition-colors cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <StatusBadge status={c.status} />
                  <Badge variant="grey">{CASE_TYPE_LABELS[c.case_type] || c.case_type}</Badge>
                </div>
                <h3 className="font-medium mb-2">{c.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="hash-text">{c.case_id}</span>
                  <ArrowRight className="w-4 h-4 text-[var(--muted)]" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
