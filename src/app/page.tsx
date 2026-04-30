'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Textarea } from '@layr-labs/eigen-design';

interface Review {
  id: string;
  content: string;
  created_at: number;
  tee_hash: string | null;
  tee_signature: string | null;
}

export default function Home() {
  const [view, setView] = useState<'write' | 'read'>('write');
  const [content, setContent] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedAttestation, setExpandedAttestation] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    setReviews(data.reviews);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        setContent('');
        setShowSuccess(true);
        fetchReviews();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Vault</h1>
              <p className="text-xs text-muted-foreground">Anonymous feedback on EigenCompute</p>
            </div>
          </div>

          <Badge variant="outline" className="gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            TEE Secured
          </Badge>
        </div>
      </header>

      {/* Main */}
      <main className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
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
              {/* Success message */}
              {showSuccess && (
                <Card className="border-green-500/50 bg-green-500/10">
                  <CardContent className="py-3 flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-600 dark:text-green-400">Your anonymous note is live on the wall.</span>
                  </CardContent>
                </Card>
              )}

              {/* Write form */}
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
                        {isSubmitting ? 'Dropping...' : 'Drop it'}
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
                    Hardware-level privacy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This runs inside a Trusted Execution Environment on EigenCompute. Your identity is cryptographically sealed —
                    not even the server admins can see who you are. It's not trust, it's math.
                  </p>
                </CardContent>
              </Card>
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
                            TEE Verified
                          </Button>
                        )}
                      </div>

                      {expandedAttestation === review.id && review.tee_hash && (
                        <div className="mt-4 p-4 rounded-lg bg-muted space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Message (Hash)</p>
                            <p className="text-xs font-mono text-foreground break-all">{review.tee_hash}</p>
                          </div>
                          {review.tee_signature && review.tee_signature !== 'TEE_VERIFIED' && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Signature</p>
                              <p className="text-xs font-mono text-foreground break-all">{review.tee_signature}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Copy the hash and signature to verify on EigenCompute dashboard.
                          </p>
                          <Button variant="link" size="sm" asChild className="p-0 h-auto">
                            <a
                              href="https://verify-sepolia.eigencloud.xyz/app/0xc286bE71ce983ec0F674b641e71f2F92C256aeb6"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Verify on EigenCompute →
                            </a>
                          </Button>
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
          <a
            href="https://verify-sepolia.eigencloud.xyz/app/0xc286bE71ce983ec0F674b641e71f2F92C256aeb6"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Verify attestation
          </a>
        </div>
      </footer>
    </div>
  );
}
