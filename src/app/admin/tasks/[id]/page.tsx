import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TaskDetailView } from "@/components/tasks/task-detail-view";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      client: true,
      assignee: { select: { id: true, name: true, email: true } },
      files: { orderBy: { createdAt: "desc" } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!task) notFound();

  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return <TaskDetailView task={task as any} clients={clients} users={users} />;
}
