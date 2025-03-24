import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const admin = async (req, res, next) => {
  try {
    // User should be attached to req by the auth middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 