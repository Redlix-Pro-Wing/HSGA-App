const fs = require("fs");
const path = require("path");

// Load .env variables manually to be safe and robust
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/"/g, "").replace(/'/g, "");
      process.env[key] = val;
    }
  });
}

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const filepath = path.join(__dirname, "txt");
  const content = fs.readFileSync(filepath, "utf8");
  const lines = content.split("\n").map(l => l.replace("\r", "")).filter(l => l.trim().length > 0);

  // Line 0 is Monday Tuesday...
  // Line 1 is 8:30-10:30 ...
  // Data starts at line 2.
  const dataLines = lines.slice(2);
  const employeeNames = ["G.ROHITH", "T.VISHNU", "MANI KUMAR", "PRASADH", "RAVINDER"];

  console.log(`Clearing existing TimeTable entries...`);
  await prisma.timeTable.deleteMany({});

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const parts = line.split("\t");
    
    // Pad parts to 25 elements if needed
    // The last element is working hours
    const workingHoursVal = parts[parts.length - 1];
    const workingHours = parseInt(workingHoursVal, 10) || 0;
    
    // We need 24 slots before working hours
    const slots = [];
    for (let s = 0; s < 24; s++) {
      if (s < parts.length - 1) {
        let val = parts[s].trim();
        if (val === "" || val.toLowerCase() === "free") {
          slots.push("Free");
        } else {
          slots.push(val);
        }
      } else {
        slots.push("Free");
      }
    }

    const employeeName = employeeNames[i] || `Scout Master ${i + 1}`;

    console.log(`Inserting timetable for ${employeeName}...`);
    await prisma.timeTable.create({
      data: {
        employeeName,
        monday_1: slots[0],
        monday_2: slots[1],
        monday_3: slots[2],
        monday_4: slots[3],
        tuesday_1: slots[4],
        tuesday_2: slots[5],
        tuesday_3: slots[6],
        tuesday_4: slots[7],
        wednesday_1: slots[8],
        wednesday_2: slots[9],
        wednesday_3: slots[10],
        wednesday_4: slots[11],
        thursday_1: slots[12],
        thursday_2: slots[13],
        thursday_3: slots[14],
        thursday_4: slots[15],
        friday_1: slots[16],
        friday_2: slots[17],
        friday_3: slots[18],
        friday_4: slots[19],
        saturday_1: slots[20],
        saturday_2: slots[21],
        saturday_3: slots[22],
        saturday_4: slots[23],
        workingHours,
      }
    });
  }

  console.log("TimeTable seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
