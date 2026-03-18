import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Activity, ArrowUpRight } from "lucide-react";

const actionColors: Record<string, string> = {
  TASK_CREATED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  STATUS_CHANGE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PAYMENT_UPDATE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  TASK_UPDATED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  FILE_UPLOAD: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const actionLabels: Record<string, string> = {
  TASK_CREATED: "Tugas Dibuat",
  STATUS_CHANGE: "Perubahan Status",
  PAYMENT_UPDATE: "Pembaruan Pembayaran",
  TASK_UPDATED: "Tugas Diperbarui",
  FILE_UPLOAD: "Unggah File",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draf",
  TODO: "Antrean",
  IN_PROGRESS: "Sedang Dikerjakan",
  IN_REVIEW: "Sedang Ditinjau",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
  UNPAID: "Belum Dibayar",
  DP: "Uang Muka",
  AWAITING_VERIFICATION: "Menunggu Verifikasi",
  PAID: "Lunas",
};

export default async function ActivityPage() {
  const logs = await prisma.auditLog.findMany({
    include: {
      task: {
        select: { title: true, trackingId: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log Aktivitas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Jejak audit dari semua perubahan sistem
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Aktivitas Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {logs.map((log) => {
              let details: Record<string, string> = {};
              try {
                details = JSON.parse(log.details);
              } catch { /* empty */ }

              return (
                <div
                  key={log.id}
                  className="px-6 py-4 hover:bg-accent/30 transition-colors flex items-start gap-4"
                >
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${actionColors[log.action] || ""}`}
                      >
                        {actionLabels[log.action] || log.action}
                      </Badge>
                      {details.from && details.to && (
                        <span className="text-xs text-muted-foreground">
                          {statusLabels[details.from as keyof typeof statusLabels] || details.from} → {statusLabels[details.to as keyof typeof statusLabels] || details.to}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/admin/tasks/${log.taskId}`}
                      className="text-sm font-medium mt-1 hover:text-primary transition-colors flex items-center gap-1 group"
                    >
                      {log.task.title}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {log.task.trackingId}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Belum ada aktivitas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
