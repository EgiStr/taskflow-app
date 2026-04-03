"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("[ADMIN] segment error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Terjadi gangguan pada halaman admin</h2>
        <p className="text-sm text-muted-foreground">
          Sistem tidak dapat memuat data saat ini. Coba muat ulang halaman. Jika masalah berlanjut,
          periksa konfigurasi database di server produksi.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Kode referensi error: <span className="font-mono">{error.digest}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={reset}>Coba Lagi</Button>
          <Link href="/login">
            <Button variant="outline">Kembali ke Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
