import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

const router = express.Router();

const getDepartmentBase = (department) => {
  // Administrative Services departments
  if (department.includes('Administrative Services')) {
    if (department.includes('Personnel Unit')) return 'Administrative Services - Personnel Unit';
    if (department.includes('Records Unit')) return 'Administrative Services - Records Unit';
    if (department.includes('Cash Unit')) return 'Administrative Services - Cash Unit';
    if (department.includes('Property and Supply')) return 'Administrative Services - Property and Supply';
    if (department.includes('Proper')) return 'Administrative Services - Proper';
    return 'Administrative Services';
  }

  // Finance Services departments
  if (department.includes('Finance Services')) {
    if (department.includes('Budget Unit')) return 'Finance Services - Budget Unit';
    if (department.includes('Accounting Unit')) return 'Finance Services - Accounting Unit';
    return 'Finance Services';
  }

  // CID departments
  if (department.includes('Curriculum Implementation Division')) {
    if (department.includes('ALS')) return 'Curriculum Implementation Division (CID) - ALS';
    if (department.includes('Learning Resources')) return 'Curriculum Implementation Division (CID) - Learning Resources';
    if (department.includes('Proper')) return 'Curriculum Implementation Division (CID) - Proper';
    return 'Curriculum Implementation Division (CID)';
  }

  // SGOD departments
  if (department.includes('School Governance and Operations Division')) {
    if (department.includes('Planning and Research Section')) return 'School Governance and Operations Division (SGOD) - Planning and Research Section';
    if (department.includes('Private School')) return 'School Governance and Operations Division (SGOD) - Private School';
    if (department.includes('Human Resource Development')) return 'School Governance and Operations Division (SGOD) - Human Resource Development';
    if (department.includes('Social Mobilization and Networking')) return 'School Governance and Operations Division (SGOD) - Social Mobilization and Networking';
    if (department.includes('School Management Monitoring and Evaluation')) return 'School Governance and Operations Division (SGOD) - School Management Monitoring and Evaluation';
    if (department.includes('School Health Services')) return 'School Governance and Operations Division (SGOD) - School Health Services';
    if (department.includes('Education Facilities')) return 'School Governance and Operations Division (SGOD) - Education Facilities';
    if (department.includes('DRRM')) return 'School Governance and Operations Division (SGOD) - DRRM';
    if (department.includes('YFD')) return 'School Governance and Operations Division (SGOD) - YFD';
    if (department.includes('Main')) return 'School Governance and Operations Division (SGOD) - Main';
    return 'School Governance and Operations Division (SGOD)';
  }

  // Other departments
  if (department.includes('Information and Communications Technology Unit')) return 'Information and Communications Technology Unit';
  if (department.includes('Legal Services Unit')) return 'Legal Services Unit';
  if (department.includes('Office of the Schools Division Superintendent')) return 'Office of the Schools Division Superintendent (OSDS)';
  if (department.includes('Office of the Assistant Schools Division Superintendent')) return 'Office of the Assistant Schools Division Superintendent (OASDS)';

  return department;
};

// Create a new ticket
router.post('/', async (req, res) => {
  try {
    const { 
      name,
      email,
      department,
      dateOfRequest,
      typeOfEquipment,
      modelOfEquipment,
      serialNo,
      specificProblem
    } = req.body;

    const ticket = await prisma.ticket.create({
      data: {
        name,
        email,
        department,
        dateOfRequest: dateOfRequest ? new Date(dateOfRequest) : new Date(),
        typeOfEquipment,
        modelOfEquipment,
        serialNo,
        specificProblem,
        status: 'PENDING',
        userId: 1 // Default admin user ID
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    let tickets;
    if (user.role === 'ADMIN') {
      // Admins can see all tickets
      tickets = await prisma.ticket.findMany({
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

      // Group tickets by department
      const groupedTickets = tickets.reduce((acc, ticket) => {
        const departmentBase = getDepartmentBase(ticket.department);
        if (!acc[departmentBase]) {
          acc[departmentBase] = [];
        }
        acc[departmentBase].push(ticket);
        return acc;
      }, {});

      res.json(groupedTickets);
    } else {
      // Regular users can only see tickets from their department
      const departmentBase = getDepartmentBase(user.department);
      tickets = await prisma.ticket.findMany({
        where: {
          department: {
            contains: departmentBase
          }
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

      // Group tickets by department for the user's department only
      const groupedTickets = {
        [departmentBase]: tickets
      };

      res.json(groupedTickets);
    }
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all tickets (filtered by department for regular users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    let tickets;
    if (user.role === 'ADMIN') {
      // Admins can see all tickets
      tickets = await prisma.ticket.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
              department: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Group tickets by department
      const groupedTickets = tickets.reduce((acc, ticket) => {
        const departmentBase = getDepartmentBase(ticket.department);
        if (!acc[departmentBase]) {
          acc[departmentBase] = [];
        }
        acc[departmentBase].push(ticket);
        return acc;
      }, {});

      res.json(groupedTickets);
    } else {
      // Regular users can only see tickets from their department group
      const departmentBase = getDepartmentBase(user.department);
      tickets = await prisma.ticket.findMany({
        where: {
          department: {
            contains: departmentBase
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              department: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Group tickets by department
      const groupedTickets = tickets.reduce((acc, ticket) => {
        const departmentBase = getDepartmentBase(ticket.department);
        if (!acc[departmentBase]) {
          acc[departmentBase] = [];
        }
        acc[departmentBase].push(ticket);
        return acc;
      }, {});

      res.json(groupedTickets);
    }
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