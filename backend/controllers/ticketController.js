import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendTicketConfirmation } from '../utils/emailSender.js';

const prisma = new PrismaClient();

// Generate tracking ID
const generateTrackingId = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Send ticket confirmation email using our utility
const sendTicketEmail = async (ticket, trackingId) => {
  try {
    // Get email settings from global app settings or use defaults
    let emailSettings = null;
    if (global.appSettings && global.appSettings.email) {
      emailSettings = global.appSettings.email;
      
      // Explicitly check if notifications are enabled (true)
      // This ensures we don't send if enableNotifications is false or undefined
      if (emailSettings.enableNotifications !== true) {
        return; // Exit early if notifications are not explicitly enabled
      }
      
      // Only send if we have email settings configured
      if (emailSettings.smtpUser && emailSettings.smtpPassword) {
        // Create a pseudo user object from ticket data
        const user = {
          name: ticket.name,
          email: ticket.email
        };

        await sendTicketConfirmation(ticket, user, emailSettings);
      }
    }
  } catch (error) {
    console.error('Error sending ticket email:', error);
    // Don't throw error to prevent blocking ticket creation
  }
};

// Validation schemas for different ticket categories
const troubleshootingSchema = z.object({
  category: z.literal('TROUBLESHOOTING'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  department: z.string().min(1, 'Department is required'),
  typeOfEquipment: z.string().min(1, 'Equipment type is required'),
  modelOfEquipment: z.string().min(1, 'Equipment model is required'),
  serialNo: z.string().min(1, 'Serial number is required'),
  specificProblem: z.string().min(1, 'Problem description is required'),
});

const accountManagementSchema = z.object({
  category: z.literal('ACCOUNT_MANAGEMENT'),
  type: z.enum(['Account Request', 'Password Reset']),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  department: z.string().min(1, 'Department is required'),
  reason: z.string().min(1, 'Reason is required'),
  // Conditional fields based on type
  position: z.string().optional(),
  employeeId: z.string().optional(),
  accountType: z.enum(['email', 'system', 'both']).optional(),
});

const documentUploadSchema = z.object({
  category: z.literal('DOCUMENT_UPLOAD'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  department: z.string().min(1, 'Department is required'),
  documentTitle: z.string().min(1, 'Document title is required'),
  documentType: z.enum(['official', 'report', 'form', 'other']),
  documentDescription: z.string().min(1, 'Document description is required'),
  files: z.string().optional(), // JSON string of file paths
});

// Helper function to format validation errors
const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.path.join('.'),
    message: error.message
  }));
};

// Helper function to send response
const sendResponse = (res, status, success, message, data = null) => {
  return res.status(status).json({
    success,
    message,
    data,
  });
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/documents';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${fileExt}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
}).single('file');

// Create document upload ticket
const createDocumentUploadTicket = async (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: 'File size exceeds the 2MB limit.' 
          });
        }
        return res.status(400).json({ 
          message: `File upload error: ${err.message}` 
        });
      } else if (err) {
        return res.status(400).json({ 
          message: err.message 
        });
      }

      const {
        name,
        email,
        priority,
        location,
        subject,
        message
      } = req.body;

      // Validate required fields
      if (!name || !email || !priority || !location || !subject || !message) {
        return res.status(400).json({ 
          message: 'All fields are required' 
        });
      }

      // Generate tracking ID
      const trackingId = generateTrackingId();

      // Create ticket with file information
      const ticket = await prisma.ticket.create({
        data: {
          category: 'DOCUMENT_UPLOAD',
          name,
          email,
          priority,
          status: 'PENDING',
          trackingId,
          location,
          documentSubject: subject,
          documentMessage: message,
          categorySpecificDetails: {
            type: 'Document Processing',
            details: {
              subject,
              message,
              fileName: req.file ? req.file.filename : null,
              originalFileName: req.file ? req.file.originalname : null,
              fileType: req.file ? req.file.mimetype : null,
              fileSize: req.file ? req.file.size : null,
              filePath: req.file ? req.file.path : null,
              uploadDate: new Date().toISOString()
            }
          }
        }
      });

      // Send confirmation email
      await sendTicketEmail(ticket, trackingId);

      // Return success response
      res.status(201).json({
        message: 'Document upload ticket created successfully',
        ticketId: ticket.id,
        trackingId: ticket.trackingId
      });

    } catch (error) {
      console.error('Error creating document upload ticket:', error);
      res.status(500).json({ 
        message: 'Failed to create document upload ticket' 
      });
    }
  });
};

