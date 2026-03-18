import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ListTodo,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

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

const priorityColors: Record<string, string> = {
  LOW: "text-blue-400",
  MEDIUM: "text-amber-400",
  HIGH: "text-red-400",
};

export default async function DashboardPage() {
  const now = new Date();

  const [tasks, totalRevenue, pendingPayments] = await Promise.all([
    prisma.task.findMany({
      include: { client: true, assignee: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.aggregate({
      _sum: { dpAmount: true },
      where: { paymentStatus: { in: ["DP", "PAID"] } },
    }),
    prisma.task.count({
      where: { paymentStatus: { in: ["UNPAID", "DP", "AWAITING_VERIFICATION"] } },
    }),
  ]);

  const activeTasks = tasks.filter(
    (t) => !["COMPLETED", "CANCELED"].includes(t.status)
  ).length;

  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < now &&
      !["COMPLETED", "CANCELED"].includes(t.status)
  ).length;

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;

  const metrics = [
    {
      title: "Tugas Aktif",
      value: activeTasks,
      icon: ListTodo,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Terlambat",
      value: overdueTasks,
      icon: AlertTriangle,
      iconColor: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Menunggu Pembayaran",
      value: pendingPayments,
      icon: Clock,
      iconColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Pendapatan",
      value: formatCurrency(totalRevenue._sum.dpAmount || 0),
      icon: DollarSign,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
  ];

  const recentTasks = tasks.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dasbor</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ringkasan sistem manajemen tugas Anda
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className="border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl ${metric.bgColor} flex items-center justify-center`}
                >
                  <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Tugas</p>
              <p className="text-xl font-bold">{tasks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Selesai</p>
              <p className="text-xl font-bold">{completedTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Nilai</p>
              <p className="text-xl font-bold">
                {formatCurrency(tasks.reduce((sum, t) => sum + t.price, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent tasks table */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Tugas Terbaru</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Aktivitas terakhir di semua tugas</p>
          </div>
          <Link
            href="/admin/tasks"
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Lihat semua <ArrowUpRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tugas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Klien / Penerima
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Prioritas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Harga
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/admin/tasks/${task.id}`}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {task.title}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {task.trackingId}
                      </p>
                    </td>
                    <td className="px-6 py-3.5 text-sm">
                      <div className="text-muted-foreground">
                        {task.client?.name || "(Tanpa Klien)"}
                      </div>
                      {task.assignee && (
                        <div className="text-[10px] font-medium text-primary mt-1">
                          👤 {task.assignee.name || task.assignee.email.split('@')[0]}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${
                          statusColors[task.status] || ""
                        }`}
                      >
                        {statusLabels[task.status] || task.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-xs font-medium ${
                          priorityColors[task.priority] || ""
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-mono">
                      {formatCurrency(task.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
