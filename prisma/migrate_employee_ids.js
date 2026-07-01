require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting migration of existing employee IDs...");
  const employees = await prisma.employee.findMany();
  
  for (const emp of employees) {
    const originalId = emp.id;
    // Check if ID matches the exact correct format: HSGA/TG/SM00053 or HSGA/TG/GC00053 (5 digits at the end)
    const exactRegex = /^HSGA\/TG\/(SM|GC)\d{5}$/;
    if (exactRegex.test(originalId)) {
      console.log(`Employee "${emp.name}" already has correct ID: ${originalId}`);
      continue;
    }
    
    // Parse digits
    const digitsMatch = originalId.match(/\d+$/);
    if (!digitsMatch) {
      console.log(`Warning: Employee "${emp.name}" has ID "${originalId}" with no trailing digits. Skipping.`);
      continue;
    }
    
    const num = parseInt(digitsMatch[0], 10);
    const isMale = originalId.toLowerCase().includes("sm");
    const prefix = isMale ? "HSGA/TG/SM" : "HSGA/TG/GC";
    const paddedCounter = String(num).padStart(5, "0");
    const newId = prefix + paddedCounter;
    
    console.log(`Migrating "${emp.name}": "${originalId}" -> "${newId}"`);
    
    // Perform migration inside a transaction or delete then insert
    try {
      await prisma.$transaction(async (tx) => {
        // Fetch original to ensure it's still there
        const currentEmp = await tx.employee.findUnique({ where: { id: originalId } });
        if (!currentEmp) return;
        
        // Delete old entry
        await tx.employee.delete({
          where: { id: originalId }
        });
        
        // Create new entry
        await tx.employee.create({
          data: {
            ...currentEmp,
            id: newId
          }
        });
      });
      console.log(`Successfully migrated employee "${emp.name}" to ID: ${newId}`);
    } catch (err) {
      console.error(`Error migrating employee "${emp.name}":`, err);
    }
  }
  console.log("Migration complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
