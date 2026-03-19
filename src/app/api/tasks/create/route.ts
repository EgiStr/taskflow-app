import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";
import { fireWebhook, buildTrackingUrl } from "@/lib/n8n-webhook";

function generateTrackingId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TF-${dateStr}-${random}`;
}

/**
 * POST /api/tasks/create
 *
 * Required: clientName, title
 * Optional: clientPhone, clientEmail, telegramChatId, description, priority, price, deadline
 */
export async function POST(request: Request) {
  // 1. Auth
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    // 2. Parse body
    const body = await request.json();
    const {
      clientName,
      clientPhone,
      clientEmail,
      telegramChatId,
      title,
      description,
      priority,
      price,
      deadline,
    } = body as {
      clientName?: string;
      clientPhone?: string;
      clientEmail?: string;
      telegramChatId?: string;
      title?: string;
      description?: string;
      priority?: string;
      price?: number;
      deadline?: string;
    };

    // 3. Validate required fields
    if (!clientName || !title) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Field 'clientName' dan 'title' wajib diisi.",
          },
        },
        { status: 400 }
      );
    }

    const updates: Record<string, string | null> = {};
    if (clientPhone) updates.phone = clientPhone;
    if (clientEmail) updates.email = clientEmail;
    if (telegramChatId) updates.telegramChatId = telegramChatId;

    const client = await prisma.client.upsert({
      where: { name: clientName },
      update: updates,
      create: {
        name: clientName,
        phone: clientPhone || null,
        email: clientEmail || null,
        telegramChatId: telegramChatId || null,
      },
    });
    
    const isNewClient = Date.now() - client.createdAt.getTime() < 5000;

    // 5. Create task with retry for unique trackingId
    let task = null;
    let trackingId = "";
    let retries = 3;
    
    while (retries > 0) {
      try {
        trackingId = generateTrackingId();
        task = await prisma.task.create({
          data: {
            trackingId,
            title,
            description: description || null,
            priority: priority || "MEDIUM",
            price: price || 0,
            dueDate: deadline ? new Date(deadline) : null,
            clientId: client.id,
          },
        });
        break;
      } catch (error: any) {
        if (error.code === 'P2002' && retries > 1) {
          retries--;
          continue;
        }
        throw error;
      }
    }
    
    if (!task) throw new Error("Gagal membuat tracking ID unik");

    // 6. Audit log
    await prisma.auditLog.create({
      data: {
        action: "TASK_CREATED",
        details: JSON.stringify({
          title,
          status: "DRAFT",
          source: "n8n-api",
          clientName,
        }),
        taskId: task.id,
      },
    });

    // 7. Fire webhook (non-blocking)
    const trackingUrl = buildTrackingUrl(trackingId);
    fireWebhook("task.created", {
      taskId: task.id,
      trackingId,
      title,
      status: "DRAFT",
      client: {
        id: client.id,
        name: client.name,
        telegramChatId: client.telegramChatId,
      },
      trackingUrl,
    });

    // 8. Response
    return NextResponse.json(
      {
        success: true,
        data: {
          taskId: task.id,
          trackingId,
          trackingUrl,
          status: "DRAFT",
          client: {
            id: client.id,
            name: client.name,
            isNew: isNewClient,
          },
          createdAt: task.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/tasks/create error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Gagal membuat tugas." },
      },
      { status: 500 }
    );
  }
}
