'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';

const SUGGESTIONS = [
  'What courses do you offer for JEE?',
  'How much is the NEET fee? Can I pay in instalments?',
  'How do scholarships work?',
  'मुझे admission test के बारे में बताइए',
  'I want to book a demo class',
];

export default function Page() {
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput('');
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-3xl flex-col px-4 py-4 sm:py-6">
      <header className="flex items-center gap-3 border-b border-black/10 pb-4 dark:border-white/10">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
          B
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">
            Brightpath Academy · Admissions Assistant
          </h1>
          <p className="text-sm text-neutral-500">
            AI chatbot that answers from the institute&apos;s own documents and
            captures leads
          </p>
        </div>
      </header>

      <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Demo project by{' '}
        <a
          className="font-semibold underline"
          href="https://www.niranjanlangade.in"
          target="_blank"
          rel="noreferrer"
        >
          Niranjan Langade
        </a>
        . Brightpath Academy is fictional, and enquiries are not saved.
      </div>

      <section className="flex-1 space-y-4 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              Ask about courses, fees, timings, scholarships or admissions.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2.5 text-white'
                  : 'max-w-[85%] space-y-2 rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-2.5 dark:bg-neutral-800'
              }
            >
              {m.parts.map((part, i) => {
                if (part.type === 'text') {
                  return (
                    <p key={i} className="whitespace-pre-wrap leading-relaxed">
                      {part.text}
                    </p>
                  );
                }
                if (part.type === 'tool-captureLead') {
                  if (part.state === 'output-available') {
                    const out = part.output as { reference: string };
                    const lead = part.input as { name: string; course: string };
                    return (
                      <div
                        key={i}
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                      >
                        ✓ Enquiry captured: {lead.name} · {lead.course}{' '}
                        <span className="opacity-70">(ref {out.reference})</span>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="text-sm text-neutral-500">
                      Saving enquiry…
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {status === 'submitted' && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-neutral-100 px-4 py-2.5 text-neutral-500 dark:bg-neutral-800">
              Typing…
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
            Something went wrong. Please try again.
          </div>
        )}
        <div ref={bottomRef} />
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-black/10 pt-3 dark:border-white/10"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Type your question…"
          className="min-w-0 flex-1 rounded-xl border border-black/15 bg-transparent px-4 py-2.5 outline-none focus:border-indigo-500 dark:border-white/20"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => stop()}
            className="rounded-xl border border-black/15 px-4 py-2.5 dark:border-white/20"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white disabled:opacity-40"
          >
            Send
          </button>
        )}
      </form>
    </main>
  );
}
