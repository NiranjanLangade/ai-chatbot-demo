import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

// Model routed through Vercel AI Gateway (auth via Vercel OIDC on deployment).
const MODEL = process.env.AI_GATEWAY_MODEL ?? 'google/gemini-2.5-flash';

// Guardrails so a public demo can't run up costs.
const MAX_HISTORY = 12;
const MAX_MESSAGE_CHARS = 1000;

let knowledgeCache: string | null = null;
async function loadKnowledge() {
  if (!knowledgeCache) {
    knowledgeCache = await readFile(
      path.join(process.cwd(), 'src/data/knowledge.md'),
      'utf8',
    );
  }
  return knowledgeCache;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const recent = messages.slice(-MAX_HISTORY);
  const last = recent.at(-1);
  const lastText =
    last?.parts
      .map((p) => (p.type === 'text' ? p.text : ''))
      .join('') ?? '';
  if (lastText.length > MAX_MESSAGE_CHARS) {
    return new Response('Message too long', { status: 413 });
  }

  const knowledge = await loadKnowledge();

  const result = streamText({
    model: MODEL,
    maxOutputTokens: 600,
    instructions: `You are the friendly admissions assistant for Brightpath Academy, a coaching institute.

Answer ONLY using the knowledge base below. If the answer is not in it, say you don't have that information and suggest contacting the admissions office (phone and email are in the knowledge base). Never invent fees, dates, results or policies.

Keep answers short (2-5 sentences or a short list), warm and clear. Use ₹ for prices. Reply in the language the user writes in (English, Hindi or Marathi).

When a parent or student shows interest in joining, a demo class, or the admission test, offer to take their details. Once you have their name, phone number and course of interest, call the captureLead tool, then confirm that the admissions team will call them.

<knowledge_base>
${knowledge}
</knowledge_base>`,
    messages: await convertToModelMessages(recent),
    tools: {
      captureLead: tool({
        description:
          'Save an admission enquiry once the user has shared their name, phone number and course of interest.',
        inputSchema: z.object({
          name: z.string().describe('Student or parent name'),
          phone: z.string().describe('Phone number'),
          course: z.string().describe('Course of interest'),
        }),
        execute: async ({ name, course }) => {
          // Demo only: a real deployment would send this to a CRM, Google Sheet or email.
          return {
            saved: true,
            reference: `BP-${Date.now().toString().slice(-6)}`,
            message: `Enquiry recorded for ${name} (${course}).`,
          };
        },
      }),
    },
    stopWhen: isStepCount(3),
    onError: ({ error }) => {
      console.error('[chat] model error:', error);
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
