import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';
import { YoutubeTranscript } from 'youtube-transcript';
import { extractText } from 'unpdf';
import { ExtractedContent, ContentType } from './types';

// Detect content type from URL
export function detectContentType(url: string): ContentType {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com/watch') || lowerUrl.includes('youtu.be/')) {
    return 'youtube';
  }
  
  if (lowerUrl.endsWith('.pdf')) {
    return 'pdf';
  }
  
  return 'article';
}

// Extract YouTube video ID from URL
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Extract content from YouTube
async function extractYouTube(url: string): Promise<ExtractedContent> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const text = transcript.map(t => t.text).join(' ');
    
    // Try to get video title from page
    let title = 'YouTube Video';
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      title = $('meta[property="og:title"]').attr('content') || 
              $('title').text().replace(' - YouTube', '') || 
              'YouTube Video';
    } catch {
      // Keep default title
    }
    
    return {
      type: 'youtube',
      title,
      text,
      url,
    };
  } catch (error) {
    throw new Error(`Failed to extract YouTube transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract content from article
async function extractArticle(url: string): Promise<ExtractedContent> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GistBot/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      throw new Error('Could not parse article content');
    }
    
    return {
      type: 'article',
      title: article.title || 'Untitled Article',
      text: article.textContent || '',
      url,
    };
  } catch (error) {
    throw new Error(`Failed to extract article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract content from PDF
async function extractPdf(url: string): Promise<ExtractedContent> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const { text: textPages } = await extractText(new Uint8Array(arrayBuffer));
    const text = Array.isArray(textPages) ? textPages.join('\n\n') : textPages;
    
    // Try to extract title from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1]?.replace('.pdf', '') || 'PDF Document';
    
    return {
      type: 'pdf',
      title: filename,
      text,
      url,
    };
  } catch (error) {
    throw new Error(`Failed to extract PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Main extraction function
export async function extractContent(input: { url?: string; text?: string }): Promise<ExtractedContent> {
  if (input.text) {
    return {
      type: 'text',
      title: 'Pasted Text',
      text: input.text,
    };
  }
  
  if (!input.url) {
    throw new Error('Either url or text must be provided');
  }
  
  const contentType = detectContentType(input.url);
  
  switch (contentType) {
    case 'youtube':
      return extractYouTube(input.url);
    case 'pdf':
      return extractPdf(input.url);
    case 'article':
    default:
      return extractArticle(input.url);
  }
}
