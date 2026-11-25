"use client";

import dynamic from "next/dynamic";
import { Assistant } from "./assistant";

const Hero3D = dynamic(() => import("@/components/Hero3D"), { ssr: false });

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="grid shrink-0 gap-4 border-b px-4 py-4 md:grid-cols-[1fr_340px] md:items-center">
        <div>
          <h1 className="text-xl font-bold">ChatGPT Lite — ask, get an answer, keep the thread.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Problem: answers vanish when the tab closes. Fix: every chat stays in a thread you can reopen. Outcome: pick up exactly where you left off.
          </p>
          <p className="mt-2 text-sm">
            <a href="#chat" className="font-medium underline underline-offset-4">↓ Start chatting below</a>
          </p>
        </div>
        <Hero3D />
      </header>
      <div id="chat" className="min-h-0 flex-1">
        <Assistant />
      </div>
    </div>
  );
}