// Create ticket based on category
const createTicket = async (req, res) => {
  try {
    const { category } = req.body;
    let validationSchema;

    switch (category) {
      case 'TROUBLESHOOTING':
        validationSchema = troubleshootingSchema;
        break;
      case 'ACCOUNT_MANAGEMENT':
        validationSchema = accountManagementSchema;
        break;
      case 'DOCUMENT_UPLOAD':
        validationSchema = documentUploadSchema;
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid ticket category' 
        });
    }

    const validatedData = validationSchema.parse(req.body);
    const trackingId = generateTrackingId();

    const ticket = await prisma.ticket.create({
      data: {
        ...validatedData,
        trackingId,
      },
    });

    // Send confirmation email
    await sendTicketEmail(ticket, trackingId);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticketId: ticket.id,
      trackingId: trackingId
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create ticket'
    });
  }
};

// Get all tickets with filtering and pagination
const getTickets = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category,
      department,
      search 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { specificProblem: { contains: search, mode: 'insensitive' } },
        { documentTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    // For non-admin users, only show their own tickets
    if (req.user && req.user.role !== 'ADMIN') {
      where.email = req.user.email;
    }

    // Get tickets with pagination
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              name: true,
              email: true,
              department: true
            }
          }
        }
      }),
      prisma.ticket.count({ where })
    ]);

    return sendResponse(res, 200, true, 'Tickets retrieved successfully', {
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return sendResponse(res, 500, false, 'Failed to fetch tickets');
  }
};

// Get ticket by ID
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            department: true
          }
        },
        comments: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        updates: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!ticket) {
      return sendResponse(res, 404, false, 'Ticket not found');
    }

    // Check if user has permission to view this ticket
    if (req.user && req.user.role !== 'ADMIN' && ticket.email !== req.user.email) {
      return sendResponse(res, 403, false, 'Access denied');
    }

    // Add category-specific details for better organization
    const ticketWithCategoryDetails = {
      ...ticket,
      categorySpecificDetails: getCategorySpecificDetails(ticket)
    };

    return sendResponse(res, 200, true, 'Ticket retrieved successfully', { ticket: ticketWithCategoryDetails });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return sendResponse(res, 500, false, 'Failed to fetch ticket');
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) }
    });

    if (!ticket) {
      return sendResponse(res, 404, false, 'Ticket not found');
    }

    // Only allow updating certain fields based on category
    const allowedUpdates = [
      'status',
      'priority',
      'completedBy',
      'diagnosis',
      'actionTaken',
      'recommendations',
      'response'
    ];

    // Add category-specific fields
    if (ticket.category === 'TROUBLESHOOTING') {
      allowedUpdates.push('specificProblem', 'typeOfEquipment', 'modelOfEquipment', 'serialNo');
    } else if (ticket.category === 'ACCOUNT_MANAGEMENT') {
      allowedUpdates.push('accountType', 'reason');
    } else if (ticket.category === 'DOCUMENT_UPLOAD') {
      allowedUpdates.push('documentTitle', 'documentType', 'documentDescription', 'files');
    }

    const filteredUpdateData = Object.keys(updateData)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    // Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: filteredUpdateData
    });

    return sendResponse(res, 200, true, 'Ticket updated successfully', { ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return sendResponse(res, 500, false, 'Failed to update ticket');
  }
};

// Delete ticket
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) }
    });

    if (!ticket) {
      return sendResponse(res, 404, false, 'Ticket not found');
    }

    // Only admin can delete tickets
    if (req.user.role !== 'ADMIN') {
      return sendResponse(res, 403, false, 'Access denied');
    }

    await prisma.ticket.delete({
      where: { id: parseInt(id) }
    });

    return sendResponse(res, 200, true, 'Ticket deleted successfully');
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return sendResponse(res, 500, false, 'Failed to delete ticket');
  }
};

const trackTicket = async (req, res) => {
  try {
    const { ticketId, email } = req.body;

    // Validate input
    if (!ticketId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID and email are required'
      });
    }

    // Validate ticket ID is a valid number
    const parsedTicketId = parseInt(ticketId);
    if (isNaN(parsedTicketId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID format'
      });
    }

    // Find the ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        AND: [
          { id: parsedTicketId },
          { email: email }
        ]
      },
      select: {
        id: true,
        category: true,
        status: true,
        priority: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        trackingId: true,
        // Troubleshooting specific fields
        location: true,
        dateOfRequest: true,
        typeOfEquipment: true,
        modelOfEquipment: true,
        serialNo: true,
        specificProblem: true,
        // Account Management specific fields
        accountType: true,
        actionType: true,
        subject: true,
        message: true,
        // Document Upload specific fields
        documentSubject: true,
        documentMessage: true,
        // Category specific details
        categorySpecificDetails: true
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'No ticket found with the provided ID and email'
      });
    }

    // Format dates
    const formattedTicket = {
      ...ticket,
      createdAt: ticket.createdAt.toLocaleString(),
      updatedAt: ticket.updatedAt.toLocaleString()
    };

    // Return ticket details based on category
    const ticketDetails = {
      ...formattedTicket,
      categorySpecificDetails: getCategorySpecificDetails(formattedTicket)
    };

    res.status(200).json({
      success: true,
      ticket: ticketDetails
    });

  } catch (error) {
    console.error('Error tracking ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track ticket'
    });
  }
};

