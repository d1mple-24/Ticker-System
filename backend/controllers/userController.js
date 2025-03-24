import { prisma } from '../models/User.js';
import { z } from 'zod';

// Validation schema
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  role: z.enum(['USER', 'ADMIN']).default('USER')
});

// Response helper
const sendResponse = (res, status, success, message, data = null) => {
  const response = {
    success,
    message,
    ...(data && { data })
  };
  return res.status(status).json(response);
};

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (department) {
      where.department = department;
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    return sendResponse(res, 200, true, 'Users retrieved successfully', {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return sendResponse(res, 500, false, 'Failed to fetch users');
  }
};

// Get user by ID or current user
const getUserById = async (req, res) => {
  try {
    const id = req.params.id || req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'User retrieved successfully', user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return sendResponse(res, 500, false, 'Failed to fetch user');
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = userSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return sendResponse(res, 200, true, 'User updated successfully', user);
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, 'Validation error', {
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    return sendResponse(res, 500, false, 'Failed to update user');
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Prevent deleting the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });
      if (adminCount <= 1) {
        return sendResponse(res, 400, false, 'Cannot delete the last admin user');
      }
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return sendResponse(res, 200, true, 'User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    return sendResponse(res, 500, false, 'Failed to delete user');
  }
};

export {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
}; 