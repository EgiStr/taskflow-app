import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PaymentActions } from "@/components/payments/payment-actions";
import InvoiceDownloadButton from "@/components/payments/invoice-download-button";
import { DollarSign, CheckCircle2, Clock, TrendingUp } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const paymentColors: Record<string, string> = {
  UNPAID: "bg-red-500/10 text-red-400 border-red-500/20",
  DP: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  AWAITING_VERIFICATION: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const paymentLabels: Record<string, string> = {
  UNPAID: "Belum Dibayar",
  DP: "Uang Muka",
  AWAITING_VERIFICATION: "Menunggu Verifikasi",
  PAID: "Lunas",
};

export default async function PaymentsPage() {
  const tasks = await prisma.task.findMany({
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });

  const totalRevenue = tasks.reduce((sum, t) => sum + t.dpAmount, 0);
  const totalOutstanding = tasks.reduce((sum, t) => sum + (t.price - t.dpAmount), 0);
  const awaitingVerification = tasks.filter(
    (t) => t.paymentStatus === "AWAITING_VERIFICATION"
  ).length;
  const paidCount = tasks.filter((t) => t.paymentStatus === "PAID").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pembayaran</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pantau dan kelola status pembayaran
        </p>
      </div>

      {/* Payment summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pendapatan</p>
              <p className="text-lg font-bold font-mono">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Belum Lunas</p>
              <p className="text-lg font-bold font-mono">{formatCurrency(totalOutstanding)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Menunggu</p>
              <p className="text-lg font-bold">{awaitingVerification}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lunas</p>
              <p className="text-lg font-bold">{paidCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">Semua Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tugas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Klien</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">DP</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Sisa</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/admin/tasks/${task.id}`}
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        {task.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground font-mono">{task.trackingId}</p>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground">{task.client?.name || "(Tanpa Klien)"}</td>
                    <td className="px-6 py-3.5 text-right text-sm font-mono">{formatCurrency(task.price)}</td>
                    <td className="px-6 py-3.5 text-right text-sm font-mono">{formatCurrency(task.dpAmount)}</td>
                    <td className="px-6 py-3.5 text-right text-sm font-mono text-amber-400">
                      {formatCurrency(task.price - task.dpAmount)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <Badge variant="outline" className={`text-[10px] ${paymentColors[task.paymentStatus]}`}>
                        {paymentLabels[task.paymentStatus] || task.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <PaymentActions taskId={task.id} currentStatus={task.paymentStatus} />
                        <InvoiceDownloadButton
                          data={{
                            trackingId: task.trackingId,
                            clientName: task.client?.name || "(Tanpa Klien)",
                            clientCompany: task.client?.company || null,
                            taskTitle: task.title,
                            price: task.price,
                            dpAmount: task.dpAmount,
                            paymentStatus: task.paymentStatus,
                            date: new Date(),
                          }}
                        />
                      </div>
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
