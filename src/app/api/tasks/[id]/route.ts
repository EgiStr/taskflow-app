import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/tasks/{id}
 *
 * Accepts taskId (cuid) or trackingId (TF-XXXXXXXX-XXXX).
 */
export async function GET(request: Request, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    // Determine if the id is a trackingId (starts with "TF-") or a cuid
    const isTrackingId = id.startsWith("TF-");

    const task = await prisma.task.findUnique({
      where: isTrackingId ? { trackingId: id } : { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            company: true,
            telegramChatId: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        files: {
          select: { id: true, filename: true, fileType: true, createdAt: true },
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

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.id,
        trackingId: task.trackingId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        price: task.price,
        dpAmount: task.dpAmount,
        paymentStatus: task.paymentStatus,
        dueDate: task.dueDate?.toISOString() || null,
        client: task.client
          ? {
              id: task.client.id,
              name: task.client.name,
              phone: task.client.phone,
              email: task.client.email,
              company: task.client.company,
              telegramChatId: task.client.telegramChatId,
            }
          : null,
        files: task.files,
        auditLogs: task.auditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          details: log.details,
          createdAt: log.createdAt.toISOString(),
        })),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/tasks/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Gagal mengambil data tugas." },
      },
      { status: 500 }
    );
  }
}
