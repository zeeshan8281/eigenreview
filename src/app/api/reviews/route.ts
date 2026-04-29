import { NextRequest, NextResponse } from 'next/server';
import { createReview, getApprovedReviews } from '@/lib/db';
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
  const review = createReview(id, content.trim());

  return NextResponse.json({ review }, { status: 201 });
}
