/**
 * Codified content recipes for the page-builder agent.
 *
 * The agent calls `style_getRecipe` to fetch one of these. They live behind a
 * tool (not in the system prompt) so we don't burn ~3k tokens of context every
 * conversation — Anthropic's "Skills" pattern (progressive disclosure).
 */

export type SectionSpec = {
  name: string;
  purpose: string;
  layout: string; // e.g. "100", "60-40", "33-33-33"
  align?: "left" | "center" | "right";
  bg?: string;
  components: string[]; // human-readable list of components inside
  copyTargets: string;
  example: string;
};

export type PageRecipe = {
  pageType: string;
  description: string;
  voice: string;
  doSay: string[];
  dontSay: string[];
  sections: SectionSpec[];
  antiPatterns: string[];
  visualConventions: string[];
};

// ---- B2B SaaS HOME PAGE recipe (the main one) ----

const HOME_RECIPE: PageRecipe = {
  pageType: "home",
  description:
    "Canonical 12-section B2B SaaS home page following 2025/2026 conventions (Linear, Vercel, Stripe, Attio, Ramp, PostHog, Cal.com).",
  voice:
    "Confident, declarative, product-flavored. Short, almost dry. Outcome-focused, not feature-listing. Devtool-adjacent — a smart engineering manager would find this credible.",
  doSay: [
    "Verbs at the start of sentences ('Plan and ship in hours, not weeks')",
    "Specific, concrete outcomes ('Cut deploy time by 80%')",
    "Imperative CTAs ('Start building', 'Get started — free', 'Book a demo')",
    "Single ideas per sentence",
    "Specific numbers when defensible",
  ],
  dontSay: [
    "'All-in-one platform / solution / ecosystem' — banned",
    "'Next-generation', 'revolutionary', 'best-in-class', '10x' — all banned",
    "'Empower / unlock / leverage / harness / streamline' — banned",
    "'Submit', 'Learn more' as CTA labels — banned",
    "Adjective stacks ('comprehensive, intuitive, powerful') — banned",
    "'We' / 'our' — prefer 'you' / direct verbs",
  ],
  sections: [
    {
      name: "Announcement bar",
      purpose: "Momentum signal at the very top",
      layout: "100",
      align: "center",
      components: ["::badge with icon='Sparkles' + link"],
      copyTargets: "6–10 words, format: 'New: <thing> →'",
      example: '::badge[New: Real-time collaboration]{icon="Sparkles" iconColor="#f59e0b" link="/whats-new" linkLabel="Read more"}',
    },
    {
      name: "Hero",
      purpose: "Hook + primary CTA in 3 seconds. Above-the-fold.",
      layout: "60-40",
      align: "left",
      components: [
        "::badge (eyebrow, optional)",
        "# H1 (4–8 words, ≤44 chars)",
        "subhead paragraph (15–25 words)",
        "::button primary + ::button{variant=secondary}",
        "right column: image or icon graphic",
      ],
      copyTargets:
        "H1: outcome, not feature. Subhead: who it's for + how it works. Primary CTA: 2–3 word imperative. Secondary CTA: 'View docs' or 'Book a demo'.",
      example: `::::section{layout="60-40" align="left" id="hero"}
:::column
::badge[New: AI-powered roadmaps]{icon="Sparkles" iconColor="#6366f1"}

# Plan and ship products faster.

The issue tracker engineering teams actually want to use. Built for speed, designed for focus.

::button[Start building]{href="/sign-up" variant="primary"}

::button[View docs]{href="/docs" variant="secondary"}
:::
:::column{align="right"}
::icon{name="Rocket"}
:::
::::`,
    },
    {
      name: "Logo bar",
      purpose: "Borrowed credibility, social proof",
      layout: "100",
      align: "center",
      components: ["small label paragraph", "horizontal logo strip"],
      copyTargets: "Label: 4–8 words. Examples: 'Trusted by teams at...' or 'Loved by 5,000+ engineers'",
      example: `::::section{layout="100" align="center"}
:::column
Trusted by engineering teams at Vercel, Stripe, OpenAI, Linear, Notion, and 500+ more.
:::
::::`,
    },
    {
      name: "Problem framing",
      purpose: "Anchor the JTBD; reframe the pain you solve",
      layout: "100",
      align: "center",
      components: ["::badge eyebrow (optional)", "## H2", "paragraph"],
      copyTargets: "H2: 4–8 words. Paragraph: 30–60 words.",
      example: `::::section{layout="100" align="center"}
:::column
## Issue trackers weren't built for the way modern teams work.

Sprints don't fit how engineers actually ship. Statuses get stale. Updates pile up in Slack. The work happens; the tool doesn't see it.
:::
::::`,
    },
    {
      name: "Primary feature showcase",
      purpose: "Show the *core* capability with detail",
      layout: "50-50",
      align: "left",
      components: ["## H2", "paragraph", "::button (optional)", "right column: visual"],
      copyTargets: "H2: 5–10 words. Paragraph: 40–80 words. ",
      example: `::::section{layout="50-50" align="left"}
:::column
## Real-time collaboration that actually feels real-time.

Move issues, edit specs, and update status alongside your team. No refresh, no merge conflicts, no questions about who is doing what.

::button[See how it works]{href="/features/collaboration" variant="secondary"}
:::
:::column{align="right"}
::icon{name="Users"}
:::
::::`,
    },
    {
      name: "Bento feature grid",
      purpose: "Cover 4–6 secondary features at a glance",
      layout: "33-33-33",
      align: "left",
      components: [":::card per tile: ::icon + ### H3 (3–6 words) + paragraph (15–35 words)"],
      copyTargets: "Each tile heading: 3–6 words. Body: 15–35 words.",
      example: `::::section{layout="33-33-33"}
:::column
:::card
::icon{name="Zap"}

### Keyboard-first

Every action under your fingertips. Built for engineers who never reach for a mouse.
:::
:::
:::column
:::card
::icon{name="Workflow"}

### Custom workflows

Issue states that match how your team actually ships. No imposed methodology.
:::
:::
:::column
:::card
::icon{name="GitBranch"}

### Deep Git integration

Auto-link branches, PRs, and deploys. The tracker stays in sync with the work.
:::
:::
::::`,
    },
    {
      name: "Use cases / personas",
      purpose: "Show fit per buyer (engineer / PM / designer / etc.)",
      layout: "33-33-33",
      align: "left",
      components: [":::card per persona: ### H3 + paragraph"],
      copyTargets: "Each persona card: H3 4–6 words, paragraph 25–50 words.",
      example: `::::section{layout="33-33-33"}
:::column
:::card
### For engineers

Linked branches, automatic status, no busywork. Your tracker stops being a chore.
:::
:::
:::column
:::card
### For product managers

Roadmaps that update themselves. Dependencies you can actually see.
:::
:::
:::column
:::card
### For founders

One source of truth from idea to ship. No more "where's that on?" Slack threads.
:::
:::
::::`,
    },
    {
      name: "Integrations strip",
      purpose: "Reduce switching-cost objection",
      layout: "100",
      align: "center",
      components: ["## H2 (5–8 words)", "paragraph", "logo strip via ::icon directives"],
      copyTargets: "H2: 'Works with the tools you already use' or similar",
      example: `::::section{layout="100" align="center"}
:::column
## Works with the tools you already use.

Two-way sync with GitHub, GitLab, Slack, Figma, Notion, and Linear. Connect in under a minute.
:::
::::`,
    },
    {
      name: "Social proof",
      purpose: "De-risk the decision with a curated quote",
      layout: "100",
      align: "center",
      components: [":::card with quote, name, role, company"],
      copyTargets: "Quote: 25–60 words. Specific outcome, not 'great product'.",
      example: `::::section{layout="100" align="center"}
:::column
:::card
> "We replaced three tools with FlowKan. Our PRs ship 40% faster and our PMs finally trust the roadmap."

**Sarah Chen** · Head of Engineering, Acme · 200-person team
:::
:::
::::`,
    },
    {
      name: "Pricing teaser",
      purpose: "Set expectation without the full /pricing page",
      layout: "33-33-33",
      align: "left",
      components: [":::card per tier: ### tier name + ## price + 5–7 short bullets + ::button"],
      copyTargets: "Each tier: 5–7 bullets max, single CTA per card.",
      example: `::::section{layout="33-33-33"}
:::column
:::card
### Free

## $0

For solo builders.

- Up to 3 projects
- 50 issues per project
- Real-time sync
- Email support

::button[Start free]{href="/sign-up" variant="secondary"}
:::
:::
:::column
:::card
### Pro

## $20/seat/mo

For growing teams.

- Unlimited projects & issues
- Custom workflows
- Slack & GitHub integrations
- Priority support

::button[Start trial]{href="/sign-up?plan=pro" variant="primary"}
:::
:::
:::column
:::card
### Enterprise

## Custom

For 100+ engineer teams.

- SSO & SCIM
- Audit logs & SOC 2
- Dedicated CSM
- 99.99% SLA

::button[Talk to sales]{href="/contact" variant="secondary"}
:::
:::
::::`,
    },
    {
      name: "FAQ",
      purpose: "Defang last objections",
      layout: "33-67",
      align: "left",
      components: ["left column: ## H2 + paragraph", "right column: 5–8 ### Q + paragraph A pairs"],
      copyTargets: "Each Q: under 12 words. Each A: 30–60 words.",
      example: `::::section{layout="33-67" align="left"}
:::column
## Frequently asked questions

Still curious? [Talk to us](/contact) — we read every message.
:::
:::column
### Can I import from Jira or Trello?

Yes. We import projects, issues, comments, and attachments in under five minutes. No data loss.

### How is this different from Linear?

We focus on small dev teams (under 50 engineers). Simpler workflows, faster onboarding, lower price.

### Do you have an API?

Yes. Full REST + GraphQL API. Webhooks for every state change. Rate limits scale with your plan.
:::
::::`,
    },
    {
      name: "Final CTA panel",
      purpose: "Last push, distinct background, hard close",
      layout: "100",
      align: "center",
      bg: "primary",
      components: ["## H2 (4–7 words)", "paragraph (10–20 words)", "::button primary + ::button secondary"],
      copyTargets: "H2: imperative or aspirational. Buttons: same as hero.",
      example: `::::section{layout="100" align="center" bg="primary"}
:::column
## Ship faster, starting today.

Get your team set up in under five minutes. No credit card.

::button[Start free]{href="/sign-up" variant="primary"}

::button[Book a demo]{href="/contact" variant="secondary"}
:::
::::`,
    },
  ],
  antiPatterns: [
    "DON'T put a 'Submit' or 'Learn More' CTA anywhere — always imperative product verbs.",
    "DON'T use stock-photo references — only ::icon directives or media-library images.",
    "DON'T list more than 7 bullets in any pricing tier.",
    "DON'T write subheads longer than 25 words.",
    "DON'T use abstract 3D blob references or 'glassmorphism' — flat, simple visuals.",
    "DON'T claim '10x' / 'revolutionary' / 'next-generation'.",
    "DON'T have more than ONE testimonial in the social proof section unless explicitly asked — curate.",
    "DON'T invent pricing tiers when the user hasn't told you the price — ask first or use placeholders the user will obviously edit.",
    "DON'T forget the announcement bar at the top OR the final CTA panel at the bottom.",
  ],
  visualConventions: [
    "One brand accent color + monochrome neutrals; no rainbow palettes.",
    "Lucide stroked icons only (Rocket, Zap, Sparkles, Workflow, GitBranch, Users, Shield, Heart, Star, Target, Layers, Code, Database, etc.).",
    "Pill badges (`::badge`) for 'New', 'Beta', persona tags.",
    "Use the `bg='primary'` attribute on the final CTA section for visual contrast.",
    "Section layout `60-40` for hero (text-heavy left, visual right), `50-50` for primary feature showcase, `33-33-33` for bento grids and persona cards, `33-67` for FAQ.",
  ],
};

