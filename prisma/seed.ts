import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);
  await Promise.all([
    prisma.user.create({ data: { name: "Dmytro", email: "dmytro@test.com", password } }),
    prisma.user.create({ data: { name: "Andrii", email: "andrii@test.com", password } }),
    prisma.user.create({ data: { name: "Oleksii", email: "oleksii@test.com", password } }),
    prisma.user.create({ data: { name: "Maksym", email: "maksym@test.com", password } }),
  ]);
  console.log("Seed complete!");
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
