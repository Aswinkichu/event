const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

class AuthService {
  async register(data) {
    const { name, email, password, phone, countryCode, secondaryPhone, photo } = data;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        countryCode,
        secondaryPhone,
        photo,
        role: 'CUSTOMER'
      }
    });

    return { 
      id: user.id, name: user.name, email: user.email, 
      phone: user.phone, role: user.role 
    };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt
      }
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken
    };
  }

  async refresh(token) {
    const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token } });
      throw new Error('Refresh token expired');
    }

    const accessToken = generateAccessToken(storedToken.userId);
    return { accessToken };
  }

  async logout(token) {
    await prisma.refreshToken.delete({ where: { token } });
  }
}

module.exports = new AuthService();
