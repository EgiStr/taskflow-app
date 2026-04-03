import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TaskKanbanBoard } from "@/components/tasks/task-kanban-board";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: { client: true, assignee: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const initialTasks = tasks.map((task) => ({
    id: task.id,
    trackingId: task.trackingId,
    title: task.title,
    status: task.status,
    priority: task.priority,
    paymentStatus: task.paymentStatus,
    price: task.price,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    clientName: task.client?.name || null,
    assigneeDisplayName: task.assignee
      ? task.assignee.name || task.assignee.email.split("@")[0]
      : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tugas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola dan pantau semua tugas Anda
          </p>
        </div>
        <Link href="/admin/tasks/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Tugas Baru
          </Button>
        </Link>
      </div>

      <TaskKanbanBoard initialTasks={initialTasks} />
    </div>
  );
}
