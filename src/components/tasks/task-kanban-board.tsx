"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { TaskStatusActions } from "@/components/tasks/task-status-actions";
import {
  type KanbanTask,
  formatCurrency,
  getKeyboardMoveStatus,
  groupTasksByStatus,
  isTaskOverdue,
  moveTaskToStatus,
  paymentColors,
  paymentLabels,
  priorityConfig,
  statusColors,
  statusLabels,
} from "@/components/tasks/task-kanban.utils";

type TaskKanbanBoardProps = {
  initialTasks: KanbanTask[];
};

export function TaskKanbanBoard({ initialTasks }: TaskKanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropTargetStatus, setDropTargetStatus] = useState<string | null>(null);
  const [pendingTaskIds, setPendingTaskIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Sinkronisasi dengan server data: Update tasks ketika RSC payload baru (initialTasks) tiba.
  // Ini penting agar state sinkron setelah Next.js memanggil revalidatePath.
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const columns = useMemo(() => groupTasksByStatus(tasks), [tasks]);

  const isTaskPending = (taskId: string) => pendingTaskIds.includes(taskId);

  const commitStatusChange = (taskId: string, targetStatus: string) => {
    if (isTaskPending(taskId)) return;

    const moveResult = moveTaskToStatus(tasks, taskId, targetStatus);
    if (!moveResult.changed || !moveResult.previousStatus) return;
    const previousStatus = moveResult.previousStatus;

    setTasks(moveResult.nextTasks);
    setPendingTaskIds((current) => (current.includes(taskId) ? current : [...current, taskId]));

    // Membungkus Next.js Server Action dalam startTransition sangat diwajibkan 
    // ketika mengubah dari Synthetic Event seperti Drag and Drop, agar pemanggilan 
    // network internal Next.js App Router stabil dan promise queue terbaca.
    startTransition(async () => {
      try {
        const result = await updateTaskStatus(taskId, targetStatus);
        if (result.error) {
          setTasks((currentTasks) =>
            moveTaskToStatus(currentTasks, taskId, previousStatus).nextTasks
          );
          toast.error(result.error);
          return;
        }

        toast.success(`Status diperbarui menjadi ${statusLabels[targetStatus] || targetStatus}`);
      } catch {
        setTasks((currentTasks) =>
          moveTaskToStatus(currentTasks, taskId, previousStatus).nextTasks
        );
        toast.error("Gagal memperbarui status tugas.");
      } finally {
        setPendingTaskIds((current) => current.filter((id) => id !== taskId));
      }
    });
  };

  const handleCardDragStart = (taskId: string) => (event: React.DragEvent<HTMLDivElement>) => {
    if (isTaskPending(taskId)) {
      event.preventDefault();
      return;
    }

    setDraggingTaskId(taskId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", taskId);
  };

  const handleCardDragEnd = () => {
    setDraggingTaskId(null);
    setDropTargetStatus(null);
  };

  const handleColumnDragOver = (status: string) => (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (draggingTaskId && !isTaskPending(draggingTaskId)) {
      setDropTargetStatus(status);
    }
  };

  const handleColumnDrop = (targetStatus: string) => (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const draggedTaskId = draggingTaskId || event.dataTransfer.getData("text/plain");
    setDraggingTaskId(null);
    setDropTargetStatus(null);

    if (!draggedTaskId) return;
    if (isTaskPending(draggedTaskId)) return;
    commitStatusChange(draggedTaskId, targetStatus);
  };

  const handleCardKeyDown =
    (taskId: string, currentStatus: string) => (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest("a,button,input,textarea,select")) return;

      const targetStatus = getKeyboardMoveStatus(currentStatus, event.key, event.altKey);
      if (!targetStatus) return;

      event.preventDefault();
      commitStatusChange(taskId, targetStatus);
    };

  const now = new Date();

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Seret kartu tugas ke kolom status untuk memindahkan ke langkah berikutnya atau kembali ke langkah sebelumnya.
        Untuk tanpa mouse: fokus kartu, lalu tekan Alt + Panah Kanan (maju) atau Alt + Panah Kiri (mundur).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {columns.map((col) => (
          <div key={col.status} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] ${statusColors[col.status] || ""}`}>
                  {statusLabels[col.status] || col.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{col.tasks.length}</span>
              </div>
            </div>

            <div
              data-testid={`kanban-column-${col.status}`}
              className={cn(
                "space-y-2 min-h-[100px] rounded-xl border border-dashed border-transparent p-1 transition-colors",
                draggingTaskId && dropTargetStatus === col.status && "border-primary/40 bg-primary/5"
              )}
              onDragOver={handleColumnDragOver(col.status)}
              onDrop={handleColumnDrop(col.status)}
            >
              {col.tasks.map((task) => {
                const isOverdue = isTaskOverdue(task, now);
                const isDragging = draggingTaskId === task.id;
                const isUpdating = isTaskPending(task.id);

                return (
                  <Card
                    key={task.id}
                    draggable={!isUpdating}
                    data-testid={`kanban-card-${task.id}`}
                    tabIndex={0}
                    aria-busy={isUpdating}
                    aria-label={`Kartu tugas ${task.title}`}
                    className={cn(
                      "border-border bg-card hover:bg-accent/50 transition-colors",
                      isOverdue && "border-red-500/30",
                      isDragging && "opacity-60 ring-1 ring-primary/40",
                      isUpdating && "ring-1 ring-primary/40"
                    )}
                    onDragStart={handleCardDragStart(task.id)}
                    onDragEnd={handleCardDragEnd}
                    onKeyDown={handleCardKeyDown(task.id, task.status)}
                  >
                    <CardContent className="p-3.5 space-y-3">
                      {isUpdating && (
                        <div
                          className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary"
                          role="status"
                          aria-live="polite"
                        >
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Memperbarui status...
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/admin/tasks/${task.id}`}
                          className="text-sm font-medium hover:text-primary/80 transition-colors line-clamp-2 leading-tight"
                        >
                          {task.title}
                        </Link>
                        <div className="flex items-center shrink-0">
                          <div
                            className={`w-2 h-2 rounded-full ${priorityConfig[task.priority]?.dot || "bg-gray-400"}`}
                            title={task.priority}
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground font-mono">{task.trackingId}</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">{task.clientName || "(Tanpa Klien)"}</span>
                        </div>
                        {task.assigneeDisplayName && (
                          <div className="flex items-center gap-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium border border-primary/20">
                            <span className="truncate max-w-[80px]">{task.assigneeDisplayName}</span>
                          </div>
                        )}
                      </div>

                      {task.dueDate && (
                        <div className={cn("flex items-center gap-1.5 text-xs", isOverdue ? "text-red-400" : "text-muted-foreground")}>
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {isOverdue && (
                            <Badge
                              variant="outline"
                              className="text-[9px] bg-red-500/10 text-red-400 border-red-500/20 ml-auto"
                            >
                              TERLAMBAT
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${paymentColors[task.paymentStatus] || ""}`}
                        >
                          {paymentLabels[task.paymentStatus] || task.paymentStatus}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatCurrency(task.price)}
                        </span>
                      </div>

                      <TaskStatusActions
                        taskId={task.id}
                        currentStatus={task.status}
                        disabled={isUpdating}
                        onRequestStatusChange={(newStatus) => commitStatusChange(task.id, newStatus)}
                      />
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