import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/tasks/task-form";

export default async function NewTaskPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
  });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buat Tugas Baru</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tambahkan tugas baru ke alur kerja Anda
        </p>
      </div>
      <TaskForm clients={clients} users={users} />
    </div>
  );
}
