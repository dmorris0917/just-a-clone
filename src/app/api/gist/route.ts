import { NextRequest, NextResponse } from 'next/server';
import { extractContent } from '@/lib/extractors';
import { summarize } from '@/lib/summarize';
import { GistRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: GistRequest = await request.json();

    // Validate input
    if (!body.url && !body.text) {
      return NextResponse.json(
        { error: 'Either url or text must be provided' },
        { status: 400 }
      );
    }

    if (body.url && body.text) {
      return NextResponse.json(
        { error: 'Provide either url or text, not both' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Extract content
    const content = await extractContent({
      url: body.url,
      text: body.text,
    });

    // Generate summary
    const gist = await summarize(content);

    return NextResponse.json(gist);
  } catch (error) {
    console.error('Gist API error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
