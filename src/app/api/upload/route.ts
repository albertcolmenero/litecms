import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
];

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const siteId = formData.get("siteId") as string | null;

        if (!file || !siteId) {
            return NextResponse.json(
                { error: "File and siteId are required" },
                { status: 400 }
            );
        }

        const site = await prisma.site.findUnique({
            where: { id: siteId },
            include: { user: true },
        });

        if (!site || site.user.clerkId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 10 MB." },
                { status: 400 }
            );
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `File type ${file.type} is not allowed.` },
                { status: 400 }
            );
        }

        const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const timestamp = Date.now();
        const pathname = `${siteId}/${timestamp}-${originalName}`;

        const blob = await put(pathname, file, { access: "public" });

        const asset = await prisma.asset.create({
            data: {
                key: blob.pathname,
                url: blob.url,
                filename: file.name,
                mimeType: file.type,
                size: file.size,
                siteId,
            },
        });

        return NextResponse.json({ asset });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { assetId, siteId } = await req.json();

        if (!assetId || !siteId) {
            return NextResponse.json(
                { error: "assetId and siteId are required" },
                { status: 400 }
            );
        }

        const site = await prisma.site.findUnique({
            where: { id: siteId },
            include: { user: true },
        });

        if (!site || site.user.clerkId !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const asset = await prisma.asset.findUnique({
            where: { id: assetId },
        });

        if (!asset || asset.siteId !== siteId) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }

        try {
            await del(asset.url);
        } catch {
            // Blob may already be deleted — continue with DB cleanup
        }

        await prisma.asset.delete({ where: { id: assetId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }
}
