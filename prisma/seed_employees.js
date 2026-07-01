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

  console.log(`Clearing existing Employee records...`);
  // Delete all employees to do a clean feed
  await prisma.employee.deleteMany({});

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split("\t");
    
    if (parts.length < 3) continue; // Skip invalid lines

    const id = (parts[0] || "").trim();
    const name = (parts[1] || "").trim();
    
    if (!id || !name) continue; // Skip blank lines

    // Normalise gender to Male or Female capitalization
    let rawGender = (parts[2] || "Male").trim().toLowerCase();
    let gender = rawGender.charAt(0).toUpperCase() + rawGender.slice(1);
    if (gender !== "Male" && gender !== "Female") {
      gender = "Male";
    }

    const designation = (parts[4] || "Scout Master").trim();
    const phone = (parts[9] || "").trim();
    
    // Check if email exists, otherwise generate a unique dummy email
    let email = (parts[10] || "").trim().toLowerCase();
    if (!email) {
      // Dummy email format
      const safeId = id.toLowerCase().replace(/\//g, "_");
      email = `dummy.${safeId}@hsga.org`;
    }

    const address = (parts[11] || "").trim();
    
    // Set a password matching the dummy format
    const lastFour = phone.length >= 4 ? phone.slice(-4) : "1234";
    const password = `TG@${lastFour}`;

    console.log(`Feeding employee: ${name} (${id}) - email: ${email}`);

    await prisma.employee.create({
      data: {
        id,
        name,
        email,
        gender,
        password,
        designation,
        phone,
        address,
      }
    });
  }

  console.log("Employees seeding complete!");
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