// ---- /pricing recipe ----

const PRICING_RECIPE: PageRecipe = {
  pageType: "pricing",
  description: "Dedicated pricing page following Linear/Vercel/Stripe conventions.",
  voice: HOME_RECIPE.voice,
  doSay: HOME_RECIPE.doSay,
  dontSay: HOME_RECIPE.dontSay,
  sections: [
    {
      name: "Page header",
      purpose: "Set tone: simple, transparent, scales-with-you",
      layout: "100",
      align: "center",
      components: ["# H1", "subhead paragraph"],
      copyTargets: "H1: 4–6 words. Subhead: 15–25 words.",
      example: `::::section{layout="100" align="center"}
:::column
# Pricing that scales with you.

Start free. Upgrade when your team grows. Pay only for active seats.
:::
::::`,
    },
    {
      name: "Three-tier pricing grid",
      purpose: "Free / Pro (highlighted) / Enterprise",
      layout: "33-33-33",
      align: "left",
      components: ["3 :::card blocks, middle one with bg attribute"],
      copyTargets: "Per tier: tier name, price, 5–7 bullets, single ::button.",
      example: HOME_RECIPE.sections[9].example, // reuse pricing teaser shape
    },
    {
      name: "FAQ",
      purpose: "Pricing-specific objections",
      layout: "33-67",
      align: "left",
      components: ["left column heading", "right column: 6–10 Q+A pairs about billing, seats, cancellation"],
      copyTargets: "Same as home FAQ.",
      example: HOME_RECIPE.sections[10].example,
    },
    {
      name: "Final CTA",
      purpose: "Conversion moment",
      layout: "100",
      align: "center",
      bg: "primary",
      components: ["## H2", "::button primary + ::button secondary"],
      copyTargets: "Same as home final CTA.",
      example: HOME_RECIPE.sections[11].example,
    },
  ],
  antiPatterns: HOME_RECIPE.antiPatterns,
  visualConventions: HOME_RECIPE.visualConventions,
};

