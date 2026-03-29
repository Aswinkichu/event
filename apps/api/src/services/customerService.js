const prisma = require('../config/prisma');
const storageService = require('./storageService');

class CustomerService {
  async getCategories(query) {
    const { search, sortBy, order, page, limit } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [data, total] = await Promise.all([
      prisma.eventCategory.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order }
      }),
      prisma.eventCategory.count({ where })
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOptionsByCategory(categoryId, query) {
    const { search, type, sortBy, order, page, limit } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = { categoryId, isCustom: false };

    
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.customOption.findMany({
        where, skip, take,
        orderBy: { [sortBy]: order }
      }),
      prisma.customOption.count({ where })
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createCustomOption(data) {
    const { categoryId, type, name, price, image } = data;
    
    let imageUrl = null;
    if (image) {
      imageUrl = await storageService.uploadFile(image);
    }

    return prisma.customOption.create({
      data: {
        categoryId,
        type,
        name,
        price,
        imageUrl,
        isCustom: true
      }
    });
  }


  async createBooking(userId, categoryId, selectedOptionsIds, eventDate, numberOfPeople) {
    const options = await prisma.customOption.findMany({
      where: {
        id: { in: selectedOptionsIds }
      }
    });

    const totalPrice = options.reduce((sum, option) => sum + option.price, 0);

    return prisma.booking.create({
      data: {
        userId,
        categoryId,
        totalPrice,
        numberOfPeople,
        eventDate: new Date(eventDate),
        selectedOptions: {
          connect: selectedOptionsIds.map(id => ({ id }))
        }
      }
    });
  }

  async getMyBookings(userId, query) {
    const { sortBy, order, page, limit } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        skip, take,
        orderBy: { [sortBy]: order },
        include: {
          category: { select: { name: true } },
          selectedOptions: { select: { name: true, price: true, type: true } }
        }
      }),
      prisma.booking.count({ where: { userId } })
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new CustomerService();
