"use client";

import { createTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import Link from "next/link";

type Client = {
  id: string;
  name: string;
  company: string | null;
};

type UserAdmin = {
  id: string;
  name: string | null;
  email: string;
};

export function TaskForm({
  clients: initialClients,
  users,
}: {
  clients: Client[];
  users: UserAdmin[];
}) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("NONE");

  async function handleSubmit(formData: FormData) {
    try {
      const result = await createTask(formData);
      if ("error" in result) {
        toast.error(String(result.error));
      } else {
        toast.success("Tugas berhasil dibuat!");
        router.push("/admin/tasks");
      }
    } catch {
      toast.error("Gagal membuat tugas");
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Judul *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Contoh: Desain Ulang Website Perusahaan"
              className="bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Jelaskan kebutuhan tugas..."
              className="bg-background/50 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Klien</Label>
              <div className="flex gap-2 items-center">
                <Select name="clientId" value={selectedClient} onValueChange={(val) => setSelectedClient(val || "")}>
                  <SelectTrigger className="bg-background/50 flex-1">
                    <span className="truncate">
                      {selectedClient === "NONE" 
                        ? "-- Tanpa Klien --" 
                        : (selectedClient ? `${clients.find((c) => c.id === selectedClient)?.name || selectedClient} ${clients.find((c) => c.id === selectedClient)?.company ? `(${clients.find((c) => c.id === selectedClient)?.company})` : ""}` : "Pilih klien (opsional) ...")}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE" className="text-muted-foreground italic">
                      -- Tanpa Klien --
                    </SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.company && `(${c.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ClientFormDialog
                  onClientCreated={(newClient) => {
                    setClients((prev) => [...prev, newClient]);
                    setSelectedClient(newClient.id);
                  }}
                  wrapperClassName="shrink-0"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigneeId">Penerima Tugas</Label>
              <Select name="assigneeId" value={selectedAssignee} onValueChange={(val) => setSelectedAssignee(val || "NONE")}>
                <SelectTrigger className="bg-background/50">
                  <span className="truncate">
                    {selectedAssignee === "NONE" 
                      ? "-- Belum Ditugaskan --" 
                      : (selectedAssignee ? (users.find((u) => u.id === selectedAssignee)?.name || users.find((u) => u.id === selectedAssignee)?.email || selectedAssignee) : "-- Belum Ditugaskan --")}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE" className="text-muted-foreground italic">
                    -- Belum Ditugaskan --
                  </SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioritas</Label>
              <Select name="priority" defaultValue="MEDIUM">
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">🟢 Rendah</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Sedang</SelectItem>
                  <SelectItem value="HIGH">🔴 Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (IDR)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="0"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Tenggat Waktu</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Internal</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Catatan hanya untuk admin..."
              className="bg-background/50"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link href="/admin/tasks">
              <Button type="button" variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Kembali
              </Button>
            </Link>
            <SubmitButton
              defaultText="Buat Tugas"
              loadingText="Membuat..."
              className="gap-2"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