// ---- Registry ----

const RECIPES: Record<string, PageRecipe> = {
  home: HOME_RECIPE,
  pricing: PRICING_RECIPE,
};

export function getRecipe(pageType: string): PageRecipe {
  return RECIPES[pageType] ?? HOME_RECIPE;
}

// ---- Brand voice ----

export type BrandVoice = {
  tone: string;
  audience: string;
  doSay: string[];
  dontSay: string[];
  exampleHeadlines: string[];
  exampleSubheads: string[];
  exampleCtas: string[];
  notes: string;
};

const DEFAULT_B2B_VOICE: BrandVoice = {
  tone:
    "Confident, declarative, product-flavored. Short, almost dry. Outcome-focused. Like a senior engineering manager describing the product to a peer.",
  audience:
    "Technical operators at small-to-mid B2B SaaS companies (engineering, product, ops). They sniff out marketing fluff in seconds.",
  doSay: HOME_RECIPE.doSay,
  dontSay: HOME_RECIPE.dontSay,
  exampleHeadlines: [
    "Plan and ship products faster.",
    "Issue tracking you'll enjoy using.",
    "Time is money. Save both.",
    "Deploy at the speed of thought.",
    "Real APIs for real teams.",
  ],
  exampleSubheads: [
    "The issue tracker engineering teams actually want to use. Built for speed, designed for focus.",
    "Stop spending Friday afternoon reconciling spreadsheets. Close the books in hours, not days.",
    "Three lines of code to add billing to your app. Five minutes from sign-up to first invoice.",
  ],
  exampleCtas: ["Start building", "Get started — free", "Book a demo", "View docs", "Talk to sales"],
  notes:
    "Per-site overrides land in Site.settings.brandVoice (a JSON field set on the Theme page). Until then, every site uses this default.",
};

