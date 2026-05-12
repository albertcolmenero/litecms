/**
 * Agent runner — central orchestration for the page-builder.
 *
 * Two entry points:
 *  - `streamAgent(ctx, messages)` — for the HTTP route, streams to `useChat`
 *  - `runAgentTurn(ctx, messages)` — for the test script / batch jobs,
 *    awaits the full loop and returns the final state.
 *
 * Both use the same tools and system prompt.
 */

import { streamText, generateText, stepCountIs, type ModelMessage } from "ai";
import { xai } from "@ai-sdk/xai";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "./system-prompt";
import { makeTools, type AgentContext } from "./tools";

const DEFAULT_MODEL = "grok-4-fast-non-reasoning";
const MAX_STEPS = 12;

async function buildSystemPromptForCtx(ctx: AgentContext): Promise<string> {
  const site = await prisma.site.findUnique({
    where: { id: ctx.siteId },
    select: {
      name: true,
      homePageId: true,
      pages: { where: { id: ctx.pageId }, select: { title: true, slug: true } },
    },
  });
  const page = site?.pages[0];
  return buildSystemPrompt({
    siteName: site?.name ?? "(unknown site)",
    pageTitle: page?.title ?? "(untitled)",
    pageSlug: page?.slug ?? "",
    isHomePage: site?.homePageId === ctx.pageId,
  });
}

export async function streamAgent(ctx: AgentContext, messages: ModelMessage[]) {
  const system = await buildSystemPromptForCtx(ctx);
  const tools = makeTools(ctx);
  return streamText({
    model: xai(DEFAULT_MODEL),
    system,
    messages,
    tools,
    stopWhen: stepCountIs(MAX_STEPS),
  });
}

export type AgentTurnResult = {
  text: string;
  toolCalls: Array<{ toolName: string; input: any; output: any }>;
  steps: number;
  finishReason: string;
  usage?: any;
  finalContent: string; // page content after the turn
};

export async function runAgentTurn(
  ctx: AgentContext,
  messages: ModelMessage[],
): Promise<AgentTurnResult> {
  const system = await buildSystemPromptForCtx(ctx);
  const tools = makeTools(ctx);

  const result = await generateText({
    model: xai(DEFAULT_MODEL),
    system,
    messages,
    tools,
    stopWhen: stepCountIs(MAX_STEPS),
  });

  // Collect tool calls + results from steps
  const toolCalls: AgentTurnResult["toolCalls"] = [];
  for (const step of result.steps ?? []) {
    for (const call of step.toolCalls ?? []) {
      const matchingResult = step.toolResults?.find(
        (r: any) => r.toolCallId === call.toolCallId,
      );
      toolCalls.push({
        toolName: call.toolName,
        input: (call as any).input ?? (call as any).args,
        output: (matchingResult as any)?.output ?? (matchingResult as any)?.result ?? null,
      });
    }
  }

  // Read final content
  const page = await prisma.page.findUnique({
    where: { id: ctx.pageId },
    select: { content: true },
  });

  return {
    text: result.text,
    toolCalls,
    steps: result.steps?.length ?? 0,
    finishReason: result.finishReason ?? "unknown",
    usage: result.usage,
    finalContent: page?.content ?? "",
  };
}
