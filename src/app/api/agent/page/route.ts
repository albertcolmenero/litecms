/**
 * POST /api/agent/page
 *
 * Streams a page-builder agent response. Resolves Clerk → userId, then hands
 * off to `streamAgent`.
 *
 * Request body: { messages: UIMessage[], siteId: string, pageId: string }
 */

import { convertToModelMessages, type UIMessage } from "ai";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { streamAgent } from "@/lib/agent/run";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });
  if (!dbUser) return new Response("User not found", { status: 404 });

  const body = (await req.json()) as {
    messages: UIMessage[];
    siteId: string;
    pageId: string;
  };

  if (!body.siteId || !body.pageId) {
    return new Response("siteId and pageId required", { status: 400 });
  }

  // Sanity-check ownership
  const page = await prisma.page.findUnique({
    where: { id: body.pageId },
    include: { site: { select: { userId: true } } },
  });
  if (!page) return new Response("Page not found", { status: 404 });
  if (page.site.userId !== dbUser.id) return new Response("Forbidden", { status: 403 });

  const result = await streamAgent(
    { userId: dbUser.id, siteId: body.siteId, pageId: body.pageId },
    await convertToModelMessages(body.messages),
  );

  return result.toUIMessageStreamResponse();
}
