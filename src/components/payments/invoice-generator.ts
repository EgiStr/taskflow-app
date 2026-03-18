// Dynamic imports are used inside the function to avoid Next.js SSR errors with jspdf

type InvoiceData = {
  trackingId: string;
  clientName: string;
  clientCompany?: string | null;
  taskTitle: string;
  price: number;
  dpAmount: number;
  paymentStatus: string;
  date: Date;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function translatePaymentStatus(status: string) {
  const statusMap: Record<string, string> = {
    UNPAID: "Belum Dibayar",
    DP: "Uang Muka Diterima",
    AWAITING_VERIFICATION: "Menunggu Verifikasi",
    PAID: "Lunas",
  };
  return statusMap[status] || status;
}

export async function generateInvoice(data: InvoiceData) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241); // Indigo color
  doc.text("INVOICE", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("TaskFlow Management System", 14, 28);
  doc.text("Invoice #: INV-" + data.trackingId, 14, 34);
  doc.text("Tanggal: " + new Date(data.date).toLocaleDateString("id-ID"), 14, 40);

  // Client Info
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Ditagihkan Kepada:", 120, 22);
  doc.setFontSize(10);
  doc.text(data.clientName, 120, 28);
  if (data.clientCompany) {
    doc.text(data.clientCompany, 120, 34);
  }

  // Invoice Details Table
  autoTable(doc, {
    startY: 55,
    head: [["Deskripsi", "Status", "Harga"]],
    body: [
      [
        data.taskTitle,
        translatePaymentStatus(data.paymentStatus),
        formatCurrency(data.price),
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241] },
    styles: { font: "helvetica", fontSize: 10 },
  });

  // Financial Summary
  const finalY = (doc as any).lastAutoTable.finalY || 80;
  const remaining = data.price - data.dpAmount;

  autoTable(doc, {
    startY: finalY + 10,
    head: [["Ringkasan", "Jumlah"]],
    body: [
      ["Total Harga", formatCurrency(data.price)],
      ["Uang Muka (DP) Dibayarkan", formatCurrency(data.dpAmount)],
      ["Total Belum Dibayar", formatCurrency(remaining > 0 ? remaining : 0)],
    ],
    theme: "plain",
    styles: { font: "helvetica", fontSize: 10, halign: "right" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 100 },
      1: { cellWidth: 50 },
    },
    margin: { left: 45 },
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("Terima kasih atas kerja samanya!", 14, 280);

  // Download Action
  doc.save(`Invoice_${data.trackingId}.pdf`);
}
