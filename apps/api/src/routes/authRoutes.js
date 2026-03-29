const express = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const { register, login, refresh, logout } = require('../controllers/authController');
const upload = require('../middlewares/upload');
const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().min(5),
    countryCode: z.string().min(1),
    secondaryPhone: z.string().optional(),
    photo: z.string().optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(0)
  })
});

const tokenSchema = z.object({
  body: z.object({
    token: z.string().min(1)
  })
});

router.post('/register', upload.single('photo'), validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(tokenSchema), refresh);
router.post('/logout', validate(tokenSchema), logout);

module.exports = router;
