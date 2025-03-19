import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import prisma from '../prisma.js';

const router = express.Router();

// Create a new ticket
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { deviceType, problem: description, contactNumber } = req.body;
    const ticket = await prisma.ticket.create({
      data: {
        title: `${deviceType} Issue`,
        description,
        deviceType,
        status: 'OPEN',
        priority: 'MEDIUM',
        department: req.user.department,
        userId: req.user.userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true
          }
        }
      }
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's tickets
router.get('/my-tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all tickets (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a single ticket
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user is admin or the ticket requester
    if (req.user.role !== 'ADMIN' && ticket.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a ticket (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, priority, response } = req.body;
    const ticket = await prisma.ticket.update({
      where: { id: parseInt(req.params.id) },
      data: {
        status,
        priority,
        response,
        updatedAt: new Date(),
      },
    });
    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a ticket (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.ticket.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 