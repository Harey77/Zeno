"use client";

import { useState } from "react";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { Button, Card, PageHeader, Section } from "@/components/ui";
import { QUIZ } from "@/lib/content";
import { useStore } from "@/lib/store";

export default function View() {
  const { state, update } = useStore();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= QUIZ.length;
  const q = QUIZ[i];

  const answer = (v: boolean) => {
    if (picked !== null) return;
    setPicked(v);
    if (v === q.answer) setScore(score + 1);
  };
  const next = () => {
    const n = i + 1;
    setI(n); setPicked(null);
    if (n >= QUIZ.length) update("quiz", { attempts: state.quiz.attempts + 1, best: Math.max(state.quiz.best, score) });
  };
  const restart = () => { setI(0); setPicked(null); setScore(0); };

  return (
    <>
      <PageHeader eyebrow="MONEY MYTH BUSTER" title="True or false?">
        One question at a time. No timer. Every answer comes with a short why.
      </PageHeader>
      <Section>
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between text-sm text-muted">
            <span>{done ? "Finished" : `Question ${i + 1} of ${QUIZ.length}`}</span>
            <span>Score {score}{state.quiz.best ? ` · Best ${state.quiz.best}/${QUIZ.length}` : ""}</span>
          </div>
          <div className="mb-6 h-1.5 rounded-full bg-line"><div className="h-1.5 rounded-full bg-accent transition-all" style={{ width: `${(Math.min(i, QUIZ.length) / QUIZ.length) * 100}%` }} /></div>

          {!done ? (
            <Card key={i} className="fade-in">
              <p className="text-xs font-semibold tracking-widest text-accent">MYTH OR FACT</p>
              <h2 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">{q.q}</h2>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[true, false].map((v) => {
                  const state = picked === null ? "idle" : v === q.answer ? "right" : picked === v ? "wrong" : "idle";
                  return (
                    <button key={String(v)} onClick={() => answer(v)} disabled={picked !== null}
                      className={`rounded-2xl border py-5 font-display text-xl font-bold transition ${state === "right" ? "border-good bg-good/15 text-good" : state === "wrong" ? "border-bad bg-bad/15 text-bad" : "border-line hover:border-accent/60 disabled:opacity-50"}`}>
                      {v ? "True" : "False"}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <div className="fade-in mt-6" role="status">
                  <p className={`flex items-center gap-2 font-semibold ${picked === q.answer ? "text-good" : "text-bad"}`}>
                    {picked === q.answer ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    {picked === q.answer ? "Correct" : `Not quite. It's ${q.answer ? "true" : "false"}.`}
                  </p>
                  <p className="mt-2 text-muted">{q.explain}</p>
                  <Button className="mt-6" onClick={next}>{i === QUIZ.length - 1 ? "See results" : "Next question"} <ArrowRight className="h-4 w-4" /></Button>
                </div>
              )}
            </Card>
          ) : (
            <Card className="fade-in text-center">
              <p className="font-display text-6xl font-bold text-accent">{score}/{QUIZ.length}</p>
              <h2 className="mt-3 text-2xl font-bold">{score === QUIZ.length ? "Myth Buster: perfect score" : score >= 6 ? "Strong instincts" : "Good start"}</h2>
              <p className="mt-2 text-muted">Knowing the myths is half the battle. Check the glossary for anything that surprised you.</p>
              <Button className="mt-6" onClick={restart}><RotateCcw className="h-4 w-4" /> Try again</Button>
            </Card>
          )}
        </div>
      </Section>
    </>
  );
}
