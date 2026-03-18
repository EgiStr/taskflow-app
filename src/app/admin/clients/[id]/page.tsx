import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  StickyNote,
  ArrowUpRight,
} from "lucide-react";

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

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { auditLogs: { take: 1, orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  const ltv = client.tasks.reduce((sum, t) => sum + t.dpAmount, 0);
  const totalValue = client.tasks.reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{client.name}</h1>
          {client.company && (
            <p className="text-sm text-muted-foreground">{client.company}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client info */}
        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary mx-auto">
                {client.name.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-2 text-sm">
                {client.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" /> {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" /> {client.phone}
                  </div>
                )}
                {client.company && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="w-4 h-4" /> {client.company}
                  </div>
                )}
                {client.notes && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <StickyNote className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-xs">{client.notes}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Nilai Total Siklus Hidup (LTV)</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {formatCurrency(ltv)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Nilai Proyek</span>
                  <span className="text-sm font-mono">{formatCurrency(totalValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Belum Dibayar</span>
                  <span className="text-sm font-mono text-amber-400">
                    {formatCurrency(totalValue - ltv)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Tugas</span>
                  <span className="text-sm font-medium">{client.tasks.length}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Klien sejak {new Date(client.createdAt).toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order history */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Riwayat Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {client.tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/admin/tasks/${task.id}`}
                    className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                          {task.title}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {task.trackingId}
                        </span>
                        <Badge variant="outline" className={`text-[9px] ${statusColors[task.status]}`}>
                          {statusLabels[task.status] || task.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-mono">{formatCurrency(task.price)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(task.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </Link>
                ))}
                {client.tasks.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Belum ada tugas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
