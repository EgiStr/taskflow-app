import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { fireWebhook, buildTrackingUrl } from "@/lib/n8n-webhook";

const VALID_STATUSES = [
  "DRAFT",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
  "CANCELED",
];

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/tasks/{id}/status
 *
 * Body: { "status": "IN_PROGRESS" }
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status: newStatus } = body as { status?: string };

    // Validate status
    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Status tidak valid. Pilihan: ${VALID_STATUSES.join(", ")}`,
          },
        },
        { status: 400 }
      );
    }

    // Find task (support both taskId and trackingId)
    const isTrackingId = id.startsWith("TF-");
    const task = await prisma.task.findUnique({
      where: isTrackingId ? { trackingId: id } : { id },
      include: {
        client: {
          select: { id: true, name: true, telegramChatId: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: `Tugas '${id}' tidak ditemukan.` },
        },
        { status: 404 }
      );
    }

    const oldStatus = task.status;

    if (oldStatus === newStatus) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Status sudah '${newStatus}', tidak ada perubahan.`,
          },
        },
        { status: 400 }
      );
    }

    // Update status
    await prisma.task.update({
      where: { id: task.id },
      data: { status: newStatus },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "STATUS_CHANGE",
        details: JSON.stringify({
          from: oldStatus,
          to: newStatus,
          source: "n8n-api",
        }),
        taskId: task.id,
      },
    });

    // Fire webhook (non-blocking)
    fireWebhook("task.status_changed", {
      taskId: task.id,
      trackingId: task.trackingId,
      title: task.title,
      oldStatus,
      newStatus,
      client: task.client
        ? {
            name: task.client.name,
            telegramChatId: task.client.telegramChatId,
          }
        : null,
      trackingUrl: buildTrackingUrl(task.trackingId),
    });

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        trackingId: task.trackingId,
        oldStatus,
        newStatus,
      },
    });
  } catch (error) {
    console.error("[API] PATCH /api/tasks/[id]/status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Gagal memperbarui status." },
      },
      { status: 500 }
    );
  }
}
