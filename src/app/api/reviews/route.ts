import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

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
  const body = await request.json();

  if (BACKEND_URL) {
    const res = await fetch(`${BACKEND_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
      verifyAt: 'https://verify-sepolia.eigencloud.xyz/app/0xc286bE71ce983ec0F674b641e71f2F92C256aeb6'
    }
  }, { status: 201 });
}
