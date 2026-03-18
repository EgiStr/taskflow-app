"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type InvoiceButtonProps = {
  data: {
    trackingId: string;
    clientName: string;
    clientCompany?: string | null;
    taskTitle: string;
    price: number;
    dpAmount: number;
    paymentStatus: string;
    date: Date;
  };
};

export default function InvoiceDownloadButton({ data }: InvoiceButtonProps) {
  async function handleClick() {
    // Dynamic import at runtime only — never analyzed by SSR/Turbopack
    const mod = await import("./invoice-generator");
    await mod.generateInvoice(data);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary focus:ring-2 focus:ring-primary/20"
      title="Unduh Invoice"
      onClick={handleClick}
    >
      <Download className="w-4 h-4" />
      <span className="sr-only">Unduh Invoice</span>
    </Button>
  );
}
