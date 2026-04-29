import { NextRequest, NextResponse } from 'next/server';
import { createReview, getApprovedReviews } from '@/lib/db';
import { createTeeProof } from '@/lib/tee-signer';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const reviews = getApprovedReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content } = body;

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ error: 'Content must be 500 characters or less' }, { status: 400 });
  }

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
      verifyAt: 'https://verify-sepolia.eigencloud.xyz/app/0xcaD70c29449055E52814f6031448e5Fd26BdFbcd'
    }
  }, { status: 201 });
}
