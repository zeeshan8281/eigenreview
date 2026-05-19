'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Textarea } from '@layr-labs/eigen-design';

interface Review {
  id: string;
  content: string;
  created_at: number;
  tee_hash: string | null;
  tee_signature: string | null;
}

interface DataStrip {
  id: string;
  label: string;
  originalValue: string;
  strippedValue: string;
  status: 'pending' | 'stripping' | 'done';
}

export default function Home() {
  const [view, setView] = useState<'write' | 'read'>('write');
  const [content, setContent] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedAttestation, setExpandedAttestation] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dataStrips, setDataStrips] = useState<DataStrip[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [submissionPhase, setSubmissionPhase] = useState<'stripping' | 'sealing' | 'done' | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(stored === 'dark' || (!stored && prefersDark));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('vault-onboarding-seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    const res = await fetch(`/api/reviews`);
    const data = await res.json();
    setReviews(data.reviews);
  }

  const runSubmissionAnimation = useCallback(async (message: string) => {
    const fakeIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const now = new Date();
    const exactTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const coarseTime = now.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }).replace(':00', '').toLowerCase();
    const browsers = ['Chrome 125/macOS', 'Safari 18/iOS', 'Firefox 128/Windows', 'Edge 125/Windows'];
    const fakeBrowser = browsers[Math.floor(Math.random() * browsers.length)];

    const strips: DataStrip[] = [
      { id: 'ip', label: 'IP Address', originalValue: fakeIp, strippedValue: '—', status: 'pending' },
      { id: 'time', label: 'Exact Time', originalValue: exactTime, strippedValue: `~${coarseTime}`, status: 'pending' },
      { id: 'browser', label: 'Browser', originalValue: fakeBrowser, strippedValue: '—', status: 'pending' },
      { id: 'cookies', label: 'Cookies', originalValue: 'session_id, _ga, ...', strippedValue: '—', status: 'pending' },
    ];

    setDataStrips(strips);
    setSubmittedMessage(message.length > 50 ? message.slice(0, 50) + '...' : message);
    setShowLogs(true);
    setSubmissionPhase('stripping');

    for (let i = 0; i < strips.length; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      setDataStrips(prev => prev.map((s, idx) => ({
        ...s,
        status: idx < i ? 'done' : idx === i ? 'stripping' : 'pending'
      })));
      await new Promise(r => setTimeout(r, 300));
      setDataStrips(prev => prev.map((s, idx) => ({
        ...s,
        status: idx <= i ? 'done' : 'pending'
      })));
    }

    setSubmissionPhase('sealing');
    await new Promise(r => setTimeout(r, 1200));
    setSubmissionPhase('done');
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    runSubmissionAnimation(content.trim());

    try {
      const res = await fetch(`/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        setContent('');
        fetchReviews();
        setTimeout(() => {
          setShowLogs(false);
          setSubmissionPhase(null);
        }, 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function dismissOnboarding() {
    localStorage.setItem('vault-onboarding-seen', 'true');
    setShowOnboarding(false);
  }

  function timeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const verifiedCount = reviews.filter(r => r.tee_signature).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Welcome to Vault</h2>
                <p className="text-muted-foreground text-sm">Anonymous feedback, verified by hardware</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-500 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">You write, we forget</p>
                    <p className="text-xs text-muted-foreground">Your identity is never collected. No IP, no cookies, no tracking.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-500 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Sealed in secure hardware</p>
                    <p className="text-xs text-muted-foreground">Your message enters a tamper-proof chip. Even we can't peek inside.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-500 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Proof you can verify</p>
                    <p className="text-xs text-muted-foreground">Each note gets a cryptographic seal. Anyone can verify it wasn't tampered with.</p>
                  </div>
                </div>
              </div>

              <Button onClick={dismissOnboarding} className="w-full">
                Got it, let me in
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/eigen-icon.svg" alt="EigenLayer" width={40} height={40} />
            <div>
              <h1 className="text-lg font-semibold">Vault</h1>
              <p className="text-xs text-muted-foreground">Anonymous feedback on EigenCompute</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </Button>
            <Badge variant="outline" className="gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              TEE Secured
            </Badge>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Trust Stats */}
          {verifiedCount > 0 && (
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{verifiedCount} notes verified • 0 identities collected</span>
              </div>
            </div>
          )}

          {/* Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex gap-1 p-1 rounded-lg bg-muted">
              <Button
                variant={view === 'write' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('write')}
              >
                Drop a note
              </Button>
              <Button
                variant={view === 'read' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('read')}
              >
                The Wall ({reviews.length})
              </Button>
            </div>
          </div>

          {view === 'write' ? (
            <div className="space-y-6">
              {/* Live Data Stripping Visualization */}
              {showLogs && (
                <Card className="border-primary/30 overflow-hidden">
                  <CardContent className="py-6">
                    <div className="text-center mb-6">
                      <h3 className="font-semibold text-lg mb-1">
                        {submissionPhase === 'stripping' && 'Removing your identity...'}
                        {submissionPhase === 'sealing' && 'Sealing with tamper-proof signature...'}
                        {submissionPhase === 'done' && 'Your note is now anonymous'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {submissionPhase === 'stripping' && 'Watch as we strip identifying information'}
                        {submissionPhase === 'sealing' && 'Creating cryptographic proof'}
                        {submissionPhase === 'done' && 'Posted to the wall with zero trace back to you'}
                      </p>
                    </div>

                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-start mb-6">
                      {/* Before Column */}
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Your Data</p>
                        {dataStrips.map((strip) => (
                          <div
                            key={strip.id}
                            className={`p-3 rounded-lg border transition-all duration-300 ${
                              strip.status === 'stripping'
                                ? 'bg-red-500/10 border-red-500/50 scale-95'
                                : strip.status === 'done'
                                ? 'bg-muted/30 border-transparent opacity-50'
                                : 'bg-muted/50 border-border'
                            }`}
                          >
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{strip.label}</p>
                            <p className={`text-sm font-mono truncate transition-all ${
                              strip.status === 'stripping' ? 'text-red-500 line-through' :
                              strip.status === 'done' ? 'text-muted-foreground line-through' : ''
                            }`}>
                              {strip.originalValue}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Arrow Column */}
                      <div className="flex flex-col items-center justify-center h-full pt-8">
                        {dataStrips.map((strip) => (
                          <div key={strip.id} className="h-[62px] flex items-center">
                            <svg
                              className={`w-6 h-6 transition-all duration-300 ${
                                strip.status === 'done' ? 'text-green-500' : 'text-muted-foreground/30'
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        ))}
                      </div>

                      {/* After Column */}
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">What We Store</p>
                        {dataStrips.map((strip) => (
                          <div
                            key={strip.id}
                            className={`p-3 rounded-lg border transition-all duration-300 ${
                              strip.status === 'done'
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-muted/30 border-border opacity-30'
                            }`}
                          >
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{strip.label}</p>
                            <p className={`text-sm font-mono transition-all ${
                              strip.status === 'done' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                            }`}>
                              {strip.strippedValue}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message Preview */}
                    <div className={`p-4 rounded-lg border-2 border-dashed transition-all duration-500 ${
                      submissionPhase === 'done'
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-border bg-muted/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Message</p>
                        {submissionPhase === 'done' && (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Preserved
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{submittedMessage}</p>
                    </div>

                    {/* Sealing Animation */}
                    {submissionPhase === 'sealing' && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Creating tamper-proof seal...
                      </div>
                    )}

                    {/* Success */}
                    {submissionPhase === 'done' && (
                      <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-green-600 dark:text-green-400 text-sm">Anonymous note posted</p>
                          <p className="text-xs text-muted-foreground">Your words are live. Your identity is not.</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Write form */}
              {!showLogs && (
                <>
                  <Card>
                    <CardContent className="pt-6">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                          <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind? No one will know it's you..."
                            maxLength={500}
                            rows={5}
                            className="resize-none"
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                            {content.length}/500
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Encrypted in hardware. Zero metadata.
                          </p>

                          <Button type="submit" disabled={!content.trim() || isSubmitting}>
                            {isSubmitting ? 'Anonymizing...' : 'Drop it'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Info card */}
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Why you can trust this
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Privacy here rests on three pieces. <strong className="text-foreground">Hardware trust</strong> — AMD SEV-SNP encrypts the machine&apos;s memory so even the cloud operator can&apos;t read it. <strong className="text-foreground">Build trust</strong> — the verifiable build proves the binary inside the TEE is built from the open source code. <strong className="text-foreground">Code trust</strong> — that audited code is what handles your note, so it can see your data but can&apos;t leak it.
                      </p>
                      <div className="flex items-center gap-3 flex-wrap pt-1">
                        <Button variant="outline" size="xs" asChild>
                          <a
                            href="https://verify-sepolia.eigencloud.xyz/app/0xD9D92CB87DCc38e99500568C97EDE665e94e1013"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Check the TEE attestation →
                          </a>
                        </Button>
                        <a
                          href="https://github.com/zeeshan8281/eigenreview"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-muted-foreground underline hover:text-foreground transition-colors"
                        >
                          Read the source
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">The wall is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">Be the first to drop something</p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-5">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">{review.content}</p>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">?</span>
                            Anonymous
                          </span>
                          <span>·</span>
                          <span>{timeAgo(review.created_at)}</span>
                        </div>

                        {review.tee_signature && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setExpandedAttestation(expandedAttestation === review.id ? null : review.id)}
                            className="gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Verified Anonymous
                          </Button>
                        )}
                      </div>

                      {/* Visual Certificate */}
                      {expandedAttestation === review.id && review.tee_hash && (
                        <div className="mt-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1">Anonymity Certificate</h4>
                              <p className="text-xs text-muted-foreground mb-3">
                                Privacy here rests on three pieces working together. <strong className="text-foreground">Hardware trust:</strong> AMD SEV-SNP encrypts this machine&apos;s memory, so even the cloud operator can&apos;t read it. <strong className="text-foreground">Build trust:</strong> the verifiable build proves the binary running inside is built from the open source code below. <strong className="text-foreground">Code trust:</strong> that audited code is what handles your note — so it has access to your data but can&apos;t leak it.
                              </p>

                              <div className="space-y-2 bg-background/50 rounded p-3">
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Message Fingerprint</p>
                                  <p className="text-[11px] font-mono text-foreground break-all leading-relaxed">{review.tee_hash}</p>
                                </div>
                                {review.tee_signature && review.tee_signature !== 'TEE_VERIFIED' && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Tamper-Proof Seal</p>
                                    <p className="text-[11px] font-mono text-foreground break-all leading-relaxed">{review.tee_signature}</p>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 flex items-center gap-3 flex-wrap">
                                <Button variant="outline" size="xs" asChild>
                                  <a
                                    href="https://verify-sepolia.eigencloud.xyz/app/0xD9D92CB87DCc38e99500568C97EDE665e94e1013"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Check the TEE attestation →
                                  </a>
                                </Button>
                                <span className="text-[10px] text-muted-foreground">Proves a genuine TEE signed this</span>
                              </div>

                              <p className="mt-3 text-[10px] text-muted-foreground">
                                <a
                                  href="https://github.com/zeeshan8281/eigenreview"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-foreground transition-colors"
                                >
                                  Read the source code
                                </a>{' '}
                                — the exact code running inside the TEE.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-auto">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <p>Powered by EigenCompute TEE</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowOnboarding(true)}
              className="hover:text-foreground transition-colors"
            >
              How it works
            </button>
            <a
              href="https://verify-sepolia.eigencloud.xyz/app/0xD9D92CB87DCc38e99500568C97EDE665e94e1013"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Verify attestation
            </a>
            <a
              href="https://github.com/zeeshan8281/eigenreview"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
