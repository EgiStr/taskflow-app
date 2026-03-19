import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Circle,
  Clock,
  User,
  Building,
  DollarSign,
  Calendar,
  Package,
  Receipt,
} from "lucide-react";
import { FileUpload } from "@/components/files/file-upload";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  DP: "Uang Muka Diterima",
  AWAITING_VERIFICATION: "Menunggu Verifikasi",
  PAID: "Lunas",
};

const actionLabels: Record<string, string> = {
  TASK_CREATED: "Tugas Dibuat",
  STATUS_CHANGE: "Perubahan Status",
  PAYMENT_UPDATE: "Pembaruan Pembayaran",
  TASK_UPDATED: "Tugas Diperbarui",
  FILE_UPLOAD: "Unggah File",
};

const statusSteps = ["DRAFT", "TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"];

type TrackingTask = {
  id: string;
  trackingId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  price: number;
  dpAmount: number;
  paymentStatus: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client: { name: string; company: string | null } | null;
  files: { id: string; filename: string; createdAt: Date }[];
  paymentProofs: { id: string; filename: string; createdAt: Date }[];
  auditLogs: { id: string; action: string; details: string; createdAt: Date }[];
};

export function TrackingResult({ task }: { task: TrackingTask }) {
  const currentStepIndex = statusSteps.indexOf(task.status);
  const isCanceled = task.status === "CANCELED";
  const isCompleted = task.status === "COMPLETED";
  const isPaid = task.paymentStatus === "PAID";

  return (
    <div className="mt-8 space-y-6">
      {/* Main info card */}
      <Card className="border-border bg-card overflow-hidden">
        <div className={`h-1 ${isCompleted ? "bg-emerald-500" : isCanceled ? "bg-red-500" : "bg-primary"}`} />
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Package className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-lg">{task.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{task.trackingId}</p>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
              )}
            </div>
            <Badge variant="outline" className={`shrink-0 ${statusColors[task.status]}`}>
              {statusLabels[task.status] || task.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="w-3 h-3" /> Klien
              </div>
              <p className="text-sm font-medium">{task.client?.name || "(Tanpa Klien)"}</p>
              {task.client?.company && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building className="w-3 h-3" /> {task.client.company}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DollarSign className="w-3 h-3" /> Pembayaran
              </div>
              <p className="text-sm font-medium">
                {paymentLabels[task.paymentStatus] || task.paymentStatus}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" /> Dibuat
              </div>
              <p className="text-sm font-medium">
                {new Date(task.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            {task.dueDate && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> Tenggat Waktu
                </div>
                <p className="text-sm font-medium">
                  {new Date(task.dueDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Proof Section */}
      {(!isCompleted && !isCanceled && (task.paymentStatus === "UNPAID" || task.paymentStatus === "DP")) && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-medium">Unggah Bukti Pembayaran</h4>
                <p className="text-sm text-muted-foreground">Selesaikan pembayaran agar pesanan dapat diproses</p>
              </div>
            </div>
            
            <FileUpload taskId={task.id} type="PAYMENT_PROOF" label="Pilih Bukti Pembayaran" />

            {task.paymentProofs.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Bukti terunggah:</p>
                {task.paymentProofs.map((proof) => (
                  <div key={proof.id} className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="truncate">{proof.filename}</span>
                    <span className="text-[10px] ml-auto">{new Date(proof.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress timeline */}
      {!isCanceled && (
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <h4 className="text-sm font-medium mb-6">Linimasa Progres</h4>
            <div className="flex items-center justify-between relative">
              {/* Progress bar background */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
              {/* Progress bar fill */}
              <div
                className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
                style={{
                  width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100 - 4)}%`,
                }}
              />

              {statusSteps.map((step, i) => {
                const isComplete = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step} className="relative flex flex-col items-center z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isComplete
                          ? "bg-primary"
                          : "bg-card border-2 border-border"
                      } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] mt-2 text-center max-w-[60px] ${
                        isComplete ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {statusLabels[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity timeline */}
      {task.auditLogs.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <h4 className="text-sm font-medium mb-4">Linimasa Aktivitas</h4>
            <div className="space-y-4">
              {task.auditLogs.map((log, i) => {
                let details: Record<string, string> = {};
                try {
                  details = JSON.parse(log.details);
                } catch { /* empty */ }
                return (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      {i < task.auditLogs.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">
                        {actionLabels[log.action] || log.action}
                      </p>
                      {details.from && details.to && (
                        <p className="text-xs text-muted-foreground">
                          {statusLabels[details.from as keyof typeof statusLabels] || details.from} → {statusLabels[details.to as keyof typeof statusLabels] || details.to}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(log.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download section */}
      {isCompleted && isPaid && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="font-medium">Pesanan Anda telah selesai!</h4>
            <p className="text-sm text-muted-foreground">
              {task.files.length > 0
                ? "File hasil pekerjaan Anda siap untuk diunduh."
                : "File hasil pekerjaan akan tersedia di sini setelah diunggah oleh admin."}
            </p>
            {task.files.map((file) => (
              <a
                key={file.id}
                href={`/api/download/${file.id}`}
                className="inline-block px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              >
                Unduh {file.filename}
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
