import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
let requestTimestamps: number[] = [];

function checkGlobalRateLimit(): boolean {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (requestTimestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }
  requestTimestamps.push(now);
  return true;
}

function randomDelay(): Promise<void> {
  const delay = 1000 + Math.random() * 4000;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export async function GET() {
  if (BACKEND_URL) {
    const res = await fetch(`${BACKEND_URL}/api/reviews`);
    const data = await res.json();
    return NextResponse.json(data);
  }

  const { getApprovedReviews } = await import('@/lib/db');
  const reviews = getApprovedReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  if (!checkGlobalRateLimit()) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait a moment.' },
      { status: 429 }
    );
  }

  await randomDelay();

  const body = await request.json();

  if (BACKEND_URL) {
    const res = await fetch(`${BACKEND_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: body.content }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  const { content } = body;
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: 'Content must be 500 characters or less' }, { status: 400 });
  }

  const { v4: uuidv4 } = await import('uuid');
  const { createReview } = await import('@/lib/db');
  const { createTeeProof } = await import('@/lib/tee-signer');

  const id = uuidv4();
  const timestamp = Date.now();
  const trimmedContent = content.trim();

  const { hash, signature, signerAddress, processedInTee } = await createTeeProof(id, trimmedContent, timestamp);
  const review = createReview(id, trimmedContent, hash, signature);

  return NextResponse.json({
    review,
    teeProof: {
      hash,
      signature,
      signerAddress,
      processedInTee,
      verifyAt: 'https://verify-sepolia.eigencloud.xyz/app/0xD9D92CB87DCc38e99500568C97EDE665e94e1013'
    }
  }, { status: 201 });
}