// Helper function to get category-specific details
const getCategorySpecificDetails = (ticket) => {
  switch (ticket.category) {
    case 'TROUBLESHOOTING':
      return {
        type: 'Technical Support',
        details: {
          location: ticket.location,
          dateOfRequest: ticket.dateOfRequest,
          equipment: ticket.typeOfEquipment,
          model: ticket.modelOfEquipment,
          serialNo: ticket.serialNo,
          problem: ticket.specificProblem
        }
      };
    case 'ACCOUNT_MANAGEMENT':
      return {
        type: 'Account Management',
        details: {
          accountType: ticket.accountType,
          actionType: ticket.actionType,
          subject: ticket.subject,
          message: ticket.message
        }
      };
    case 'DOCUMENT_UPLOAD':
      return {
        type: 'Document Processing',
        details: {
          subject: ticket.documentSubject,
          message: ticket.documentMessage
        }
      };
    default:
      return {};
  }
};

const createAccountManagementTicket = async (req, res) => {
  try {
    const {
      name,
      email,
      priority,
      accountType,
      actionType,
      subject,
      message
    } = req.body;

    // Validate required fields
    if (!name || !email || !priority || !accountType || !actionType || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Generate a unique tracking ID
    const trackingId = generateTrackingId();

    // Create the ticket
    const ticket = await prisma.ticket.create({
      data: {
        category: 'ACCOUNT_MANAGEMENT',
        name,
        email,
        priority,
        status: 'PENDING',
        trackingId,
        accountType,
        actionType,
        subject,
        message,
        categorySpecificDetails: {
          accountType,
          actionType
        }
      }
    });

    // Send confirmation email
    await sendTicketEmail(ticket, trackingId);

    res.status(201).json({
      message: 'Account management ticket created successfully',
      ticketId: ticket.id,
      trackingId: ticket.trackingId
    });
  } catch (error) {
    console.error('Error creating account management ticket:', error);
    res.status(500).json({ message: 'Failed to create account management ticket' });
  }
};

// Create troubleshooting ticket
const createTroubleshootingTicket = async (req, res) => {
  try {
    const {
      name,
      email,
      locationType,
      school,
      dateOfRequest,
      typeOfEquipment,
      modelOfEquipment,
      serialNo,
      specificProblem,
      priority
    } = req.body;

    // Validate required fields
    if (!name || !email || !locationType || !dateOfRequest || !typeOfEquipment || !modelOfEquipment || !serialNo || !specificProblem || !priority) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Generate a unique tracking ID
    const trackingId = generateTrackingId();

    // Create the ticket
    const ticket = await prisma.ticket.create({
      data: {
        category: 'TROUBLESHOOTING',
        name,
        email,
        priority,
        status: 'PENDING',
        trackingId,
        location: locationType === 'SCHOOL' ? school : 'SDO - Imus City',
        dateOfRequest: new Date(dateOfRequest),
        typeOfEquipment,
        modelOfEquipment,
        serialNo,
        specificProblem,
        categorySpecificDetails: {
          type: 'Technical Support',
          details: {
            location: locationType === 'SCHOOL' ? school : 'SDO - Imus City',
            dateOfRequest,
            equipment: typeOfEquipment,
            model: modelOfEquipment,
            serialNo,
            problem: specificProblem
          }
        }
      }
    });

    // Send confirmation email
    await sendTicketEmail(ticket, trackingId);

    res.status(201).json({
      message: 'Troubleshooting ticket created successfully',
      ticketId: ticket.id,
      trackingId: ticket.trackingId
    });
  } catch (error) {
    console.error('Error creating troubleshooting ticket:', error);
    res.status(500).json({ message: 'Failed to create troubleshooting ticket' });
  }
};

// Module exports
export {
  createTroubleshootingTicket,
  createAccountManagementTicket,
  createDocumentUploadTicket,
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  trackTicket,
  getCategorySpecificDetails
}; 