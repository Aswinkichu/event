const prisma = require('../config/prisma');
const notificationService = require('./notificationService');

class AdminService {
  // Categories
  async createCategory(data) {
    return prisma.eventCategory.create({ data });
  }
  async updateCategory(id, data) {
    return prisma.eventCategory.update({ where: { id }, data });
  }
  async deleteCategory(id) {
    return prisma.eventCategory.delete({ where: { id } });
  }

  // Options
  async createOption(data) {
    return prisma.customOption.create({ data });
  }
  async updateOption(id, data) {
    return prisma.customOption.update({ where: { id }, data });
  }
  async deleteOption(id) {
    return prisma.customOption.delete({ where: { id } });
  }

  // Bookings
  async getAllBookings(query) {
    const { search, status, sortBy, order, page, limit } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {};
    if (status) where.status = status;
    
    // Search by User Email or Category Name
    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { category: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where, skip, take,
        orderBy: { [sortBy]: order },
        include: {
          user: { select: { email: true, name: true } },
          category: { select: { name: true } },
          selectedOptions: true
        }
      }),
      prisma.booking.count({ where })
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getBookingById(id) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true, phone: true } },
        category: { select: { name: true, imageUrl: true } },
        selectedOptions: true
      }
    });
  }

   async updateBookingStatus(id, status) {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { user: true, category: true }
    });

    // Notify Customer
    const title = `Booking ${status}`;
    const message = `Your booking for ${booking.category.name} on ${new Date(booking.eventDate).toLocaleDateString()} has been ${status.toLowerCase()}.`;
    await notificationService.createNotification(booking.userId, title, message, {
      status,
      categoryName: booking.category.name,
      eventDate: booking.eventDate,
    });

    return booking;
  }

  async deleteBooking(id) {
    const booking = await prisma.booking.delete({
      where: { id },
      include: { user: true, category: true }
    });

    // Notify Customer
    const title = `Booking Deleted`;
    const message = `Your booking for ${booking.category.name} on ${new Date(booking.eventDate).toLocaleDateString()} has been deleted by an administrator.`;
    await notificationService.createNotification(booking.userId, title, message, {
      status: 'CANCELLED',
      categoryName: booking.category.name,
      eventDate: booking.eventDate,
    });

    return booking;
  }
}

module.exports = new AdminService();