const VERTICAL_VOICES: Record<string, Partial<BrandVoice>> = {
  devtool: {
    tone:
      "Engineering-direct. Code snippets are welcome. Skip product marketing language. Linear / Vercel / Supabase voice.",
    audience: "Engineers and tech leads who pick the tool themselves.",
    exampleHeadlines: [
      "Plan and ship products faster.",
      "Deploy at the speed of thought.",
      "Real APIs for real teams.",
    ],
    exampleCtas: ["Start building", "View docs", "GitHub"],
  },
  ops: {
    tone: "Trust-forward, outcome-quantified. Cite numbers. Light on jargon. Ramp / Mercury / Brex voice.",
    audience: "Founders, finance/ops leaders, controllers.",
    exampleHeadlines: ["Time is money. Save both.", "Close your books 8x faster.", "Spending without surprises."],
    exampleCtas: ["Get started", "Book a demo", "Talk to sales"],
  },
  creative: {
    tone: "Bright, confident, opinionated. Show the craft. Framer / Webflow / Figma voice.",
    audience: "Designers, marketers, founders building landing pages and brand sites.",
    exampleHeadlines: [
      "Build sites worth shipping.",
      "Design in the browser.",
      "Make the web feel handmade.",
    ],
    exampleCtas: ["Start designing", "Get started", "View templates"],
  },
};

