import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Only allow STUDENT or TEACHER on self-registration; ADMIN must be set manually
    const allowedRoles = ['STUDENT', 'TEACHER'];
    const userRole = allowedRoles.includes(role?.toUpperCase()) ? role.toUpperCase() : 'STUDENT';

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: userRole },
      select: { id: true, name: true, email: true, role: true, xpPoints: true, streak: true, createdAt: true },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update streak logic
    const now = new Date();
    const lastLogin = user.lastLogin;
    let newStreak = user.streak;

    if (lastLogin) {
      const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1; // Consecutive day
      } else if (diffDays > 1) {
        newStreak = 1; // Streak broken
      }
    } else {
      newStreak = 1;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: now, streak: newStreak },
      select: { id: true, name: true, email: true, role: true, xpPoints: true, streak: true },
    });

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: updatedUser, token },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        xpPoints: true, streak: true, createdAt: true,
        enrollments: {
          where: { paymentStatus: 'ACTIVE' },
          include: {
            course: { select: { id: true, title: true, subject: true, monthlyPrice: true } },
          },
        },
      },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
