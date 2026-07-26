import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.create({ data: { name: "Dmytro", email: "dmytro@test.com", password } }),
    prisma.user.create({ data: { name: "Andrii", email: "andrii@test.com", password } }),
    prisma.user.create({ data: { name: "Oleksii", email: "oleksii@test.com", password } }),
    prisma.user.create({ data: { name: "Maksym", email: "maksym@test.com", password } }),
  ]);

  console.log("Created users:", users.map((u) => u.name).join(", "));

  const party1 = await prisma.party.create({
    data: {
      title: "П'ятничний кіновечір",
      date: new Date("2026-07-25T19:00:00"),
      status: "past",
    },
  });

  const party2 = await prisma.party.create({
    data: {
      title: "Наступна зустріч",
      date: new Date("2026-08-01T19:00:00"),
      status: "upcoming",
    },
  });

  await prisma.partyMember.createMany({
    data: [
      { userId: users[0].id, partyId: party1.id },
      { userId: users[1].id, partyId: party1.id },
      { userId: users[2].id, partyId: party1.id },
      { userId: users[0].id, partyId: party2.id },
      { userId: users[1].id, partyId: party2.id },
      { userId: users[3].id, partyId: party2.id },
    ],
  });

  const m1 = await prisma.movie.create({
    data: {
      title: "Inception",
      year: 2010,
      description: "A thief who steals corporate secrets through dream-sharing technology.",
      poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      partyId: party1.id,
    },
  });

  const m2 = await prisma.movie.create({
    data: {
      title: "The Dark Knight",
      year: 2008,
      description: "Batman raises the stakes in his war on crime.",
      poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
      partyId: party1.id,
    },
  });

  await prisma.movie.create({
    data: {
      title: "Dune: Part Three",
      year: 2027,
      description: "The epic conclusion to the Dune saga.",
      partyId: party2.id,
    },
  });

  await prisma.vote.createMany({
    data: [
      { userId: users[0].id, movieId: m1.id, rating: 9 },
      { userId: users[1].id, movieId: m1.id, rating: 8 },
      { userId: users[2].id, movieId: m1.id, rating: 10 },
      { userId: users[0].id, movieId: m2.id, rating: 8 },
      { userId: users[1].id, movieId: m2.id, rating: 9 },
    ],
  });

  await prisma.comment.createMany({
    data: [
      { userId: users[0].id, movieId: m1.id, text: "Неймовірний фільм! Сюжет просто вражає." },
      { userId: users[1].id, movieId: m1.id, text: "Один з найкращих фільмів Нолана." },
    ],
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
