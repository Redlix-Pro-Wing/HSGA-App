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
  const txtPath = path.join(__dirname, "../txt");
  if (!fs.existsSync(txtPath)) {
    console.error(`Error: File not found at ${txtPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(txtPath, "utf8");
  const lines = content.split("\n").map(l => l.replace("\r", "")).filter(l => l.trim().length > 0);

  const parsedSchools = [];
  for (const line of lines) {
    const parts = line.split("\t").map(p => p.trim());
    if (parts.length < 8) continue;
    
    const state = parts[0];
    const districtCode = parts[1];
    const districtName = parts[2];
    const schoolName = parts[3];
    const collegeSchoolCode = parts[4];
    const year = parts[5];
    const studentUniqueCode = parts[6];
    const schoolCode = parts[7];
    
    // Skip header lines
    if (state === "STATE" && districtCode === "District Code") continue;
    // Skip if schoolName or schoolCode is empty
    if (!schoolName || !schoolCode) continue;
    // Skip placeholder lines with x's
    if (schoolCode.includes("x") || schoolCode.includes("X")) continue;
    
    parsedSchools.push({
      state,
      districtCode,
      district: districtName,
      name: schoolName,
      collegeSchoolCode,
      year,
      studentUniqueCode,
      schoolCode,
    });
  }

  console.log(`Parsed ${parsedSchools.length} schools from txt file.`);

  console.log("Clearing existing School records...");
  await prisma.school.deleteMany({});

  console.log("Inserting new schools into the database...");
  for (const s of parsedSchools) {
    console.log(`Inserting: ${s.name} (${s.schoolCode}) in ${s.district}`);
    await prisma.school.create({
      data: {
        name: s.name,
        district: s.district,
        state: s.state,
        districtCode: s.districtCode,
        collegeSchoolCode: s.collegeSchoolCode,
        year: s.year,
        studentUniqueCode: s.studentUniqueCode,
        schoolCode: s.schoolCode,
        // Optional default properties
        address: "",
        principalName: "",
        principalPhone: "",
        scoutInchargeName: "",
        scoutInchargePhone: "",
        petName: "",
        petPhone: "",
        scoutingStarted: "",
        uniformsDistributed: 0,
        scarfsDistributed: 0,
        scoutMasterName: "",
        praveshikaRegisteredStudents: 0,
        praveshikaExamDate: "",
        komalPadhRegisteredStudents: 0,
        komalPadhExamDate: "",
        dhruvPadhRegisteredStudents: 0,
        dhruvPadhExamDate: "",
        guruPadhRegisteredStudents: 0,
        guruPadhExamDate: "",
        rajyaPuraskar: "",
      }
    });
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
