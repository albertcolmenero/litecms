/**
 * End-to-end test for the page-builder agent.
 *
 * What this does:
 *   1. Seeds a test User + Site + empty Page + a "Waitlist" Form.
 *   2. Drives a multi-turn conversation with the agent:
 *        Turn 1: "Build a home page for FlowKan — Lite Trello / Kanban for small B2B SaaS dev teams."
 *        Turn 2: "Tighten the hero — make the H1 5 words and emphasize speed."
 *   3. Reads the resulting page content from Postgres.
 *   4. Renders the markdown to HTML via the unified pipeline.
 *   5. Validates against codified criteria (HOME_CRITERIA from recipes.ts).
 *   6. Prints PASS/FAIL with details.
 *
 * Run:
 *   npx tsx --env-file=.env scripts/test-agent-build-page.ts
 *
 * Note: the test User + Site are NOT cleaned up automatically — the user can
 * open the editor and inspect the result. To clean up, re-run with --clean.
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
import { cleanAgentSites, findTargetUser, uniqueSubdomain } from "./_test-helpers";

// ---------- ANSI helpers ----------
const c = {
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
};

function divider(label?: string) {
  console.log("\n" + c.dim("─".repeat(72)) + (label ? ` ${c.bold(label)} ` : ""));
}

// ---------- Seed ----------

async function seed() {
  divider("Seeding Site + Page + Form (owner = real Clerk user, persistent)");

  const user = await findTargetUser();
  const subdomain = uniqueSubdomain("flowkan-agent");
  console.log(c.dim(`  owner   ${user.email} (${user.clerkId})`));

  const site = await prisma.site.create({
    data: {
      name: "FlowKan",
      description: "Lite Trello / Kanban for small B2B SaaS dev teams.",
      subdomain,
      userId: user.id,
      settings: {
        theme: {
          font: "Inter",
          colors: {
            primary: "#6366f1",
            background: "#ffffff",
            text: "#0a0a0a",
            iconBackground: "#6366f1",
            iconColor: "#ffffff",
          },
          buttons: {
            background: "#0a0a0a",
            text: "#ffffff",
            secondaryBackground: "#ffffff",
            secondaryText: "#0a0a0a",
          },
        },
      },
    },
  });

  const page = await prisma.page.create({
    data: {
      siteId: site.id,
      title: "Home",
      slug: "",
      content: "# Welcome to FlowKan\n\nThis page is empty — the agent will build it.",
      published: false,
    },
  });

  // Make this the home page
  await prisma.site.update({
    where: { id: site.id },
    data: { homePageId: page.id },
  });

  // Add a waitlist form so the agent has something to embed
  const form = await prisma.form.create({
    data: {
      siteId: site.id,
      name: "Waitlist",
      type: "waitlist",
      layout: "stacked",
      ctaText: "Join the waitlist",
      fields: [
        { key: "email", label: "Email", type: "email", required: true, placeholder: "you@team.com" },
      ],
    },
  });

  console.log(`  ${c.dim("user")}    ${user.id}`);
  console.log(`  ${c.dim("site")}    ${site.id} (${site.name} · ${site.subdomain})`);
  console.log(`  ${c.dim("page")}    ${page.id} (${page.title})`);
  console.log(`  ${c.dim("form")}    ${form.id} (${form.name})`);
  return { user, site, page, form };
}

// ---------- Conversation ----------

async function runConversation(ctx: { userId: string; siteId: string; pageId: string }) {
  const messages: ModelMessage[] = [];
  const turns: Array<{ user: string }> = [
    {
      user: `I'm building FlowKan — a B2B SaaS that's a lite version of Trello, focused on small dev teams (5–30 engineers). We help engineering teams plan sprints and ship issues without the overhead of Jira or Linear's complexity. We're seed-stage: $0–1M ARR, 12 paying customers, founder-led.

Build me an elite home page. Use the waitlist form somewhere appropriate.`,
    },
    {
      user: `Tighten the hero. Make the H1 exactly 5 words and emphasize speed.`,
    },
  ];

  for (let i = 0; i < turns.length; i++) {
    divider(`Turn ${i + 1}`);
    console.log(c.bold("USER:"), turns[i].user.split("\n")[0].slice(0, 120) + "…");
    messages.push({ role: "user", content: turns[i].user });

    const t0 = Date.now();
    const result = await runAgentTurn(ctx, messages);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

    console.log(c.bold("AGENT:"), result.text.slice(0, 200) + (result.text.length > 200 ? "…" : ""));
    console.log(c.dim(`  steps=${result.steps} · finishReason=${result.finishReason} · ${elapsed}s`));

    if (result.toolCalls.length > 0) {
      console.log(c.dim("  tool calls:"));
      for (const tc of result.toolCalls) {
        const inputSummary =
          tc.toolName === "page_replaceWhole"
            ? `${tc.input?.markdown?.length ?? 0} chars · "${tc.input?.reason ?? ""}"`
            : tc.toolName === "page_editBlocks"
              ? `${tc.input?.ops?.length ?? 0} op(s) · "${tc.input?.reason ?? ""}"`
              : tc.toolName === "style_getRecipe"
                ? `pageType="${tc.input?.pageType ?? ""}"`
                : JSON.stringify(tc.input).slice(0, 80);
        const ok = tc.output?.applied !== false;
        const errMsg = tc.output?.error ? c.red(` ✗ ${tc.output.error.slice(0, 100)}`) : "";
        console.log(
          `    ${ok ? c.green("✓") : c.red("✗")} ${c.magenta(tc.toolName)} ${c.dim("·")} ${inputSummary}${errMsg}`,
        );
      }
    }

    // Append assistant response to messages so the next turn has context.
    if (result.text) {
      messages.push({ role: "assistant", content: result.text });
    }
  }
}

// ---------- HTML rendering ----------

async function renderToHtml(markdown: string): Promise<string> {
  // Strip frontmatter for the renderer (unified will treat it as content otherwise)
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

// ---------- Validation ----------

type CheckResult = { name: string; pass: boolean; detail?: string };

function validate(markdown: string, html: string, criteria: PageCriteria): CheckResult[] {
  const checks: CheckResult[] = [];

  // Frontmatter present
  const fm = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  checks.push({
    name: "Has YAML frontmatter (title + description)",
    pass: !!(fm && /title\s*:/.test(fm[1]) && /description\s*:/.test(fm[1])),
    detail: fm ? "frontmatter found" : "missing",
  });

  // Section count — count top-level ::::section opens
  const topSections = (markdown.match(/^::::section/gm) || []).length;
  checks.push({
    name: `Has ${criteria.minSections}–${criteria.maxSections} top-level sections`,
    pass: topSections >= criteria.minSections && topSections <= criteria.maxSections,
    detail: `${topSections} sections`,
  });

  // Body H1 count + word count + char count (search markdown for # at line start, not in frontmatter)
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const h1Matches = [...body.matchAll(/^# (.+)$/gm)];
  checks.push({
    name: "Exactly one H1 in body",
    pass: h1Matches.length === 1,
    detail: `${h1Matches.length} H1s found`,
  });
  if (h1Matches.length === 1) {
    const h1Text = h1Matches[0][1].trim();
    const words = h1Text.split(/\s+/).filter(Boolean).length;
    checks.push({
      name: `H1 word count (${criteria.minH1Words}–${criteria.maxH1Words})`,
      pass: words >= criteria.minH1Words && words <= criteria.maxH1Words,
      detail: `H1: "${h1Text}" — ${words} words`,
    });
    checks.push({
      name: `H1 character count (≤${criteria.maxH1Chars})`,
      pass: h1Text.length <= criteria.maxH1Chars,
      detail: `${h1Text.length} chars`,
    });
  }

  // Button count
  const buttons = [...markdown.matchAll(/::button\[([^\]]*)\]/g)];
  checks.push({
    name: `≥${criteria.minButtons} ::button directives`,
    pass: buttons.length >= criteria.minButtons,
    detail: `${buttons.length} buttons`,
  });

  // Banned button labels
  const bannedCtaUsed = buttons
    .map((m) => m[1].toLowerCase())
    .filter((label) => criteria.bannedCtas.some((ban) => label.includes(ban)));
  checks.push({
    name: "No banned CTA labels (Submit / Learn More / etc.)",
    pass: bannedCtaUsed.length === 0,
    detail: bannedCtaUsed.length > 0 ? `found: ${bannedCtaUsed.join(", ")}` : "clean",
  });

  // Banned phrases anywhere in body
  const bodyLower = body.toLowerCase();
  const phrasesUsed = criteria.bannedPhrases.filter((p) => bodyLower.includes(p.toLowerCase()));
  checks.push({
    name: "No banned phrases (all-in-one / 10x / next-generation / etc.)",
    pass: phrasesUsed.length === 0,
    detail: phrasesUsed.length > 0 ? `found: ${phrasesUsed.join(", ")}` : "clean",
  });

  // Final CTA section: last ::::section block contains bg="primary" or imperative CTA verbs
  const sectionBlocks = body.split(/^::::section/m).slice(1); // skip preface
  const lastSection = sectionBlocks[sectionBlocks.length - 1] ?? "";
  const lastSectionLower = lastSection.toLowerCase();
  const hasFinalCta =
    /bg\s*=\s*"primary"/.test(lastSection) ||
    /::button\[[^\]]*(start|get started|try|book|sign up|join|begin)[^\]]*\]/i.test(lastSection);
  checks.push({
    name: "Final CTA section (bg=primary OR imperative CTA in last section)",
    pass: !criteria.requiresFinalCta || hasFinalCta,
    detail: hasFinalCta ? "found" : "missing",
  });

  // Total word count
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  checks.push({
    name: `Word count (${criteria.minTotalWords}–${criteria.maxTotalWords})`,
    pass: wordCount >= criteria.minTotalWords && wordCount <= criteria.maxTotalWords,
    detail: `${wordCount} words`,
  });

  // HTML renders
  checks.push({
    name: "Renders to non-empty HTML without errors",
    pass: html.length > 200 && /<section/.test(html),
    detail: `${html.length} chars; ${(html.match(/<section/g) || []).length} <section> tags`,
  });

  // Form embed (the brief asked for it)
  const hasFormEmbed = /::form\{/.test(body);
  checks.push({
    name: "Embeds the waitlist form (::form directive)",
    pass: hasFormEmbed,
    detail: hasFormEmbed ? "found" : "no ::form directive",
  });

  return checks;
}

// ---------- Main ----------

async function main() {
  if (!process.env.XAI_API_KEY) {
    console.error(c.red("Missing XAI_API_KEY in .env. Aborting."));
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (args.includes("--clean")) {
    const removed = await cleanAgentSites();
    console.log(c.green(`\nCleaned ${removed} agent-built site(s). Done.`));
    await prisma.$disconnect();
    return;
  }

  console.log(c.bold("\n🤖 Page builder agent — end-to-end test\n"));

  // Persistent by default — each run creates a fresh site with a unique
  // subdomain. Pass --clean to wipe all agent-built sites.
  const { user, site, page } = await seed();

  const ctx = { userId: user.id, siteId: site.id, pageId: page.id };
  await runConversation(ctx);

  // Read final state
  divider("Final page content");
  const finalPage = await prisma.page.findUnique({ where: { id: page.id }, select: { content: true } });
  const md = finalPage?.content ?? "";
  console.log(c.dim(`  ${md.length} chars · ${md.split(/\s+/).filter(Boolean).length} words`));
  console.log(c.dim("  ─── markdown preview (first 600 chars) ───"));
  console.log(c.dim(md.slice(0, 600).split("\n").map((l) => "  " + l).join("\n")));
  console.log(c.dim("  ──────────────────────────────────────"));

  // Render to HTML
  divider("Render to HTML");
  let html = "";
  try {
    html = await renderToHtml(md);
    console.log(c.green(`  ✓ rendered ${html.length} chars of HTML`));
  } catch (e: any) {
    console.log(c.red(`  ✗ render failed: ${e?.message ?? String(e)}`));
  }

  // Validate
  divider("Validation");
  const checks = validate(md, html, HOME_CRITERIA);
  for (const ch of checks) {
    const mark = ch.pass ? c.green("✓") : c.red("✗");
    console.log(`  ${mark} ${ch.name}${ch.detail ? c.dim(`  (${ch.detail})`) : ""}`);
  }

  const passed = checks.filter((c) => c.pass).length;
  const total = checks.length;

  divider("Result");
  if (passed === total) {
    console.log(c.green(c.bold(`  PASS — ${passed}/${total} checks passed.`)));
  } else {
    console.log(c.yellow(c.bold(`  PARTIAL — ${passed}/${total} checks passed.`)));
  }
  console.log(
    `\n  Inspect the page in the editor at: ${c.blue(`http://localhost:3000/app/site/${site.id}/pages/${page.id}`)}`,
  );
  console.log(`  Site appears in your dashboard at ${c.blue("http://localhost:3000/app")} (owned by ${user.email}).`);
  console.log(`  Re-run with --clean to remove all agent-built test sites.\n`);

  await prisma.$disconnect();
  if (passed < total) process.exit(1);
}

main().catch(async (e) => {
  console.error(c.red("\n✗ fatal:"), e);
  await prisma.$disconnect();
  process.exit(1);
});
