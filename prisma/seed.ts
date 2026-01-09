import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Skills
  const skillsData = [
    // Construction & Building
    { name: 'Plumbing', category: 'Construction & Building' },
    { name: 'Welding', category: 'Construction & Building' },
    { name: 'Painting', category: 'Construction & Building' },
    { name: 'Carpentry', category: 'Construction & Building' },
    { name: 'Masonry', category: 'Construction & Building' },
    { name: 'Roofing', category: 'Construction & Building' },
    { name: 'Electrical Work', category: 'Construction & Building' },
    { name: 'HVAC', category: 'Construction & Building' },
    { name: 'Drywall Installation', category: 'Construction & Building' },
    { name: 'Flooring', category: 'Construction & Building' },

    // Maintenance & Repair
    { name: 'General Maintenance', category: 'Maintenance & Repair' },
    { name: 'Appliance Repair', category: 'Maintenance & Repair' },
    { name: 'Equipment Repair', category: 'Maintenance & Repair' },
    { name: 'Facility Maintenance', category: 'Maintenance & Repair' },

    // Landscaping & Outdoor
    { name: 'Landscaping', category: 'Landscaping & Outdoor' },
    { name: 'Gardening', category: 'Landscaping & Outdoor' },
    { name: 'Tree Service', category: 'Landscaping & Outdoor' },
    { name: 'Irrigation', category: 'Landscaping & Outdoor' },

    // Automotive
    { name: 'Auto Mechanics', category: 'Automotive' },
    { name: 'Auto Body Repair', category: 'Automotive' },
    { name: 'Auto Painting', category: 'Automotive' },

    // Cleaning & Sanitation
    { name: 'Commercial Cleaning', category: 'Cleaning & Sanitation' },
    { name: 'Deep Cleaning', category: 'Cleaning & Sanitation' },
    { name: 'Janitorial Services', category: 'Cleaning & Sanitation' },

    // Manufacturing
    { name: 'CNC Operation', category: 'Manufacturing' },
    { name: 'Machine Operation', category: 'Manufacturing' },
    { name: 'Assembly', category: 'Manufacturing' },
    { name: 'Quality Control', category: 'Manufacturing' },

    // Other Skilled Trades
    { name: 'Locksmith', category: 'Other Skilled Trades' },
    { name: 'Glass Installation', category: 'Other Skilled Trades' },
    { name: 'Security Installation', category: 'Other Skilled Trades' },
  ];

  console.log('📚 Creating skills...');
  for (const skill of skillsData) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
  console.log(`✅ Created ${skillsData.length} skills`);

  // Create Demo Admin User
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gigit.com' },
    update: {},
    create: {
      email: 'admin@gigit.com',
      passwordHash: hashedPassword,
      userType: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created admin user: admin@gigit.com');

  // Create Demo Worker
  const workerUser = await prisma.user.upsert({
    where: { email: 'worker@example.com' },
    update: {},
    create: {
      email: 'worker@example.com',
      passwordHash: await bcrypt.hash('Worker@123', 10),
      userType: 'WORKER',
      emailVerified: new Date(),
    },
  });

  const plumbingSkill = await prisma.skill.findFirst({
    where: { name: 'Plumbing' },
  });

  const weldingSkill = await prisma.skill.findFirst({
    where: { name: 'Welding' },
  });

  await prisma.workerProfile.upsert({
    where: { userId: workerUser.id },
    update: {},
    create: {
      userId: workerUser.id,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567890',
      bio: 'Experienced plumber with 10+ years in residential and commercial plumbing. Licensed and insured.',
      yearsOfExperience: 10,
      hourlyRate: 75.00,
      availabilityStatus: 'AVAILABLE',
      locationCity: 'New York',
      locationState: 'NY',
      locationCountry: 'USA',
      verificationStatus: 'VERIFIED',
      ratingAverage: 4.8,
      totalJobsCompleted: 127,
      skills: {
        create: [
          {
            skillId: plumbingSkill!.id,
            proficiencyLevel: 'EXPERT',
            yearsOfExperience: 10,
          },
          {
            skillId: weldingSkill!.id,
            proficiencyLevel: 'INTERMEDIATE',
            yearsOfExperience: 5,
          },
        ],
      },
    },
  });
  console.log('✅ Created demo worker: worker@example.com');

  // Create Demo Business
  const businessUser = await prisma.user.upsert({
    where: { email: 'business@example.com' },
    update: {},
    create: {
      email: 'business@example.com',
      passwordHash: await bcrypt.hash('Business@123', 10),
      userType: 'BUSINESS',
      emailVerified: new Date(),
    },
  });

  await prisma.businessProfile.upsert({
    where: { userId: businessUser.id },
    update: {},
    create: {
      userId: businessUser.id,
      companyName: 'BuildCo Construction',
      companyRegistrationNumber: 'REG123456',
      phone: '+1987654321',
      industry: 'Construction',
      companySize: 'MEDIUM',
      website: 'https://buildco.example.com',
      description: 'Leading construction company specializing in commercial and residential projects.',
      locationCity: 'New York',
      locationState: 'NY',
      locationCountry: 'USA',
      verificationStatus: 'VERIFIED',
    },
  });
  console.log('✅ Created demo business: business@example.com');

  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('📝 Demo accounts:');
  console.log('   Admin: admin@gigit.com / Admin@123');
  console.log('   Worker: worker@example.com / Worker@123');
  console.log('   Business: business@example.com / Business@123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
