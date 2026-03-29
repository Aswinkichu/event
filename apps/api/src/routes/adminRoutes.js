const express = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  createCategory, updateCategory, deleteCategory,
  createOption, updateOption, deleteOption,
  getAllBookings, updateBookingStatus, getBookingById
} = require('../controllers/adminController');


const router = express.Router();

// Validation Schemas
const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string(),
    // imageUrl is handled via req.file, but can also be passed as string
    imageUrl: z.string().optional()
  })
});

const optionSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    type: z.enum(['FOOD', 'DECOR', 'VENUE', 'ADD_ON']),
    name: z.string().min(1),
    description: z.string().optional(),
    // Allow price and isDefault to be strings (from form-data)
    price: z.union([z.number(), z.string().transform(Number)]).default(0),
    isDefault: z.union([z.boolean(), z.string().transform(val => val === 'true')]).default(false),
    subType: z.string().optional(),
    imageUrl: z.string().optional(),
    parentId: z.string().uuid().optional()
  })
});


const statusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
  })
});

const querySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('100')

  })
});

// All admin routes are protected and require admin role
router.use(protect);
router.use(authorize('ADMIN')); // Updated from lowercase 'admin' for Prisma Enum

// Categories
router.post('/categories', upload.single('image'), validate(categorySchema), createCategory);
router.put('/categories/:id', upload.single('image'), validate(categorySchema), updateCategory);
router.delete('/categories/:id', deleteCategory);

// Options
router.post('/options', upload.single('image'), validate(optionSchema), createOption);
router.put('/options/:id', upload.single('image'), validate(optionSchema), updateOption);
router.delete('/options/:id', deleteOption);

// Bookings
router.get('/bookings', validate(querySchema), getAllBookings);
router.get('/bookings/:id', getBookingById);
router.patch('/bookings/:id/status', validate(statusSchema), updateBookingStatus);


module.exports = router;
