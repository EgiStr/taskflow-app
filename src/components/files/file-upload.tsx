"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File as FileIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function FileUpload({
  taskId,
  type,
  label = "Unggah File",
}: {
  taskId: string;
  type: "DELIVERABLE" | "PAYMENT_PROOF";
  label?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", taskId);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Gagal mengunggah file");
      }

      toast.success("File berhasil diunggah!");
      setFile(null);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Terjadi kesalahan saat mengunggah file");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {!file ? (
        <div className="relative">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={loading}
          />
          <div className="border-2 border-dashed border-border/50 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-accent/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-primary/80" />
            </div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik atau seret file ke sini max 5MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-border/50 rounded-lg p-4 flex items-center justify-between bg-accent/30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center shrink-0">
              <FileIcon className="w-4 h-4 text-primary/80" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFile}
            disabled={loading}
            className="shrink-0 text-muted-foreground hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {file && (
        <Button
          onClick={handleUpload}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunggah...
            </>
          ) : (
            "Mulai Unggah"
          )}
        </Button>
      )}
    </div>
  );
}
