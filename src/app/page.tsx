'use client';

import { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-black" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Vault</h1>
                  <p className="text-sm text-zinc-500">Speak freely. Stay hidden.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-zinc-400">TEE Secured</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="px-6 pb-20">
          <div className="max-w-2xl mx-auto">
            {/* Toggle */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex p-1 rounded-full bg-zinc-900/80 border border-zinc-800">
                <button
                  onClick={() => setView('write')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    view === 'write'
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Drop a note
                </button>
                <button
                  onClick={() => setView('read')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    view === 'read'
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  The Wall ({reviews.length})
                </button>
              </div>
            </div>

            {view === 'write' ? (
              <div className="space-y-6">
                {/* Success message */}
                {showSuccess && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-emerald-300">Your anonymous note is live on the wall.</span>
                  </div>
                )}

                {/* Write form */}
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's on your mind? No one will know it's you..."
                      maxLength={500}
                      rows={6}
                      className="w-full px-5 py-4 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 resize-none text-lg"
                    />
                    <div className="absolute bottom-4 right-5 text-xs text-zinc-600">
                      {content.length}/500
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs">Encrypted in hardware. Zero metadata.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={!content.trim() || isSubmitting}
                      className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                    >
                      <span className="relative z-10">
                        {isSubmitting ? 'Dropping...' : 'Drop it'}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Info card */}
                <div className="mt-12 p-6 rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-zinc-800/50">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Hardware-level privacy</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        This runs inside a Trusted Execution Environment on EigenCompute. Your identity is cryptographically sealed —
                        not even the server admins can see who you are. It's not trust, it's math.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-zinc-900 flex items-center justify-center">
                      <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-zinc-500 text-lg">The wall is empty</p>
                    <p className="text-zinc-600 text-sm mt-1">Be the first to drop something</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="group p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
                    >
                      <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{review.content}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                              <span className="text-xs text-zinc-400">?</span>
                            </div>
                            <span className="text-xs text-zinc-600">Anonymous</span>
                          </div>
                          <span className="text-zinc-800">·</span>
                          <span className="text-xs text-zinc-600">{timeAgo(review.created_at)}</span>
                        </div>
                        {review.tee_signature && (
                          <button
                            onClick={() => setExpandedAttestation(expandedAttestation === review.id ? null : review.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            TEE Verified
                          </button>
                        )}
                      </div>

                      {expandedAttestation === review.id && review.tee_hash && (
                        <div className="mt-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Message (Hash)</p>
                            <p className="text-xs font-mono text-zinc-300 break-all">{review.tee_hash}</p>
                          </div>
                          {review.tee_signature && review.tee_signature !== 'TEE_VERIFIED' && (
                            <div>
                              <p className="text-xs text-zinc-500 mb-1">Signature</p>
                              <p className="text-xs font-mono text-zinc-300 break-all">{review.tee_signature}</p>
                            </div>
                          )}
                          <p className="text-xs text-zinc-400">
                            {review.tee_signature && review.tee_signature !== 'TEE_VERIFIED'
                              ? 'Copy the hash and signature to verify on EigenCompute dashboard.'
                              : 'This review was processed inside a hardware-secured TEE.'}
                          </p>
                          <a
                            href="https://verify-sepolia.eigencloud.xyz/app/0xcaD70c29449055E52814f6031448e5Fd26BdFbcd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            Verify on EigenCompute
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 py-4 text-center bg-gradient-to-t from-black via-black to-transparent">
          <p className="text-xs text-zinc-600">
            Powered by EigenCompute TEE ·
            <a
              href="https://verify-sepolia.eigencloud.xyz/app/0xcaD70c29449055E52814f6031448e5Fd26BdFbcd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors ml-1"
            >
              Verify attestation
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
