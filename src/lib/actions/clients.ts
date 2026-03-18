"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const company = formData.get("company") as string;
  const notes = formData.get("notes") as string;

  if (!name) return { error: "Name is required" };

  const client = await prisma.client.create({
    data: { name, email, phone, company, notes },
  });

  revalidatePath("/admin/clients");
  return { success: true, client };
}

export async function updateClient(clientId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const company = formData.get("company") as string;
  const notes = formData.get("notes") as string;

  await prisma.client.update({
    where: { id: clientId },
    data: { name, email, phone, company, notes },
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
  return { success: true };
}

export async function deleteClient(clientId: string) {
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/admin/clients");
  return { success: true };
}
