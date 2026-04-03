"use server";

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { createSession, deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";

function isPrismaInitializationError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const prismaError = error as {
    name?: string;
    message?: string;
  };

  return (
    prismaError.name === "PrismaClientInitializationError" ||
    prismaError.message?.includes("Tenant or user not found") === true ||
    prismaError.message?.includes("Error querying the database") === true
  );
}

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = (formData.get("email") as string | null)?.trim() || "";
  const password = (formData.get("password") as string | null)?.trim() || "";

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    console.error("[AUTH] login database error:", error);
    if (isPrismaInitializationError(error)) {
      return {
        error:
          "Koneksi database sedang bermasalah. Silakan coba lagi beberapa saat.",
      };
    }

    return {
      error: "Terjadi kesalahan pada server saat proses masuk.",
    };
  }

  if (!user) {
    return { error: "Email atau kata sandi tidak valid." };
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return { error: "Email atau kata sandi tidak valid." };
  }

  await createSession(user.id, user.email);
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
