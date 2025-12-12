const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users: ${userCount}`);
    
    // Count items
    const itemCount = await prisma.item.count();
    console.log(`📦 Total items: ${itemCount}`);
    
    // Get first item
    if (itemCount > 0) {
      const item = await prisma.item.findFirst({
        include: { user: true }
      });
      console.log('First item:', JSON.stringify(item, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
