"use client";

import { updateTask, deleteTask } from "@/lib/actions/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/files/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Trash2,
  Clock,
  User,
  Calendar,
  DollarSign,
  FileText,
  Activity,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

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

type TaskWithRelations = {
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
  notes: string | null;
  clientId: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: { id: string; name: string; company: string | null } | null;
  assigneeId: string | null;
  assignee: { id: string; name: string | null; email: string } | null;
  files: { id: string; filename: string; fileType: string; createdAt: Date }[];
  auditLogs: { id: string; action: string; details: string; createdAt: Date }[];
};

type Client = { id: string; name: string; company: string | null };
type UserAdmin = { id: string; name: string | null; email: string };

export function TaskDetailView({
  task,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clients: _clients,
  users,
}: {
  task: TaskWithRelations;
  clients: Client[];
  users: UserAdmin[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    try {
      const result = await updateTask(task.id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Tugas berhasil diperbarui!");
      }
    } catch {
      toast.error("Gagal memperbarui tugas");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;
    await deleteTask(task.id);
    toast.success("Tugas dihapus");
    router.push("/admin/tasks");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{task.title}</h1>
              <Badge variant="outline" className={statusColors[task.status]}>
                {task.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground font-mono">{task.trackingId}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => {
                  navigator.clipboard.writeText(task.trackingId);
                  toast.success("Tracking ID disalin!");
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1.5">
          <Trash2 className="w-3.5 h-3.5" /> Hapus
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Edit Form */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Task Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul</Label>
                  <Input id="title" name="title" defaultValue={task.title} className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={task.description || ""}
                    className="bg-background/50 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select name="status" defaultValue={task.status}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draf</SelectItem>
                        <SelectItem value="TODO">Antrean</SelectItem>
                        <SelectItem value="IN_PROGRESS">Sedang Dikerjakan</SelectItem>
                        <SelectItem value="IN_REVIEW">Sedang Ditinjau</SelectItem>
                        <SelectItem value="COMPLETED">Selesai</SelectItem>
                        <SelectItem value="CANCELED">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prioritas</Label>
                    <Select name="priority" defaultValue={task.priority}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">🟢 Rendah</SelectItem>
                        <SelectItem value="MEDIUM">🟡 Sedang</SelectItem>
                        <SelectItem value="HIGH">🔴 Tinggi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga (IDR)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      defaultValue={task.price}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dpAmount">Nominal DP (IDR)</Label>
                    <Input
                      id="dpAmount"
                      name="dpAmount"
                      type="number"
                      defaultValue={task.dpAmount}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Status Pembayaran</Label>
                    <Select name="paymentStatus" defaultValue={task.paymentStatus}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNPAID">Belum Dibayar</SelectItem>
                        <SelectItem value="DP">Uang Muka</SelectItem>
                        <SelectItem value="AWAITING_VERIFICATION">Menunggu Verifikasi</SelectItem>
                        <SelectItem value="PAID">Lunas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Tenggat Waktu</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigneeId">Penerima Tugas</Label>
                  <Select name="assigneeId" defaultValue={task.assigneeId || "NONE"}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="-- Belum Ditugaskan --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE" className="text-muted-foreground italic">
                        -- Belum Ditugaskan --
                      </SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name || u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan Internal</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={task.notes || ""}
                    className="bg-background/50"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Client info */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4 text-primary" />
                Klien
              </div>
              <div>
                <p className="text-sm font-medium">{task.client?.name || "(Tanpa Klien)"}</p>
                {task.client?.company && (
                  <p className="text-xs text-muted-foreground">{task.client.company}</p>
                )}
              </div>
              {task.client ? (
                <Link
                  href={`/admin/clients/${task.client.id}`}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Lihat klien →
                </Link>
              ) : null}
            </CardContent>
          </Card>

          {/* Financial */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Keuangan
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga</span>
                  <span className="font-mono">{formatCurrency(task.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DP Diterima</span>
                  <span className="font-mono">{formatCurrency(task.dpAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Sisa Pembayaran</span>
                  <span className="font-mono">{formatCurrency(task.price - task.dpAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-blue-400" />
                Linimasa
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Dibuat:</span>
                  <span>{new Date(task.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Diperbarui:</span>
                  <span>{new Date(task.updatedAt).toLocaleDateString("id-ID")}</span>
                </div>
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Tenggat:</span>
                    <span className={new Date(task.dueDate) < new Date() ? "text-red-400" : ""}>
                      {new Date(task.dueDate).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4 text-cyan-400" />
                File &amp; Dokumen
              </div>
              <FileUpload taskId={task.id} type="DELIVERABLE" label="Unggah Hasil Kerja" />
              
              {task.files.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-medium text-muted-foreground">File terlampir:</p>
                  {task.files.map((file) => (
                    <div key={file.id} className="flex flex-col gap-1 p-2 rounded-lg bg-accent/30 border border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate pr-2">{file.filename}</span>
                        <a 
                          href={`/api/download/${file.id}`} 
                          className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded transition-colors"
                        >
                          Unduh
                        </a>
                      </div>
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(file.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity className="w-4 h-4 text-amber-400" />
                Aktivitas
              </div>
              <div className="space-y-2">
                {task.auditLogs.map((log) => (
                  <div key={log.id} className="text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/80" />
                      <span className="font-medium">{log.action.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-muted-foreground pl-3">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
