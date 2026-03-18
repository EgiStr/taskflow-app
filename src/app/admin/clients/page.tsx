import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Building, Mail, Phone, DollarSign } from "lucide-react";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      tasks: {
        select: { price: true, dpAmount: true, paymentStatus: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const clientsWithLTV = clients.map((client) => {
    const ltv = client.tasks.reduce((sum, t) => sum + t.dpAmount, 0);
    const totalValue = client.tasks.reduce((sum, t) => sum + t.price, 0);
    const activeTasks = client.tasks.filter(
      (t) => !["COMPLETED", "CANCELED"].includes(t.status)
    ).length;
    return { ...client, ltv, totalValue, activeTasks };
  });

  // Sort by LTV descending
  clientsWithLTV.sort((a, b) => b.ltv - a.ltv);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Klien</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Direktori klien &amp; nilai total pembayaran
          </p>
        </div>
        <ClientFormDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientsWithLTV.map((client, index) => (
          <Link key={client.id} href={`/admin/clients/${client.id}`}>
            <Card className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer group h-full">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {client.name}
                      </p>
                      {client.company && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building className="w-3 h-3" />
                          {client.company}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < 3 && client.ltv > 0 && (
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                      {index === 0 ? "🥇 TOP" : index === 1 ? "🥈 #2" : "🥉 #3"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5">
                  {client.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" /> {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" /> {client.phone}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-muted-foreground">LTV:</span>
                    <span className="text-sm font-mono font-medium text-emerald-400">
                      {formatCurrency(client.ltv)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {client.tasks.length} tugas
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {clientsWithLTV.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Belum ada klien</p>
          </div>
        )}
      </div>
    </div>
  );
}
