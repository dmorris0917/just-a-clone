import OpenAI from 'openai';
import { ExtractedContent, GistResponse, Framework, StoryStructure, ArgumentStructure, SummaryLayer } from './types';
import { randomUUID } from 'crypto';

// Lazy initialization to avoid build-time errors
let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// Detect whether content is more story-like or argument-like
const FRAMEWORK_DETECTION_PROMPT = `You are classifying text to determine the best analytical framework.

Analyze this content and determine if it's better analyzed as:
- "story": Narrative content with events, characters, conflicts (articles about events, personal essays, case studies, news stories)
- "argument": Persuasive content making claims with evidence (opinion pieces, research papers, manifestos, analysis)

Respond with ONLY "story" or "argument".

Content title: {title}

First 2000 characters:
{preview}`;

// The core summary prompt - generates the one-sentence essence
const CORE_SUMMARY_PROMPT = `You are a master summarizer. Your job is to extract the absolute essence of a piece of content in ONE sentence.

This sentence must:
- Capture the central insight, not just the topic
- Be specific enough that someone who reads only this understands the core point
- Be compelling enough to make someone want to learn more
- Avoid throat-clearing phrases like "This article discusses..." or "The author argues..."

Content title: {title}
Content type: {type}

Full text:
{text}

Respond with ONLY the one-sentence core summary. No preamble.`;

// Story framework analysis
const STORY_ANALYSIS_PROMPT = `You are analyzing content through the lens of dramatic structure. 

Even factual content has narrative elements. Find them.

Provide a JSON response with this structure:
{
  "situation": "The initial state of affairs, the context, the 'before' picture (2-3 sentences)",
  "complication": "What disrupts the status quo, the conflict or tension introduced (2-3 sentences)", 
  "question": "The central question or tension that the reader must resolve (1 sentence, phrased as a question)",
  "resolution": "How it resolves, what changes, the 'after' picture (2-3 sentences)"
}

Content title: {title}

Full text:
{text}

Respond with ONLY valid JSON, no markdown formatting.`;

// Argument framework analysis
const ARGUMENT_ANALYSIS_PROMPT = `You are analyzing content through the lens of logical argumentation.

Extract the logical structure, even if implicit.

Provide a JSON response with this structure:
{
  "thesis": "The central claim being made (1-2 sentences)",
  "evidence": ["Key supporting point 1", "Key supporting point 2", "Key supporting point 3"],
  "counterArgument": "The best argument against the thesis that the author addresses OR should have addressed (2-3 sentences)",
  "synthesis": "The nuanced final position, taking counter-arguments into account (2-3 sentences)"
}

Content title: {title}

Full text:
{text}

Respond with ONLY valid JSON, no markdown formatting.`;

// Layered summary generation
const LAYERS_PROMPT = `You are creating layered summaries at increasing levels of detail.

Generate 4 summary layers:
- Layer 0: The core message in 1 sentence (most essential)
- Layer 1: Key context and main argument in 2-3 sentences  
- Layer 2: Supporting details and nuances in a short paragraph (4-5 sentences)
- Layer 3: Comprehensive summary including examples and evidence (2-3 paragraphs)

Each layer should be COMPLETE - someone reading only that layer should get a coherent summary at that depth. Don't say "as mentioned above" or reference other layers.

Provide a JSON response:
{
  "layers": [
    {"depth": 0, "title": "Core", "content": "..."},
    {"depth": 1, "title": "Key Points", "content": "..."},
    {"depth": 2, "title": "In Detail", "content": "..."},
    {"depth": 3, "title": "Full Summary", "content": "..."}
  ]
}

Content title: {title}

Full text:
{text}

Respond with ONLY valid JSON, no markdown formatting.`;

// Counter-argument generation (strongest case against)
const COUNTER_ARGUMENT_PROMPT = `You are a skilled debater tasked with constructing the STRONGEST possible case against the author's position.

Rules:
- Don't strawman. Steel-man the opposition.
- Find the most compelling objections, not the easiest ones to dismiss
- Consider empirical, logical, practical, and moral objections
- This should be a counter-argument the author would have to take seriously

Content title: {title}
Author's apparent position/thesis: {thesis}

Full text:
{text}

Write 3-4 sentences presenting the strongest case against this position. Be direct and forceful - you're playing devil's advocate.`;

