import { NextResponse } from 'next/server';
import { fetchQuizApi } from '@/lib/api'; // Assuming a similar helper exists for this new endpoint

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // TODO: Add validation for the body

    // Forward the request to the Google Apps Script backend
    const response = await fetchQuizApi({
      key: 'add_quiz',
      ...body,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/add-quiz:', error);
    return NextResponse.json({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
