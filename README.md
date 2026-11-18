# 🤖 ChatGPT Lite — Your Own AI Chatbot

> **A mini ChatGPT you can run yourself — chat with Google's Gemini through a clean, modern chat interface.**

## Live demo

🔗 **https://chatgpt-lite22.vercel.app/** — live and loading (verified 18 Nov 2026).

## What it does

- **Chat with an AI assistant in real time** — ask questions, get answers, keep the conversation going.
- **Clean chat UI** — a smooth, familiar chat experience built on assistant-ui.
- **Runs on Google's free AI API** — Google AI Studio (Gemini) answers the chats.
- **Deployed on Vercel** — open the link above and start chatting, no install needed.

## Tech stack

- **Next.js 15** (Turbopack) + **React 19** + **TypeScript**
- **assistant-ui** (`@assistant-ui/react`) — the chat interface
- **Vercel AI SDK** (`ai`) with **Google** (`@ai-sdk/google`) and **OpenAI** (`@ai-sdk/openai`) providers
- **Tailwind CSS 4**

## How to run

```bash
cd my-app
npm install
```

Create `my-app/.env.local` with your Google AI Studio API key:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting.

Other scripts:

```bash
npm run build  # production build
npm run start  # serve the production build
npm run lint   # lint
```

## Project layout

```
my-app/
  app/         Next.js App Router — chat page + API routes
  components/  Chat UI (assistant-ui)
  lib/         Helpers
```

## Connect

- 💼 LinkedIn: https://www.linkedin.com/in/m-s-abhishek22/
- 📧 msabhishekanni10@gmail.com
