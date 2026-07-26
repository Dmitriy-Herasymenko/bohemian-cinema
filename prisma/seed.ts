import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create users (friends)
  const users = await Promise.all([
    prisma.user.upsert({
      where: { name: "Dmytro" },
      update: {},
      create: { name: "Dmytro" },
    }),
    prisma.user.upsert({
      where: { name: "Andrii" },
      update: {},
      create: { name: "Andrii" },
    }),
    prisma.user.upsert({
      where: { name: "Oleksii" },
      update: {},
      create: { name: "Oleksii" },
    }),
    prisma.user.upsert({
      where: { name: "Maksym" },
      update: {},
      create: { name: "Maksym" },
    }),
  ]);

  console.log("Created users:", users.map((u) => u.name).join(", "));

  // Create some watched movies
  const watchedMovies = await Promise.all([
    prisma.movie.create({
      data: {
        title: "Inception",
        year: 2010,
        description: "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea into the mind of a C.E.O.",
        status: "watched",
      },
    }),
    prisma.movie.create({
      data: {
        title: "The Dark Knight",
        year: 2008,
        description: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
        status: "watched",
      },
    }),
    prisma.movie.create({
      data: {
        title: "Interstellar",
        year: 2014,
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        status: "watched",
      },
    }),
  ]);

  // Create upcoming movies
  const upcomingMovies = await Promise.all([
    prisma.movie.create({
      data: {
        title: "Dune: Part Three",
        year: 2027,
        description: "The epic conclusion to the Dune saga.",
        status: "upcoming",
      },
    }),
    prisma.movie.create({
      data: {
        title: "Oppenheimer 2",
        year: 2027,
        description: "Another masterpiece from Christopher Nolan.",
        status: "upcoming",
      },
    }),
  ]);

  console.log("Created watched movies:", watchedMovies.length);
  console.log("Created upcoming movies:", upcomingMovies.length);

  // Add some votes
  const votes = await Promise.all([
    prisma.vote.create({
      data: { userId: users[0].id, movieId: watchedMovies[0].id, rating: 9 },
    }),
    prisma.vote.create({
      data: { userId: users[1].id, movieId: watchedMovies[0].id, rating: 8 },
    }),
    prisma.vote.create({
      data: { userId: users[2].id, movieId: watchedMovies[0].id, rating: 10 },
    }),
  ]);

  console.log("Created votes:", votes.length);

  // Add some comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        userId: users[0].id,
        movieId: watchedMovies[0].id,
        text: "Неймовірний фільм! Сюжет просто вражає.",
      },
    }),
    prisma.comment.create({
      data: {
        userId: users[1].id,
        movieId: watchedMovies[0].id,
        text: "Один з найкращих фільмів Нолана.",
      },
    }),
  ]);

  console.log("Created comments:", comments.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
