"use server";

import { prisma } from "@/lib/prisma";

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { users };
  } catch (error) {
    console.error("[getAllUsers] Error fetching users:", error);
    return { error: "Gagal mengambil data admin." };
  }
}
