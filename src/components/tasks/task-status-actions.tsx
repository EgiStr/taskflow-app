"use client";

import { updateTaskStatus } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";

const statusFlow = ["DRAFT", "TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"];

const statusLabels: Record<string, string> = {
  DRAFT: "Draf",
  TODO: "Antrean",
  IN_PROGRESS: "Sedang Dikerjakan",
  IN_REVIEW: "Sedang Ditinjau",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

export function TaskStatusActions({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const currentIndex = statusFlow.indexOf(currentStatus);

  if (currentStatus === "COMPLETED" || currentStatus === "CANCELED") return null;

  const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateTaskStatus(taskId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status diperbarui menjadi ${statusLabels[newStatus]}`);
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5 pt-1 border-t border-border/30">
      {nextStatus && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[11px] text-primary hover:text-primary/80 hover:bg-primary/10 flex-1"
          onClick={() => handleStatusChange(nextStatus)}
          disabled={isPending}
        >
          <ArrowRight className="w-3 h-3 mr-1" />
          {statusLabels[nextStatus]}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-[11px] text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
        onClick={() => handleStatusChange("CANCELED")}
        disabled={isPending}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}
