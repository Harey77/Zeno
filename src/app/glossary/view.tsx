"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { PageHeader, Section } from "@/components/ui";
import { GLOSSARY } from "@/lib/content";

export default function View() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(GLOSSARY[0].term);
  const list = GLOSSARY.filter((t) => (t.term + t.short).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader eyebrow="PLAIN-LANGUAGE GLOSSARY" title="Money words, minus the jargon">
        Each term comes with a rupee example and the misconception people most often have about it.
      </PageHeader>
      <Section>
        <div className="mx-auto max-w-3xl">
          <label className="flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-3 focus-within:border-accent">
            <Search className="h-4 w-4 text-muted" /><span className="sr-only">Search terms</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms like SIP or inflation" className="w-full bg-transparent outline-none" />
          </label>
          <div className="mt-6 space-y-3">
            {list.map((t) => {
              const isOpen = open === t.term;
              return (
                <div key={t.term} className={`card overflow-hidden p-0 transition ${isOpen ? "border-accent/50" : ""}`}>
                  <h2>
                    <button aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : t.term)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                      <span><span className="block font-display text-xl font-bold">{t.term}</span><span className="mt-1 block text-sm font-normal text-muted">{t.short}</span></span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-muted transition ${isOpen ? "rotate-180 text-accent" : ""}`} />
                    </button>
                  </h2>
                  {isOpen && (
                    <div className="fade-in grid gap-4 border-t border-line px-6 py-5 text-sm">
                      <p className="text-muted">{t.long}</p>
                      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4"><p className="text-xs font-semibold tracking-widest text-accent">INR EXAMPLE</p><p className="mt-1">{t.example}</p></div>
                      <div className="rounded-xl border border-warn/30 bg-warn/5 p-4"><p className="text-xs font-semibold tracking-widest text-warn">MISCONCEPTION</p><p className="mt-1">{t.myth}</p></div>
                    </div>
                  )}
                </div>
              );
            })}
            {list.length === 0 && <p className="py-10 text-center text-muted">No terms match &quot;{q}&quot;.</p>}
          </div>
        </div>
      </Section>
    </>
  );
}
