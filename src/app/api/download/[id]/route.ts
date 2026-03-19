import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { join } from "path";
import { readFile } from "fs/promises";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if it's a deliverable or a payment proof
    const file = await prisma.taskFile.findUnique({
      where: { id },
      include: { task: true },
    });

    let filepath = "";
    let filename = "";

    if (file) {
      filepath = file.filepath;
      filename = file.filename;
    } else {
      const proof = await prisma.paymentProof.findUnique({
        where: { id },
        include: { task: true },
      });
      if (proof) {
        filepath = proof.filepath;
        filename = proof.filename;
        
        // For payment proofs, only admin should see them generally
        const session = await getSession();
        if (!session) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      } else {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    }

    const fullPath = join(process.cwd(), "public", filepath.replace(/^\//, ""));
    const fileBuffer = await readFile(fullPath);

    const response = new NextResponse(fileBuffer);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    response.headers.set("Content-Type", "application/octet-stream");

    return response;
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
