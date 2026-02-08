import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NGEvent API Documentation',
      version: '1.0.0',
      description: 'REST API documentation for NGEvent - Event Management Platform',
      contact: {
        name: 'NGEvent Team',
        email: 'support@ngevent.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3999',
        description: 'Development server',
      },
      {
        url: 'https://api.ngevent.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            isVerified: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            fullName: {
              type: 'string',
            },
            phone: {
              type: 'string',
            },
            institution: {
              type: 'string',
            },
            position: {
              type: 'string',
            },
            city: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['participant', 'organizer', 'admin'],
            },
            avatarUrl: {
              type: 'string',
            },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            organizerId: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
            },
            location: {
              type: 'string',
            },
            imageUrl: {
              type: 'string',
            },
            capacity: {
              type: 'integer',
            },
            registrationFee: {
              type: 'number',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'cancelled', 'completed'],
            },
            category: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Speaker: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            eventId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            title: {
              type: 'string',
            },
            company: {
              type: 'string',
            },
            bio: {
              type: 'string',
            },
            photoUrl: {
              type: 'string',
            },
            linkedinUrl: {
              type: 'string',
            },
            twitterUrl: {
              type: 'string',
            },
            websiteUrl: {
              type: 'string',
            },
            orderIndex: {
              type: 'integer',
            },
          },
        },
        Registration: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            eventId: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            registrationData: {
              type: 'object',
            },
            status: {
              type: 'string',
              enum: ['registered', 'attended', 'cancelled'],
            },
            registeredAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            eventId: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
            type: {
              type: 'string',
              enum: ['registration', 'event_update', 'reminder', 'general', 'payment'],
            },
            read: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and account management',
      },
      {
        name: 'Events',
        description: 'Event management operations',
      },
      {
        name: 'Profile',
        description: 'User profile management',
      },
      {
        name: 'Registrations',
        description: 'Event registration operations',
      },
      {
        name: 'Upload',
        description: 'File upload operations',
      },
      {
        name: 'Broadcast',
        description: 'Email broadcasting to participants',
      },
      {
        name: 'Notifications',
        description: 'In-app notifications',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
