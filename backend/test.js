require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const templates = await prisma.$queryRawUnsafe("SELECT * FROM system_templates WHERE name='Client Confirmation' OR name='Internal Lead Alert'");
  console.log(JSON.stringify(templates, null, 2));
}
main().finally(() => prisma.$disconnect());
