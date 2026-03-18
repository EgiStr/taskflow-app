import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const taskId = formData.get("taskId") as string;
    const type = formData.get("type") as string; // 'DELIVERABLE' or 'PAYMENT_PROOF'

    if (!file || !taskId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // If uploading deliverable, require admin auth
    if (type === "DELIVERABLE") {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    // If uploading payment proof, we allow public access assuming they have the tracking page open
    // However, in a real app, we might want to pass the trackingId to verify they actually have access

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueFilename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Ignore directory exists error
    }

    const filepath = join(uploadDir, uniqueFilename);
    const dbFilepath = `/uploads/${uniqueFilename}`;

    await writeFile(filepath, buffer);

    if (type === "DELIVERABLE") {
      await prisma.taskFile.create({
        data: {
          filename: file.name,
          filepath: dbFilepath,
          fileType: "DELIVERABLE",
          taskId,
        },
      });

      await prisma.auditLog.create({
        data: {
          taskId,
          action: "FILE_UPLOAD",
          details: JSON.stringify({ type: "Deliverable", filename: file.name }),
        },
      });
    } else if (type === "PAYMENT_PROOF") {
      await prisma.paymentProof.create({
        data: {
          filename: file.name,
          filepath: dbFilepath,
          taskId,
        },
      });

      await prisma.auditLog.create({
        data: {
          taskId,
          action: "FILE_UPLOAD",
          details: JSON.stringify({ type: "Payment Proof", filename: file.name }),
        },
      });
    }

    return NextResponse.json({ success: true, filepath: dbFilepath });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
