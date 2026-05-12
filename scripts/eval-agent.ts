/**
 * Expanded eval suite for the page-builder agent.
 *
 * Runs three scenarios end-to-end:
 *   1. B2B SaaS DEV TOOL home page  (FlowKan — Lite Trello/Kanban)
 *   2. B2B SaaS OPS TOOL home page  (Spendly — Automated expense ops)
 *   3. B2B SaaS PRICING page         (FlowKan /pricing)
 *
 * For each: seeds a User+Site+Page, drives the agent with one turn, renders
 * the resulting markdown to HTML, and validates against codified criteria.
 *
 * Goal: ≥ 2/3 scenarios fully pass — that's the bar for treating the agent
 * as production-usable for B2B SaaS landing pages.
 *
 * Run:
 *   npx tsx --env-file=.env scripts/eval-agent.ts
 *   npx tsx --env-file=.env scripts/eval-agent.ts --clean
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { remarkSections } from "@/lib/remark-sections";
import { prisma } from "@/lib/prisma";
import { runAgentTurn } from "@/lib/agent/run";
import { HOME_CRITERIA, type PageCriteria } from "@/lib/agent/recipes";
import type { ModelMessage } from "ai";
import { cleanAgentSites, findTargetUser, runSuffix } from "./_test-helpers";

const c = {
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
};
const divider = (label?: string) => console.log("\n" + c.dim("─".repeat(72)) + (label ? ` ${c.bold(label)}` : ""));

type Scenario = {
  id: string;
  name: string;
  vertical: string;
  pageType: "home" | "pricing";
  pageTitle: string;
  pageSlug: string;
  isHome: boolean;
  prompt: string;
  withForm: boolean;
  customCriteria?: Partial<PageCriteria>;
};

const SCENARIOS: Scenario[] = [
  {
    id: "devtool-home",
    name: "B2B DevTool home page",
    vertical: "devtool",
    pageType: "home",
    pageTitle: "Home",
    pageSlug: "",
    isHome: true,
    withForm: true,
    prompt: `Build me an elite home page for FlowKan — a B2B SaaS that's a lite version of Trello, focused on small dev teams (5–30 engineers). We help engineering teams plan sprints and ship issues without the overhead of Jira or Linear's complexity. We're seed-stage: $0–1M ARR, 12 paying customers, founder-led. Embed the waitlist form somewhere appropriate.`,
  },
  {
    id: "ops-home",
    name: "B2B Ops/Finance home page",
    vertical: "ops",
    pageType: "home",
    pageTitle: "Home",
    pageSlug: "",
    isHome: true,
    withForm: true,
    prompt: `Build the home page for Spendly — an automated expense and AP-automation SaaS for early-stage SaaS companies (5–50 people). We pull every receipt, code each expense to the right ledger account, and close monthly books in under 2 hours. ROI: customers save 8 hours per controller per month. We're Series A: $4M ARR, 80 customers. Use the waitlist form.`,
  },
  {
    id: "pricing-page",
    name: "B2B SaaS pricing page",
    vertical: "devtool",
    pageType: "pricing",
    pageTitle: "Pricing",
    pageSlug: "pricing",
    isHome: false,
    withForm: false,
    prompt: `Build the /pricing page for FlowKan (a Lite Trello / Kanban for small dev teams). We have three tiers — Free for solo builders, Pro at $20/seat/month for growing teams, and Enterprise (contact us) for 100+ engineer orgs. Make a real pricing page following best practices: 3-card grid, FAQ, final CTA.`,
    customCriteria: {
      // Pricing pages have less section variety and fewer buttons; relax some rules
      minSections: 3,
      maxSections: 8,
      minButtons: 3,
      minTotalWords: 150,
    },
  },
];

// ---------- Seed ----------

async function seed(scenario: Scenario, runId: string) {
  const user = await findTargetUser();
  const subdomain = `eval-${scenario.id}-${runId}`;
  const site = await prisma.site.create({
    data: {
      name: scenario.id === "ops-home" ? "Spendly" : "FlowKan",
      description: scenario.id === "ops-home" ? "Automated expense and AP for early SaaS." : "Lite Kanban for small dev teams.",
      subdomain,
      userId: user.id,
      settings: {
        theme: {
          font: "Inter",
          colors: {
            primary: scenario.vertical === "ops" ? "#10b981" : "#6366f1",
            background: "#ffffff",
            text: "#0a0a0a",
          },
        },
      },
    },
  });
  const page = await prisma.page.create({
    data: {
      siteId: site.id,
      title: scenario.pageTitle,
      slug: scenario.pageSlug,
      content: `# ${scenario.pageTitle}\n\nThis page is empty.`,
      published: false,
    },
  });
  if (scenario.isHome) {
    await prisma.site.update({ where: { id: site.id }, data: { homePageId: page.id } });
  }
  if (scenario.withForm) {
    await prisma.form.create({
      data: {
        siteId: site.id,
        name: "Waitlist",
        type: "waitlist",
        layout: "stacked",
        ctaText: "Join the waitlist",
        fields: [{ key: "email", label: "Email", type: "email", required: true, placeholder: "you@team.com" }],
      },
    });
  }
  return { user, site, page };
}

// ---------- Render ----------

async function renderToHtml(markdown: string): Promise<string> {
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkSections)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(body);
  return String(file);
}

// ---------- Validate ----------

type CheckResult = { name: string; pass: boolean; detail?: string };

function validate(scenario: Scenario, markdown: string, html: string): CheckResult[] {
  const baseCriteria = HOME_CRITERIA;
  const criteria: PageCriteria = { ...baseCriteria, ...(scenario.customCriteria ?? {}) };
  const checks: CheckResult[] = [];

  // Frontmatter
  const fm = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  checks.push({
    name: "Has YAML frontmatter (title + description)",
    pass: !!(fm && /title\s*:/.test(fm[1]) && /description\s*:/.test(fm[1])),
    detail: fm ? "found" : "missing",
  });

  // Section count
  const topSections = (markdown.match(/^::::section/gm) || []).length;
  checks.push({
    name: `${criteria.minSections}–${criteria.maxSections} top-level sections`,
    pass: topSections >= criteria.minSections && topSections <= criteria.maxSections,
    detail: `${topSections} sections`,
  });

  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

  // H1
  const h1Matches = [...body.matchAll(/^# (.+)$/gm)];
  checks.push({
    name: "Exactly one H1 in body",
    pass: h1Matches.length === 1,
    detail: `${h1Matches.length} H1s`,
  });
  if (h1Matches.length === 1) {
    const h1Text = h1Matches[0][1].trim();
    const words = h1Text.split(/\s+/).filter(Boolean).length;
    checks.push({
      name: `H1 word count (${criteria.minH1Words}–${criteria.maxH1Words})`,
      pass: words >= criteria.minH1Words && words <= criteria.maxH1Words,
      detail: `"${h1Text}" — ${words} words`,
    });
    checks.push({
      name: `H1 ≤${criteria.maxH1Chars} chars`,
      pass: h1Text.length <= criteria.maxH1Chars,
      detail: `${h1Text.length} chars`,
    });
  }

  // Buttons
  const buttons = [...markdown.matchAll(/::button\[([^\]]*)\]/g)];
  checks.push({
    name: `≥${criteria.minButtons} ::button directives`,
    pass: buttons.length >= criteria.minButtons,
    detail: `${buttons.length} buttons`,
  });
  const bannedCtaUsed = buttons
    .map((m) => m[1].toLowerCase())
    .filter((label) => criteria.bannedCtas.some((ban) => label.includes(ban)));
  checks.push({
    name: "No banned CTA labels",
    pass: bannedCtaUsed.length === 0,
    detail: bannedCtaUsed.length > 0 ? bannedCtaUsed.join(", ") : "clean",
  });

  // Banned phrases
  const bodyLower = body.toLowerCase();
  const phrasesUsed = criteria.bannedPhrases.filter((p) => bodyLower.includes(p.toLowerCase()));
  checks.push({
    name: "No banned phrases",
    pass: phrasesUsed.length === 0,
    detail: phrasesUsed.length > 0 ? phrasesUsed.join(", ") : "clean",
  });

  // Final CTA
  const sectionBlocks = body.split(/^::::section/m).slice(1);
  const lastSection = sectionBlocks[sectionBlocks.length - 1] ?? "";
  const hasFinalCta =
    /bg\s*=\s*"primary"/.test(lastSection) ||
    /::button\[[^\]]*(start|get started|try|book|sign up|join|begin)[^\]]*\]/i.test(lastSection);
  checks.push({
    name: "Final CTA section",
    pass: !criteria.requiresFinalCta || hasFinalCta,
    detail: hasFinalCta ? "found" : "missing",
  });

  // Word count
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  checks.push({
    name: `Word count (${criteria.minTotalWords}–${criteria.maxTotalWords})`,
    pass: wordCount >= criteria.minTotalWords && wordCount <= criteria.maxTotalWords,
    detail: `${wordCount} words`,
  });

  // HTML rendering
  checks.push({
    name: "Renders to HTML without errors",
    pass: html.length > 100 && /<section/.test(html),
    detail: `${html.length} chars; ${(html.match(/<section/g) || []).length} <section> tags`,
  });

  // No literal directive leaks in HTML
  const literalLeaks = (html.match(/::button|::badge|::icon|::form|::breakline/g) || []).length;
  checks.push({
    name: "No literal directive text in HTML",
    pass: literalLeaks === 0,
    detail: literalLeaks === 0 ? "clean" : `${literalLeaks} leaks`,
  });

  // Form embed (only if scenario has form)
  if (scenario.withForm) {
    const hasFormEmbed = /::form\{/.test(body);
    checks.push({
      name: "Embeds the waitlist form",
      pass: hasFormEmbed,
      detail: hasFormEmbed ? "found" : "missing",
    });
  }

  return checks;
}

// ---------- Run one scenario ----------

async function runScenario(scenario: Scenario, runId: string): Promise<{ name: string; passed: number; total: number; pass: boolean; details: CheckResult[]; markdown: string; siteId: string; pageId: string }> {
  divider(`${c.cyan(scenario.name)}`);
  console.log(c.dim(`  scenario id: ${scenario.id} · vertical: ${scenario.vertical} · pageType: ${scenario.pageType}`));
  console.log(c.dim(`  prompt: ${scenario.prompt.slice(0, 140)}…`));

  const { user, site, page } = await seed(scenario, runId);
  const ctx = { userId: user.id, siteId: site.id, pageId: page.id };

  const t0 = Date.now();
  const messages: ModelMessage[] = [{ role: "user", content: scenario.prompt }];
  const result = await runAgentTurn(ctx, messages);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(c.dim(`  agent: ${result.steps} steps · ${result.toolCalls.length} tool calls · ${elapsed}s · ${result.finishReason}`));
  for (const tc of result.toolCalls) {
    const ok = tc.output?.applied !== false;
    console.log(`    ${ok ? c.green("✓") : c.red("✗")} ${c.magenta(tc.toolName)}`);
  }

  const md = result.finalContent;
  let html = "";
  try {
    html = await renderToHtml(md);
  } catch (e: any) {
    console.log(c.red(`  ✗ render failed: ${e?.message ?? String(e)}`));
  }

  const checks = validate(scenario, md, html);
  for (const ch of checks) {
    const mark = ch.pass ? c.green("✓") : c.red("✗");
    console.log(`    ${mark} ${ch.name}${ch.detail ? c.dim(`  (${ch.detail})`) : ""}`);
  }
  const passed = checks.filter((c) => c.pass).length;
  const total = checks.length;
  const allPass = passed === total;
  console.log(
    `  ${allPass ? c.green(c.bold(`PASS — ${passed}/${total}`)) : c.yellow(c.bold(`FAIL — ${passed}/${total}`))}`,
  );

  return { name: scenario.name, passed, total, pass: allPass, details: checks, markdown: md, siteId: site.id, pageId: page.id };
}

// ---------- Main ----------

async function main() {
  if (!process.env.XAI_API_KEY) {
    console.error(c.red("Missing XAI_API_KEY in .env"));
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (args.includes("--clean")) {
    const removed = await cleanAgentSites();
    console.log(c.green(`Cleaned ${removed} agent-built site(s).`));
    await prisma.$disconnect();
    return;
  }

  console.log(c.bold("\n🤖 Page-builder agent — eval suite\n"));
  // Persistent by default — each run uses a unique runId suffix on subdomains
  // so prior runs stay visible in your dashboard. Pass --clean to wipe.
  const runId = runSuffix();
  console.log(c.dim(`  run id: ${runId}\n`));

  const results = [];
  for (const scenario of SCENARIOS) {
    try {
      const r = await runScenario(scenario, runId);
      results.push(r);
    } catch (e: any) {
      console.log(c.red(`\n✗ scenario ${scenario.id} threw: ${e?.message ?? String(e)}`));
      results.push({ name: scenario.name, passed: 0, total: 1, pass: false, details: [], markdown: "", siteId: "", pageId: "" });
    }
  }

  // Summary
  divider("Summary");
  for (const r of results) {
    const icon = r.pass ? c.green("✓") : c.yellow("△");
    console.log(`  ${icon} ${r.name.padEnd(34)} ${r.passed}/${r.total} checks · ${r.markdown.length} chars`);
    if (r.siteId && r.pageId) {
      console.log(c.dim(`     ${c.blue(`http://localhost:3000/app/site/${r.siteId}/pages/${r.pageId}`)}`));
    }
  }
  const fullPasses = results.filter((r) => r.pass).length;
  const total = results.length;
  divider("Result");
  if (fullPasses >= 2) {
    console.log(c.green(c.bold(`  PASS — ${fullPasses}/${total} scenarios fully pass (threshold: ≥2/3)`)));
  } else {
    console.log(c.red(c.bold(`  FAIL — only ${fullPasses}/${total} scenarios fully pass`)));
  }
  console.log(c.dim(`\n  Sites are owned by your real account — visible in your dashboard.`));
  console.log(c.dim(`  Re-run to add more; pass --clean to wipe all agent-built sites.`));

  await prisma.$disconnect();
  if (fullPasses < 2) process.exit(1);
}

main().catch(async (e) => {
  console.error(c.red("fatal:"), e);
  await prisma.$disconnect();
  process.exit(1);
});
