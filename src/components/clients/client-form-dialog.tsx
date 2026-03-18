"use client";

import { createClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ClientFormDialog({
  onClientCreated,
  wrapperClassName,
}: {
  onClientCreated?: (client: { id: string; name: string; company: string | null }) => void;
  wrapperClassName?: string;
} = {}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await createClient(formData);
      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        toast.success("Klien berhasil dibuat!");
        setOpen(false);
        if (onClientCreated && result.client) {
          onClientCreated(result.client);
        }
      }
    } catch {
      toast.error("Gagal membuat klien");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={wrapperClassName}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button type="button" />
          }
        >
          <Plus className="w-4 h-4 mr-2" /> Klien Baru
        </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Klien Baru</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input id="name" name="name" required className="bg-background/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" name="phone" className="bg-background/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Perusahaan</Label>
            <Input id="company" name="company" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" name="notes" className="bg-background/50" />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Membuat..." : "Buat Klien"}
          </Button>
        </form>
      </DialogContent>
      </Dialog>
    </div>
  );
}
