# AI Admissions Chatbot: "Chat with your documents" demo

An AI assistant for a coaching institute. It answers questions about courses, fees, timings, scholarships and admissions **only from the institute's own documents**, replies in English, Hindi or Marathi, and **captures admission leads** during the conversation.

**Live demo:** https://niranjan-ai-chatbot.vercel.app

> Brightpath Academy is a fictional institute made up for this demo. Enquiries entered in the demo are not stored.

## Features

- **Grounded answers.** The bot answers from [`src/data/knowledge.md`](src/data/knowledge.md) and says so when something isn't covered, instead of making it up.
- **Lead capture.** When a visitor shows interest, the bot collects their name, phone number and course through a tool call (`captureLead`). In a real deployment this goes to a CRM, Google Sheet or email.
- **Multilingual.** It replies in the language the visitor uses.
- **Streaming chat UI.** Responses appear as they're generated, with suggested questions and a stop button. Works on mobile and in dark mode.
- **Cost guardrails.** History is capped, message length is limited and output tokens are bounded, so a public demo can't run up a bill.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [AI SDK](https://ai-sdk.dev): `streamText`, tool calling, `useChat`
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway): model `google/gemini-2.5-flash`, which can be switched to any supported model with the `AI_GATEWAY_MODEL` environment variable
- Deployed on Vercel. Gateway authentication uses Vercel OIDC, so there are no API keys in the code.

## Adapting it for your business

1. Replace `src/data/knowledge.md` with your own FAQs, price list, policies or product information.
2. Change the assistant's instructions in `src/app/api/chat/route.ts`, such as its name, tone and the actions it should take.
3. Connect `captureLead` to your CRM, Google Sheets, email or WhatsApp.
4. Embed it on your site as a full page, a chat widget or an iframe.

Larger document sets (hundreds of pages, PDFs, websites) can use embeddings and vector search (RAG) instead of a single knowledge file.

## Run locally

```bash
npm install
vercel link          # link to your Vercel project
vercel env pull      # pulls the OIDC token used by AI Gateway
npm run dev
```

Open http://localhost:3000.

---

Built by **Niranjan Langade**, a full-stack developer working with Next.js, Python and AI integrations.
[Portfolio](https://www.niranjanlangade.in) · [Fiverr](http://www.fiverr.com/s/lrv8LE2) · [LinkedIn](https://www.linkedin.com/in/niranjan45/)
