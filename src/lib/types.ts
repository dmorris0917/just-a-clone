// Content types we can process
export type ContentType = 'article' | 'youtube' | 'pdf' | 'text';

// Frameworks for structuring summaries
export type Framework = 'story' | 'argument';

// Layered summary structure
export interface SummaryLayer {
  depth: number; // 0 = core, higher = more detail
  title: string;
  content: string;
}

// Story framework (dramatic structure)
export interface StoryStructure {
  situation: string;      // The setup/context
  complication: string;   // What disrupts the status quo
  question: string;       // The central question raised
  resolution: string;     // How it resolves (or doesn't)
}

// Argument framework (logical structure)
export interface ArgumentStructure {
  thesis: string;         // Main claim
  evidence: string[];     // Supporting evidence
  counterArgument: string; // Best case against
  synthesis: string;      // Final position considering all
}

// Full Gist response
export interface GistResponse {
  id: string;
  sourceType: ContentType;
  sourceUrl?: string;
  title: string;
  framework: Framework;
  
  // The one-sentence core (always shown first)
  core: string;
  
  // Layered summaries (increasing detail)
  layers: SummaryLayer[];
  
  // Framework-specific structure
  structure: StoryStructure | ArgumentStructure;
  
  // Critical thinking elements
  counterArgument: string;  // Strongest case against
  steelman: string;         // Even stronger version of author's argument
  
  // Metadata
  wordCount: number;
  createdAt: string;
}

// API request types
export interface GistRequest {
  url?: string;
  text?: string;
}

// Extracted content before summarization
export interface ExtractedContent {
  type: ContentType;
  title: string;
  text: string;
  url?: string;
}
