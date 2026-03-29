const express = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const {
  getCategories,
  getOptionsByCategory,
  createBooking,
  getMyBookings,
  createCustomOption
} = require('../controllers/customerController');
const upload = require('../middlewares/upload');



const router = express.Router();

const querySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    sortBy: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('100')

  })
});

const optionQuerySchema = querySchema.extend({
  query: querySchema.shape.query.extend({
    type: z.enum(['FOOD', 'DECOR', 'VENUE', 'ADD_ON']).optional()
  })
});

const bookingSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    selectedOptions: z.array(z.string().uuid()),
    eventDate: z.string().datetime(),
    numberOfPeople: z.number().int().positive().optional()
  })
});

const customOptionSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    type: z.enum(['FOOD', 'DECOR', 'VENUE', 'ADD_ON']),
    name: z.string().min(1),
    price: z.preprocess(
      (val) => (typeof val === 'string' ? parseFloat(val) : val),
      z.number().min(0)
    )
  })
});


// Public routes for browsing

router.get('/categories', validate(querySchema), getCategories);
router.get('/categories/:categoryId/options', validate(optionQuerySchema), getOptionsByCategory);

// Protected routes for booking
router.post('/bookings', protect, validate(bookingSchema), createBooking);
router.get('/bookings', protect, validate(querySchema), getMyBookings);
router.post('/options', protect, upload.single('image'), validate(customOptionSchema), createCustomOption);



module.exports = router;