// Steelman generation (stronger version of author's argument)
const STEELMAN_PROMPT = `You are tasked with making the author's argument STRONGER than they made it.

Rules:
- Identify weaknesses in how they presented their case
- Add stronger evidence or reasoning they could have used
- Anticipate and preemptively address objections
- Make the argument more precise and compelling

Content title: {title}
Author's thesis: {thesis}

Full text:
{text}

Write 3-4 sentences presenting a STRONGER version of the author's argument. This should be the best possible case for their position.`;

async function detectFramework(content: ExtractedContent): Promise<Framework> {
  const prompt = FRAMEWORK_DETECTION_PROMPT
    .replace('{title}', content.title)
    .replace('{preview}', content.text.slice(0, 2000));

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 10,
  });

  const result = response.choices[0]?.message?.content?.toLowerCase().trim();
  return result === 'story' ? 'story' : 'argument';
}

async function generateCoreSummary(content: ExtractedContent): Promise<string> {
  const prompt = CORE_SUMMARY_PROMPT
    .replace('{title}', content.title)
    .replace('{type}', content.type)
    .replace('{text}', content.text.slice(0, 100000)); // Limit to ~100k chars

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content?.trim() || '';
}

async function analyzeStory(content: ExtractedContent): Promise<StoryStructure> {
  const prompt = STORY_ANALYSIS_PROMPT
    .replace('{title}', content.title)
    .replace('{text}', content.text.slice(0, 100000));

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0]?.message?.content || '{}');
  return result as StoryStructure;
}

async function analyzeArgument(content: ExtractedContent): Promise<ArgumentStructure> {
  const prompt = ARGUMENT_ANALYSIS_PROMPT
    .replace('{title}', content.title)
    .replace('{text}', content.text.slice(0, 100000));

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0]?.message?.content || '{}');
  return result as ArgumentStructure;
}

async function generateLayers(content: ExtractedContent): Promise<SummaryLayer[]> {
  const prompt = LAYERS_PROMPT
    .replace('{title}', content.title)
    .replace('{text}', content.text.slice(0, 100000));

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0]?.message?.content || '{"layers":[]}');
  return result.layers || [];
}

async function generateCounterArgument(content: ExtractedContent, thesis: string): Promise<string> {
  const prompt = COUNTER_ARGUMENT_PROMPT
    .replace('{title}', content.title)
    .replace('{thesis}', thesis)
    .replace('{text}', content.text.slice(0, 50000));

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content?.trim() || '';
}

async function generateSteelman(content: ExtractedContent, thesis: string): Promise<string> {
  const prompt = STEELMAN_PROMPT
    .replace('{title}', content.title)
    .replace('{thesis}', thesis)
    .replace('{text}', content.text.slice(0, 50000));

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content?.trim() || '';
}

export async function summarize(content: ExtractedContent): Promise<GistResponse> {
  // Run initial analyses in parallel
  const [framework, core, layers] = await Promise.all([
    detectFramework(content),
    generateCoreSummary(content),
    generateLayers(content),
  ]);

  // Get framework-specific structure
  const structure = framework === 'story' 
    ? await analyzeStory(content)
    : await analyzeArgument(content);

  // Extract thesis for counter-argument and steelman
  const thesis = framework === 'story'
    ? (structure as StoryStructure).resolution
    : (structure as ArgumentStructure).thesis;

  // Generate critical thinking elements in parallel
  const [counterArgument, steelman] = await Promise.all([
    generateCounterArgument(content, thesis),
    generateSteelman(content, thesis),
  ]);

  return {
    id: randomUUID(),
    sourceType: content.type,
    sourceUrl: content.url,
    title: content.title,
    framework,
    core,
    layers,
    structure,
    counterArgument,
    steelman,
    wordCount: content.text.split(/\s+/).length,
    createdAt: new Date().toISOString(),
  };
}
