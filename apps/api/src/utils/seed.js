const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

const main = async () => {
  console.log('Start comprehensive seeding...');

  try {
    // 1. Clean DB (Order matters due to foreign keys)
    await prisma.booking.deleteMany();
    await prisma.customOption.deleteMany();
    await prisma.eventCategory.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    // 2. Security
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('adminpassword123', 10);

    // 3. Create Admin User
    const admin = await prisma.user.create({
      data: {
        name: 'Agency Admin',
        email: 'admin@eventagency.com',
        password: adminPassword,
        phone: '1234567890',
        countryCode: '+1',
        role: 'ADMIN',
      },
    });
    console.log(`✓ Created admin user: ${admin.email}`);

    // 4. Create Sample Customers
    const customer1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        phone: '9876543210',
        countryCode: '+1',
        role: 'CUSTOMER',
      },
    });

    const customer2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        phone: '5551234567',
        countryCode: '+44',
        role: 'CUSTOMER',
      },
    });
    console.log(`✓ Created 2 sample customers`);

    // 5. Create Categories with images
    const wedding = await prisma.eventCategory.create({ 
      data: { 
        name: 'Wedding', 
        description: 'Make your special day unforgettable.',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'
      }
    });
    const birthday = await prisma.eventCategory.create({ 
      data: { 
        name: 'Birthday', 
        description: 'Celebrate another year of joy.',
        imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800'
      }
    });
    const corporate = await prisma.eventCategory.create({ 
      data: { 
        name: 'Corporate', 
        description: 'Professional events for your business.',
        imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
      }
    });
    console.log(`✓ Created event categories with images`);

    // 6. Create Options & Save IDs for bookings
    const optionsMap = {
      wedding: [],
      birthday: [],
      corporate: []
    };

    const categories = [
      { cat: wedding, key: 'wedding' }, 
      { cat: birthday, key: 'birthday' }, 
      { cat: corporate, key: 'corporate' }
    ];

    const foodImg = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400';
    const decorImg = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400';
    const venueImg = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400';
    const soundImg = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400';

    for (const { cat, key } of categories) {
      // Create Parent Food Options
      const vegParent = await prisma.customOption.create({
        data: { categoryId: cat.id, type: 'FOOD', name: 'Veg Package', price: 500, isDefault: true, subType: 'veg', imageUrl: foodImg }
      });
      const nonVegParent = await prisma.customOption.create({
        data: { categoryId: cat.id, type: 'FOOD', name: 'Non-Veg Package', price: 800, isDefault: false, subType: 'non-veg', imageUrl: foodImg }
      });

      // Create Sub-items for Veg Package
      await prisma.customOption.createMany({
        data: [
          { categoryId: cat.id, parentId: vegParent.id, type: 'FOOD', name: 'Paneer Tikka', price: 150, imageUrl: 'https://images.unsplash.com/photo-1567188040759-fbba1883dbde?w=400' },
          { categoryId: cat.id, parentId: vegParent.id, type: 'FOOD', name: 'Dal Makhani', price: 120, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
          { categoryId: cat.id, parentId: vegParent.id, type: 'FOOD', name: 'Mixed Veg', price: 100, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' }
        ]
      });

      // Create Sub-items for Non-Veg Package
      await prisma.customOption.createMany({
        data: [
          { categoryId: cat.id, parentId: nonVegParent.id, type: 'FOOD', name: 'Chicken Tikka', price: 200, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' },
          { categoryId: cat.id, parentId: nonVegParent.id, type: 'FOOD', name: 'Butter Chicken', price: 250, imageUrl: 'https://images.unsplash.com/photo-1603894584115-f73f2ec8d0ad?w=400' },
          { categoryId: cat.id, parentId: nonVegParent.id, type: 'FOOD', name: 'Mutton Seekh', price: 300, imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400' }
        ]
      });

      await prisma.customOption.createMany({
        data: [
          { categoryId: cat.id, type: 'DECOR', name: 'Standard Floral', price: 10000, isDefault: true, imageUrl: decorImg },
          { categoryId: cat.id, type: 'DECOR', name: 'Modern Theme', price: 15000, isDefault: false, imageUrl: decorImg },
          { categoryId: cat.id, type: 'VENUE', name: 'Banquet Hall', price: 20000, isDefault: true, imageUrl: venueImg },
          { categoryId: cat.id, type: 'VENUE', name: 'Garden Area', price: 25000, isDefault: false, imageUrl: venueImg },
          { categoryId: cat.id, type: 'ADD_ON', name: 'Photography', price: 5000, isDefault: false, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' },
          { categoryId: cat.id, type: 'ADD_ON', name: 'DJ & Sound', price: 3000, isDefault: false, imageUrl: soundImg }
        ]
      });
      // Store the created options for this category to use in bookings
      optionsMap[key] = await prisma.customOption.findMany({ where: { categoryId: cat.id } });
    }

    console.log(`✓ Created custom options for all categories`);

    // 7. Create Sample Bookings
    
    // Booking 1: John Doe - Wedding (Pending)
    const johnOptions = optionsMap.wedding.filter(o => ['Veg Package', 'Standard Floral', 'Banquet Hall'].includes(o.name));
    await prisma.booking.create({
      data: {
        userId: customer1.id,
        categoryId: wedding.id,
        totalPrice: johnOptions.reduce((sum, opt) => sum + opt.price, 0),
        status: 'PENDING',
        eventDate: new Date('2025-06-15T12:00:00Z'),
        selectedOptions: {
          connect: johnOptions.map(opt => ({ id: opt.id }))
        }
      }
    });

    // Booking 2: Jane Smith - Corporate (Confirmed)
    const janeOptions = optionsMap.corporate.filter(o => ['Non-Veg Package', 'Modern Theme', 'Banquet Hall', 'DJ & Sound'].includes(o.name));
    await prisma.booking.create({
      data: {
        userId: customer2.id,
        categoryId: corporate.id,
        totalPrice: janeOptions.reduce((sum, opt) => sum + opt.price, 0),
        status: 'CONFIRMED',
        eventDate: new Date('2024-12-01T09:00:00Z'),
        selectedOptions: {
          connect: janeOptions.map(opt => ({ id: opt.id }))
        }
      }
    });

    // Booking 3: John Doe - Birthday (Completed)
    const johnBdayOptions = optionsMap.birthday.filter(o => ['Non-Veg Package', 'Standard Floral', 'Garden Area'].includes(o.name));
    await prisma.booking.create({
      data: {
        userId: customer1.id,
        categoryId: birthday.id,
        totalPrice: johnBdayOptions.reduce((sum, opt) => sum + opt.price, 0),
        status: 'COMPLETED',
        eventDate: new Date('2023-08-20T18:00:00Z'),
        selectedOptions: {
          connect: johnBdayOptions.map(opt => ({ id: opt.id }))
        }
      }
    });

    console.log(`✓ Created 3 sample bookings (Pending, Confirmed, Completed)`);
    console.log('Seeding finished successfully.');

  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
