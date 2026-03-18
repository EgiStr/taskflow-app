import { prisma } from "@/lib/prisma";
import { TrackingSearch } from "@/components/tracking/tracking-search";
import { TrackingResult } from "@/components/tracking/tracking-result";
import Image from "next/image";
import Link from "next/link";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  let task = null;
  if (id) {
    task = await prisma.task.findUnique({
      where: { trackingId: id },
      include: {
        client: { select: { name: true, company: true } },
        files: {
          where: { fileType: "DELIVERABLE" },
          select: { id: true, filename: true, createdAt: true },
        },
        paymentProofs: {
          select: { id: true, filename: true, createdAt: true },
        },
        auditLogs: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex justify-center mb-8">
              <Image
                src="/taskflow.png"
                alt="TaskFlow Logo"
                width={64}
                height={64}
                priority
                className="object-contain hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">TaskFlow</h1>
              <p className="text-[10px] text-muted-foreground">Pelacakan Pesanan</p>
            </div>
          </div>
          <Link
            href="/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Masuk Admin
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Lacak <span className="text-primary">Pesanan</span> Anda
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Masukkan ID pelacakan (Nomor Resi) untuk melihat status pesanan Anda saat ini
          </p>
        </div>

        <TrackingSearch currentId={id} />

        {id && !task && (
          <div className="mt-8 text-center py-12 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">
              Pesanan dengan ID pelacakan tidak ditemukan: <span className="font-mono font-medium">{id}</span>
            </p>
          </div>
        )}

        {task && <TrackingResult task={task} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 TaskFlow. Hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}
