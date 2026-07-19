// ─────────────────────────────────────────────────────────────────────────────
// Swagger / OpenAPI Documentation
// ─────────────────────────────────────────────────────────────────────────────

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'InfluenceHub API',
    description: 'Enterprise Influencer Marketing Platform — Authentication Module',
    version: '1.0.0',
    contact: {
      name: 'InfluenceHub API Support',
      email: 'api@influencehub.com',
    },
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Development' },
    { url: 'https://api.influencehub.com', description: 'Production' },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication & Authorization' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token — expires in 15 minutes',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          data: { type: 'object', nullable: true, example: null },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: {
            type: 'string',
            enum: [
              'SYSTEM_ADMIN',
              'BUSINESS_OWNER',
              'AGENT',
              'DIAMOND_INFLUENCER',
              'GOLD_INFLUENCER',
              'SILVER_INFLUENCER',
            ],
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
          },
          emailVerified: { type: 'boolean' },
          lastLogin: { type: 'string', format: 'date-time', nullable: true },
          profileImage: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string', minLength: 2, maxLength: 100, example: 'John' },
          lastName: { type: 'string', minLength: 2, maxLength: 100, example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: {
            type: 'string',
            minLength: 8,
            example: 'MySecure@Pass1',
            description: 'Min 8 chars. Must contain uppercase, lowercase, number, and special character',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'MySecure@Pass1' },
        },
      },
      OtpEmailRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string', minLength: 6, maxLength: 6, pattern: '^[0-9]{6}$', example: '123456' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email', 'otp', 'newPassword'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string', minLength: 6, maxLength: 6 },
          newPassword: { type: 'string', minLength: 8 },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'FR01 — Register new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          201: { description: 'Registration successful. Verification email sent.' },
          409: { description: 'Email already exists' },
          422: { description: 'Validation error' },
          429: { description: 'Too many requests' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: { description: 'Login successful. Returns access token + sets refresh cookie.' },
          401: { description: 'Invalid credentials or account locked' },
          403: { description: 'Email not verified' },
          429: { description: 'Too many login attempts' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'FR04 — Logout from current device',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Logged out successfully' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/v1/auth/logout-all': {
      post: {
        tags: ['Auth'],
        summary: 'FR04 — Logout from all devices',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Logged out from all devices' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'FR04 — Refresh access token',
        description: 'Uses refresh token from cookie or request body. Implements token rotation.',
        responses: {
          200: { description: 'New access token returned' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/api/v1/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'FR02 — Request password reset OTP',
        description: 'Always returns 200 regardless of whether email exists (security).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'OTP sent if email exists' },
          429: { description: 'Too many OTP requests' },
        },
      },
    },
    '/api/v1/auth/verify-reset-code': {
      post: {
        tags: ['Auth'],
        summary: 'FR02 — Verify password reset OTP',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OtpEmailRequest' } } },
        },
        responses: {
          200: { description: 'OTP valid' },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'FR02 — Reset password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } },
        },
        responses: {
          200: { description: 'Password reset successfully' },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/api/v1/auth/verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'FR05 — Verify email address',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OtpEmailRequest' } } },
        },
        responses: {
          200: { description: 'Email verified' },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/api/v1/auth/resend-verification': {
      post: {
        tags: ['Auth'],
        summary: 'FR05 — Resend email verification OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'OTP resent if unverified account exists' },
          429: { description: 'Too many requests' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User profile returned' },
          401: { description: 'Not authenticated' },
        },
      },
    },
  },
};
