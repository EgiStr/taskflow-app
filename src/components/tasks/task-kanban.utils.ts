export const TASK_STATUS_FLOW = [
  "DRAFT",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
  "CANCELED",
] as const;

export const KANBAN_COLUMN_STATUSES = [
  "DRAFT",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
] as const;

export type TaskStatus = (typeof TASK_STATUS_FLOW)[number];

export type KanbanTask = {
  id: string;
  trackingId: string;
  title: string;
  status: string;
  priority: string;
  paymentStatus: string;
  price: number;
  dueDate: string | null;
  clientName: string | null;
  assigneeDisplayName: string | null;
};

export const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  TODO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  IN_REVIEW: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const statusLabels: Record<string, string> = {
  DRAFT: "Draf",
  TODO: "Antrean",
  IN_PROGRESS: "Sedang Dikerjakan",
  IN_REVIEW: "Sedang Ditinjau",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

export const priorityConfig: Record<string, { color: string; dot: string }> = {
  LOW: { color: "text-blue-400", dot: "bg-blue-400" },
  MEDIUM: { color: "text-amber-400", dot: "bg-amber-400" },
  HIGH: { color: "text-red-400", dot: "bg-red-400" },
};

export const paymentColors: Record<string, string> = {
  UNPAID: "bg-red-500/10 text-red-400 border-red-500/20",
  DP: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  AWAITING_VERIFICATION: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export const paymentLabels: Record<string, string> = {
  UNPAID: "Belum Dibayar",
  DP: "Uang Muka",
  AWAITING_VERIFICATION: "Menunggu Verifikasi",
  PAID: "Lunas",
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function isTaskOverdue(task: KanbanTask, now: Date = new Date()): boolean {
  if (!task.dueDate) return false;
  if (["COMPLETED", "CANCELED"].includes(task.status)) return false;

  return new Date(task.dueDate) < now;
}

export function groupTasksByStatus(tasks: KanbanTask[]) {
  return KANBAN_COLUMN_STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status),
  }));
}

export function moveTaskToStatus(
  tasks: KanbanTask[],
  taskId: string,
  targetStatus: string
): {
  nextTasks: KanbanTask[];
  previousStatus: string | null;
  changed: boolean;
} {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex < 0) {
    return { nextTasks: tasks, previousStatus: null, changed: false };
  }

  const previousStatus = tasks[taskIndex].status;
  if (previousStatus === targetStatus) {
    return { nextTasks: tasks, previousStatus, changed: false };
  }

  const nextTasks = [...tasks];
  nextTasks[taskIndex] = {
    ...nextTasks[taskIndex],
    status: targetStatus,
  };

  return {
    nextTasks,
    previousStatus,
    changed: true,
  };
}

export function getAdjacentTaskStatus(
  currentStatus: string,
  direction: "next" | "previous"
): string | null {
  const currentIndex = KANBAN_COLUMN_STATUSES.indexOf(
    currentStatus as (typeof KANBAN_COLUMN_STATUSES)[number]
  );

  if (currentIndex < 0) return null;

  const targetIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
  if (targetIndex < 0 || targetIndex >= KANBAN_COLUMN_STATUSES.length) return null;

  return KANBAN_COLUMN_STATUSES[targetIndex];
}

export function getKeyboardMoveStatus(
  currentStatus: string,
  key: string,
  altKey: boolean
): string | null {
  if (!altKey) return null;

  if (key === "ArrowRight") {
    return getAdjacentTaskStatus(currentStatus, "next");
  }

  if (key === "ArrowLeft") {
    return getAdjacentTaskStatus(currentStatus, "previous");
  }

  return null;
}