export function getBrandVoice(opts?: { vertical?: string; siteOverride?: any }): BrandVoice {
  const vertical = opts?.vertical?.toLowerCase();
  const overlay = vertical && VERTICAL_VOICES[vertical] ? VERTICAL_VOICES[vertical] : null;
  const site = opts?.siteOverride;
  return {
    ...DEFAULT_B2B_VOICE,
    ...(overlay ?? {}),
    ...(site ?? {}),
    doSay: site?.doSay ?? overlay?.doSay ?? DEFAULT_B2B_VOICE.doSay,
    dontSay: site?.dontSay ?? overlay?.dontSay ?? DEFAULT_B2B_VOICE.dontSay,
    exampleHeadlines: site?.exampleHeadlines ?? overlay?.exampleHeadlines ?? DEFAULT_B2B_VOICE.exampleHeadlines,
    exampleSubheads: site?.exampleSubheads ?? overlay?.exampleSubheads ?? DEFAULT_B2B_VOICE.exampleSubheads,
    exampleCtas: site?.exampleCtas ?? overlay?.exampleCtas ?? DEFAULT_B2B_VOICE.exampleCtas,
  };
}

// ---- Validation criteria — used by tests + (later) the agent's QA pass ----

export type PageCriteria = {
  minSections: number;
  maxSections: number;
  minH1Words: number;
  maxH1Words: number;
  maxH1Chars: number;
  minButtons: number;
  requiresFinalCta: boolean;
  bannedPhrases: string[];
  bannedCtas: string[];
  minTotalWords: number;
  maxTotalWords: number;
};

export const HOME_CRITERIA: PageCriteria = {
  minSections: 7, // Allow some flexibility — recipe says 12 but partials are OK
  maxSections: 14,
  minH1Words: 3,
  maxH1Words: 10,
  maxH1Chars: 60, // Slight slack over the 44-char ideal
  minButtons: 3, // Hero primary + hero secondary + at least one elsewhere
  requiresFinalCta: true,
  bannedPhrases: [
    "all-in-one platform",
    "all-in-one solution",
    "next-generation",
    "best-in-class",
    "revolutionary",
    "10x ",
    "10X ",
    "synergy",
    "leverage",
    "empower",
    "unlock",
  ],
  bannedCtas: ["submit", "learn more", "click here", "read more"],
  minTotalWords: 250,
  maxTotalWords: 2500,
};
