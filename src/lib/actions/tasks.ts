"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { fireWebhook, buildTrackingUrl } from "@/lib/n8n-webhook";

function generateTrackingId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TF-${dateStr}-${random}`;
}

export async function createTask(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const clientIdForm = formData.get("clientId") as string;
  const clientId = clientIdForm && clientIdForm !== "NONE" ? clientIdForm : undefined;
  const priority = formData.get("priority") as string || "MEDIUM";
  const price = parseFloat(formData.get("price") as string) || 0;
  const dueDate = formData.get("dueDate") as string;
  const notes = formData.get("notes") as string;
  
  const assigneeIdForm = formData.get("assigneeId") as string;
  const assigneeId = assigneeIdForm && assigneeIdForm !== "NONE" ? assigneeIdForm : undefined;

  let task;
  let retries = 3;
  while (retries > 0) {
    try {
      task = await prisma.task.create({
        data: {
          trackingId: generateTrackingId(),
          title,
          description,
          clientId,
          assigneeId,
          priority,
          price,
          dueDate: dueDate ? new Date(dueDate) : null,
          notes,
        },
      });
      break;
    } catch (error: any) {
      if (error.code === 'P2002' && retries > 1) {
        retries--;
        continue;
      }
      return { error: 'Gagal membuat tugas. Silakan coba lagi.' };
    }
  }

  if (!task) return { error: 'Gagal membuat tugas unik.' };

  await prisma.auditLog.create({
    data: {
      action: "TASK_CREATED",
      details: JSON.stringify({ title, status: "DRAFT" }),
      taskId: task.id,
    },
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/admin");
  return { success: true, task };
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { client: { select: { name: true, telegramChatId: true } } },
  });
  if (!task) return { error: "Task not found" };

  const oldStatus = task.status;

  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });

  await prisma.auditLog.create({
    data: {
      action: "STATUS_CHANGE",
      details: JSON.stringify({ from: oldStatus, to: newStatus }),
      taskId,
    },
  });

  // Fire webhook to n8n (non-blocking)
  fireWebhook("task.status_changed", {
    taskId: task.id,
    trackingId: task.trackingId,
    title: task.title,
    oldStatus,
    newStatus,
    client: task.client
      ? { name: task.client.name, telegramChatId: task.client.telegramChatId }
      : null,
    trackingUrl: buildTrackingUrl(task.trackingId),
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateTask(taskId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const dpAmount = parseFloat(formData.get("dpAmount") as string) || 0;
  const dueDate = formData.get("dueDate") as string;
  const notes = formData.get("notes") as string;
  const paymentStatus = formData.get("paymentStatus") as string;
  const status = formData.get("status") as string;
  const clientIdForm = formData.get("clientId") as string;
  const clientId = clientIdForm === "NONE" ? undefined : clientIdForm || undefined;
  
  const assigneeIdForm = formData.get("assigneeId") as string;
  const assigneeId = assigneeIdForm === "NONE" ? null : assigneeIdForm || undefined;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { error: "Task not found" };

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: title || undefined,
      description: description || undefined,
      priority: priority || undefined,
      price,
      dpAmount,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes: notes !== null ? notes : undefined,
      paymentStatus: paymentStatus || undefined,
      status: status || undefined,
      clientId,
      assigneeId: assigneeId === null ? null : assigneeId,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "TASK_UPDATED",
      details: JSON.stringify({ fields: "updated" }),
      taskId,
    },
  });

  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/tasks/${taskId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/admin/tasks");
  revalidatePath("/admin");
  return { success: true };
}

export async function updatePaymentStatus(taskId: string, paymentStatus: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { client: { select: { name: true, telegramChatId: true } } },
  });
  if (!task) return { error: "Task not found" };

  await prisma.task.update({
    where: { id: taskId },
    data: { paymentStatus },
  });

  await prisma.auditLog.create({
    data: {
      action: "PAYMENT_UPDATE",
      details: JSON.stringify({
        from: task.paymentStatus,
        to: paymentStatus,
      }),
      taskId,
    },
  });

  // Fire webhook to n8n (non-blocking)
  fireWebhook("task.payment_updated", {
    taskId: task.id,
    trackingId: task.trackingId,
    title: task.title,
    oldPaymentStatus: task.paymentStatus,
    newPaymentStatus: paymentStatus,
    client: task.client
      ? { name: task.client.name, telegramChatId: task.client.telegramChatId }
      : null,
    trackingUrl: buildTrackingUrl(task.trackingId),
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin/tasks");
  revalidatePath("/admin");
  return { success: true };
}
