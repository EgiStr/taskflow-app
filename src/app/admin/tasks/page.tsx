import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Calendar, User } from "lucide-react";
import { TaskStatusActions } from "@/components/tasks/task-status-actions";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  TODO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  IN_REVIEW: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const priorityConfig: Record<string, { color: string; dot: string }> = {
  LOW: { color: "text-blue-400", dot: "bg-blue-400" },
  MEDIUM: { color: "text-amber-400", dot: "bg-amber-400" },
  HIGH: { color: "text-red-400", dot: "bg-red-400" },
};

const paymentColors: Record<string, string> = {
  UNPAID: "bg-red-500/10 text-red-400 border-red-500/20",
  DP: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  AWAITING_VERIFICATION: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draf",
  TODO: "Antrean",
  IN_PROGRESS: "Sedang Dikerjakan",
  IN_REVIEW: "Sedang Ditinjau",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

const paymentLabels: Record<string, string> = {
  UNPAID: "Belum Dibayar",
  DP: "Uang Muka",
  AWAITING_VERIFICATION: "Menunggu Verifikasi",
  PAID: "Lunas",
};

const statusFlow = ["DRAFT", "TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "CANCELED"];

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: { client: true, assignee: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  // Group by status for Kanban-like columns
  const columns = statusFlow.filter(s => s !== "CANCELED").map((status) => ({
    status,
    tasks: tasks.filter((t) => t.status === status),
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

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {columns.map((col) => (
          <div key={col.status} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] ${statusColors[col.status]}`}>
                  {statusLabels[col.status] || col.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{col.tasks.length}</span>
              </div>
            </div>

            <div className="space-y-2 min-h-[100px]">
              {col.tasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < now &&
                  !["COMPLETED", "CANCELED"].includes(task.status);

                return (
                  <Card
                    key={task.id}
                    className={`border-border bg-card hover:bg-accent/50 transition-colors ${
                      isOverdue ? "border-red-500/30" : ""
                    }`}
                  >
                    <CardContent className="p-3.5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/admin/tasks/${task.id}`}
                          className="text-sm font-medium hover:text-primary/80 transition-colors line-clamp-2 leading-tight"
                        >
                          {task.title}
                        </Link>
                        <div className="flex items-center shrink-0">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              priorityConfig[task.priority]?.dot
                            }`}
                            title={task.priority}
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground font-mono">
                        {task.trackingId}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">{task.client?.name || "(Tanpa Klien)"}</span>
                        </div>
                        {task.assignee && (
                          <div className="flex items-center gap-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium border border-primary/20">
                            <span className="truncate max-w-[80px]">{task.assignee.name || task.assignee.email.split('@')[0]}</span>
                          </div>
                        )}
                      </div>

                      {task.dueDate && (
                        <div
                          className={`flex items-center gap-1.5 text-xs ${
                            isOverdue ? "text-red-400" : "text-muted-foreground"
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {isOverdue && (
                            <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-400 border-red-500/20 ml-auto">
                              TERLAMBAT
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <Badge variant="outline" className={`text-[9px] ${paymentColors[task.paymentStatus]}`}>
                          {paymentLabels[task.paymentStatus] || task.paymentStatus}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatCurrency(task.price)}
                        </span>
                      </div>

                      <TaskStatusActions taskId={task.id} currentStatus={task.status} />
                    </CardContent>
                  </Card>
                );
              })}

              {col.tasks.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/50 p-6 text-center">
                  <p className="text-xs text-muted-foreground">Belum ada tugas</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
