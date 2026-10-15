import type { Key } from "./i18n";

type NavItem = { href: string; key: Key; desc: Key };

export const NAV: { group: Key; items: NavItem[] }[] = [
  { group: "nav.start", items: [
    { href: "/budget/", key: "nav.budget", desc: "nav.budget.d" },
    { href: "/planner/", key: "nav.planner", desc: "nav.planner.d" },
    { href: "/compare/", key: "nav.compare", desc: "nav.compare.d" },
  ] },
  { group: "nav.tools", items: [
    { href: "/save-more/", key: "nav.saveMore", desc: "nav.saveMore.d" },
    { href: "/stocks/", key: "nav.stocks", desc: "nav.stocks.d" },
    { href: "/risk/", key: "nav.risk", desc: "nav.risk.d" },
    { href: "/life/", key: "nav.life", desc: "nav.life.d" },
  ] },
  { group: "nav.learn", items: [
    { href: "/learn/", key: "nav.learnCenter", desc: "nav.learnCenter.d" },
    { href: "/quiz/", key: "nav.quiz", desc: "nav.quiz.d" },
    { href: "/glossary/", key: "nav.glossary", desc: "nav.glossary.d" },
  ] },
];
