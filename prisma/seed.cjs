const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcryptjs.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@taskflow.com" },
    update: {},
    create: {
      email: "admin@taskflow.com",
      password: hashedPassword,
      name: "Admin TaskFlow",
    },
  });
  console.log("Created admin:", admin.email);

  const client1 = await prisma.client.create({
    data: {
      name: "Ahmad Rizki",
      email: "ahmad@example.com",
      phone: "08123456789",
      company: "PT Digital Nusantara",
      notes: "VIP client, always pays on time",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Sarah Putri",
      email: "sarah@example.com",
      phone: "08198765432",
      company: "Startup Maju Jaya",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: "Budi Santoso",
      email: "budi@example.com",
      phone: "08112233445",
      company: "CV Mandiri Sejahtera",
    },
  });

  const tasks = [
    {
      trackingId: "TF-20260319-0001",
      title: "Company Website Redesign",
      description: "Complete redesign of corporate landing page with modern UI/UX",
      status: "IN_PROGRESS",
      priority: "HIGH",
      price: 15000000,
      dpAmount: 7500000,
      paymentStatus: "DP",
      dueDate: new Date("2026-03-25"),
      notes: "Client prefers dark theme, reference: apple.com",
      clientId: client1.id,
    },
    {
      trackingId: "TF-20260319-0002",
      title: "Mobile App UI Design",
      description: "Design 20 screens for e-commerce mobile app",
      status: "TODO",
      priority: "MEDIUM",
      price: 8000000,
      dpAmount: 0,
      paymentStatus: "UNPAID",
      dueDate: new Date("2026-04-01"),
      clientId: client2.id,
    },
    {
      trackingId: "TF-20260319-0003",
      title: "Brand Identity Package",
      description: "Logo, brand guide, stationery, and social media templates",
      status: "COMPLETED",
      priority: "HIGH",
      price: 12000000,
      dpAmount: 12000000,
      paymentStatus: "PAID",
      dueDate: new Date("2026-03-15"),
      clientId: client1.id,
    },
    {
      trackingId: "TF-20260319-0004",
      title: "SEO Optimization",
      description: "Full SEO audit and on-page optimization",
      status: "IN_REVIEW",
      priority: "LOW",
      price: 5000000,
      dpAmount: 2500000,
      paymentStatus: "DP",
      dueDate: new Date("2026-03-20"),
      clientId: client3.id,
    },
    {
      trackingId: "TF-20260319-0005",
      title: "E-commerce Platform Development",
      description: "Full-stack e-commerce with payment gateway integration",
      status: "DRAFT",
      priority: "HIGH",
      price: 25000000,
      dpAmount: 0,
      paymentStatus: "UNPAID",
      dueDate: new Date("2026-05-01"),
      clientId: client2.id,
    },
  ];

  for (const task of tasks) {
    const created = await prisma.task.create({ data: task });
    await prisma.auditLog.create({
      data: {
        action: "TASK_CREATED",
        details: JSON.stringify({ status: task.status, title: task.title }),
        taskId: created.id,
      },
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .then(function() { return prisma.$disconnect(); })
  .catch(function(e) {
    console.error(e);
    return prisma.$disconnect().then(function() { process.exit(1); });
  });
