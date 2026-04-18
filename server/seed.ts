import "dotenv/config";
process.env.DATABASE_URL = "file:./dev.db";

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { db, USERS } from './mockDb.js';

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding SQLite database...');

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // Insert Users
  for (const user of db.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.password || 'senha123',
        role: user.role,
      },
    });
  }

  // Insert Tickets
  for (const ticket of db.tickets) {
    await prisma.ticket.create({
      data: {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        user_id: ticket.user_id,
        assigned_to: ticket.assigned_to,
        created_at: new Date(ticket.created_at),
        updated_at: new Date(ticket.updated_at),
      },
    });
  }

  // Insert Comments
  for (const comment of db.ticket_comments) {
    await prisma.comment.create({
      data: {
        id: comment.id,
        ticket_id: comment.ticket_id,
        user_id: comment.user_id,
        comment: comment.comment,
        created_at: new Date(comment.created_at),
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
