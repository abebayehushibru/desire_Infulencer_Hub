// ─────────────────────────────────────────────────────────────────────────────
// Swagger / OpenAPI Documentation
// Covers: Auth (FR01–FR05) + User Management & Profiles (FR06–FR10)
// ─────────────────────────────────────────────────────────────────────────────

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'InfluenceHub API',
    description: 'Enterprise Influencer Marketing Platform — Full API Documentation',
    version: '2.0.0',
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
    { name: 'Auth',                  description: 'Authentication & Authorization (FR01–FR05)' },
    { name: 'Admin — User Mgmt',     description: 'FR06 — Admin manages Business Owner accounts (SYSTEM_ADMIN only)' },
    { name: 'Admin — Verification',  description: 'FR08 — Admin reviews business verification submissions (SYSTEM_ADMIN only)' },
    { name: 'Admin — Tiers',         description: 'FR06/FR09 — Admin assigns and manages influencer tiers (SYSTEM_ADMIN only)' },
    { name: 'Business Profile',      description: 'FR07 — Business Owner creates and manages their profile' },
    { name: 'Influencer Profile',    description: 'FR09 — Influencer manages their profile and views tier history' },
    { name: 'Agent',                 description: 'FR10 — Agent profile and read-only access to businesses/campaigns' },
    { name: 'Notifications',         description: 'In-app notifications for all authenticated users' },
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

      // ── FR06–FR10 Schemas ─────────────────────────────────────────────────
      CreateBusinessOwnerRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName:    { type: 'string', minLength: 2, maxLength: 100, example: 'Jane' },
          lastName:     { type: 'string', minLength: 2, maxLength: 100, example: 'Doe' },
          email:        { type: 'string', format: 'email', example: 'jane@bizco.com' },
          password:     { type: 'string', minLength: 8, example: 'Secure@Pass1', description: 'Min 8 chars. Must contain uppercase, lowercase, number, and special character' },
          businessName: { type: 'string', minLength: 2, maxLength: 255, example: 'Acme Corp', description: 'Optional: bootstrap a business profile' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          firstName:    { type: 'string', minLength: 2, maxLength: 100 },
          lastName:     { type: 'string', minLength: 2, maxLength: 100 },
          profileImage: { type: 'string', format: 'uri', description: 'Public URL of profile image' },
        },
      },
      AssignTierRequest: {
        type: 'object',
        required: ['tier'],
        properties: {
          tier:   { type: 'string', enum: ['DIAMOND', 'GOLD', 'SILVER'], example: 'GOLD' },
          reason: { type: 'string', maxLength: 500, example: 'Exceeded engagement threshold' },
        },
      },
      SetCommunityLeaderRequest: {
        type: 'object',
        required: ['value'],
        properties: {
          value: { type: 'boolean', example: true, description: 'true = appoint, false = remove. Only DIAMOND influencers can be leaders.' },
        },
      },
      BusinessProfileRequest: {
        type: 'object',
        required: ['businessName'],
        properties: {
          businessName:       { type: 'string', minLength: 2, maxLength: 255, example: 'Acme Corp' },
          businessType:       { type: 'string', maxLength: 100, example: 'E-Commerce' },
          registrationNumber: { type: 'string', maxLength: 100, example: 'REG-12345' },
          taxId:              { type: 'string', maxLength: 100, example: 'TAX-67890' },
          website:            { type: 'string', format: 'uri', example: 'https://acme.com' },
          phone:              { type: 'string', example: '+1 555 123 4567' },
          address:            { type: 'string', maxLength: 500 },
          city:               { type: 'string', maxLength: 100, example: 'New York' },
          country:            { type: 'string', maxLength: 100, example: 'US' },
          description:        { type: 'string', maxLength: 2000 },
        },
      },
      BusinessProfile: {
        type: 'object',
        properties: {
          id:                 { type: 'string', format: 'uuid' },
          userId:             { type: 'string', format: 'uuid' },
          businessName:       { type: 'string' },
          businessType:       { type: 'string', nullable: true },
          registrationNumber: { type: 'string', nullable: true },
          taxId:              { type: 'string', nullable: true },
          website:            { type: 'string', nullable: true },
          phone:              { type: 'string', nullable: true },
          address:            { type: 'string', nullable: true },
          city:               { type: 'string', nullable: true },
          country:            { type: 'string', nullable: true },
          description:        { type: 'string', nullable: true },
          verificationStatus: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          verifiedAt:         { type: 'string', format: 'date-time', nullable: true },
          verifiedBy:         { type: 'string', format: 'uuid', nullable: true },
          rejectionReason:    { type: 'string', nullable: true },
          createdAt:          { type: 'string', format: 'date-time' },
          updatedAt:          { type: 'string', format: 'date-time' },
          documents:          { type: 'array', items: { $ref: '#/components/schemas/BusinessDocument' } },
        },
      },
      BusinessDocument: {
        type: 'object',
        properties: {
          id:               { type: 'string', format: 'uuid' },
          documentType:     { type: 'string', example: 'business_license' },
          fileName:         { type: 'string', example: 'license.pdf' },
          fileSize:         { type: 'integer', description: 'Size in bytes, max 10 MB' },
          mimeType:         { type: 'string', example: 'application/pdf' },
          storagePath:      { type: 'string', description: 'Private storage path — not publicly accessible' },
          uploadedAt:       { type: 'string', format: 'date-time' },
        },
      },
      UploadDocumentRequest: {
        type: 'object',
        required: ['documentType', 'fileName', 'fileSize', 'mimeType', 'storagePath'],
        properties: {
          documentType: { type: 'string', example: 'business_license', description: 'e.g. business_license, tax_certificate' },
          fileName:     { type: 'string', example: 'license.pdf' },
          fileSize:     { type: 'integer', example: 2097152, description: 'File size in bytes. Max 10 MB.' },
          mimeType:     { type: 'string', example: 'application/pdf', description: 'Allowed: application/pdf, image/jpeg, image/png, image/webp, application/msword, .docx' },
          storagePath:  { type: 'string', example: '/private/uploads/uuid-license.pdf', description: 'Private storage path set by the server after the upload' },
        },
      },
      ReviewBusinessRequest: {
        type: 'object',
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['approve', 'reject'], example: 'approve' },
          reason: { type: 'string', minLength: 10, maxLength: 1000, description: 'Mandatory when action is reject', example: 'Submitted documents are expired' },
        },
      },
      InfluencerProfile: {
        type: 'object',
        properties: {
          id:               { type: 'string', format: 'uuid' },
          userId:           { type: 'string', format: 'uuid' },
          currentTier:      { type: 'string', enum: ['DIAMOND', 'GOLD', 'SILVER'] },
          isCommunityLeader:{ type: 'boolean' },
          bio:              { type: 'string', nullable: true },
          niche:            { type: 'string', nullable: true, example: 'fashion' },
          socialHandles:    { type: 'object', nullable: true, additionalProperties: { type: 'string' }, example: { instagram: '@acme', tiktok: '@acme_tt' } },
          followerCount:    { type: 'integer', nullable: true },
          engagementRate:   { type: 'number', nullable: true, description: '0–100 percent' },
          createdAt:        { type: 'string', format: 'date-time' },
          updatedAt:        { type: 'string', format: 'date-time' },
          tierHistory:      { type: 'array', items: { $ref: '#/components/schemas/TierHistory' } },
        },
      },
      InfluencerProfileRequest: {
        type: 'object',
        properties: {
          bio:            { type: 'string', maxLength: 2000 },
          niche:          { type: 'string', maxLength: 100, example: 'fitness' },
          socialHandles:  { type: 'object', additionalProperties: { type: 'string' } },
          followerCount:  { type: 'integer', minimum: 0 },
          engagementRate: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
      TierHistory: {
        type: 'object',
        properties: {
          id:           { type: 'string', format: 'uuid' },
          previousTier: { type: 'string', enum: ['DIAMOND', 'GOLD', 'SILVER'], nullable: true },
          newTier:      { type: 'string', enum: ['DIAMOND', 'GOLD', 'SILVER'] },
          changedBy:    { type: 'string', format: 'uuid', description: 'Admin user ID' },
          reason:       { type: 'string', nullable: true },
          createdAt:    { type: 'string', format: 'date-time' },
        },
      },
      AgentProfile: {
        type: 'object',
        properties: {
          id:         { type: 'string', format: 'uuid' },
          userId:     { type: 'string', format: 'uuid' },
          agencyName: { type: 'string', nullable: true },
          phone:      { type: 'string', nullable: true },
          bio:        { type: 'string', nullable: true },
          createdAt:  { type: 'string', format: 'date-time' },
          updatedAt:  { type: 'string', format: 'date-time' },
        },
      },
      AgentProfileRequest: {
        type: 'object',
        properties: {
          agencyName: { type: 'string', maxLength: 255, example: 'Top Agents LLC' },
          phone:      { type: 'string', example: '+1 555 987 6543' },
          bio:        { type: 'string', maxLength: 2000 },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id:        { type: 'string', format: 'uuid' },
          type:      { type: 'string', enum: ['BUSINESS_APPROVED', 'BUSINESS_REJECTED', 'TIER_CHANGED', 'ACCOUNT_STATUS_CHANGED', 'GENERAL'] },
          title:     { type: 'string' },
          message:   { type: 'string' },
          isRead:    { type: 'boolean' },
          metadata:  { type: 'object', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 20 },
          total:      { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 3 },
          hasNext:    { type: 'boolean' },
          hasPrev:    { type: 'boolean' },
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

    // ─────────────────────────────────────────────────────────────────────────
    // FR06 — Admin User Management
    // ─────────────────────────────────────────────────────────────────────────

    '/api/v1/users/admin/business-owners': {
      post: {
        tags: ['Admin — User Mgmt'],
        summary: 'FR06 — Admin creates a Business Owner account',
        description: 'SYSTEM_ADMIN only. Creates an active Business Owner. Optionally bootstraps a business profile. Account is marked active and email pre-verified.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBusinessOwnerRequest' } } },
        },
        responses: {
          201: { description: 'Business Owner account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
          401: { description: 'Not authenticated' },
          403: { description: 'Insufficient role — SYSTEM_ADMIN required' },
          409: { description: 'Email already in use' },
          422: { description: 'Validation error' },
        },
      },
    },
    '/api/v1/users/admin/users': {
      get: {
        tags: ['Admin — User Mgmt'],
        summary: 'FR06 — List all users with filters and pagination',
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'role',   schema: { type: 'string', enum: ['SYSTEM_ADMIN', 'BUSINESS_OWNER', 'AGENT', 'DIAMOND_INFLUENCER', 'GOLD_INFLUENCER', 'SILVER_INFLUENCER'] }, description: 'Filter by role' },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'] }, description: 'Filter by status' },
          { in: 'query', name: 'search', schema: { type: 'string', maxLength: 100 }, description: 'Full-text search on firstName, lastName, email' },
          { in: 'query', name: 'page',   schema: { type: 'integer', minimum: 1, default: 1 } },
          { in: 'query', name: 'limit',  schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          200: { description: 'Paginated user list', content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data:    { type: 'array', items: { $ref: '#/components/schemas/User' } },
              meta:    { $ref: '#/components/schemas/PaginationMeta' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          } } } },
          401: { description: 'Not authenticated' },
          403: { description: 'Insufficient role' },
          422: { description: 'Validation error on query params' },
        },
      },
    },
    '/api/v1/users/admin/users/{id}': {
      get: {
        tags: ['Admin — User Mgmt'],
        summary: 'FR06 — Get a user with full profile (business, influencer, or agent)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'User with full profile data' },
          401: { description: 'Not authenticated' },
          403: { description: 'Insufficient role' },
          404: { description: 'User not found' },
        },
      },
      patch: {
        tags: ['Admin — User Mgmt'],
        summary: 'FR06 — Update a user\'s basic info',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } },
        },
        responses: {
          200: { description: 'User updated' },
          401: { description: 'Not authenticated' },
          403: { description: 'Insufficient role' },
          404: { description: 'User not found' },
          422: { description: 'Validation error' },
        },
      },
    },
    '/api/v1/users/admin/users/{id}/deactivate': {
      post: {
        tags: ['Admin — User Mgmt'],
        summary: 'FR06 — Deactivate a Business Owner account',
        description: 'Sets user status to INACTIVE. Cannot deactivate SYSTEM_ADMIN accounts.',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'User deactivated' },
          400: { description: 'User already inactive' },
          403: { description: 'Cannot deactivate SYSTEM_ADMIN' },
          404: { description: 'User not found' },
        },
      },
    },
    '/api/v1/users/admin/users/{id}/reactivate': {
      post: {
        tags: ['Admin — User Mgmt'],
        summary: 'FR06 — Reactivate a user account',
        description: 'Sets user status back to ACTIVE. Sends in-app notification to the user.',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'User reactivated. In-app notification sent.' },
          400: { description: 'User already active' },
          404: { description: 'User not found' },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // FR06 / FR09 — Influencer Tier Management (Admin)
    // ─────────────────────────────────────────────────────────────────────────

    '/api/v1/users/admin/users/{id}/assign-tier': {
      post: {
        tags: ['Admin — Tiers'],
        summary: 'FR06/FR09 — Admin assigns or changes an influencer\'s tier',
        description: 'Updates the influencer\'s tier (DIAMOND → GOLD → SILVER). Also updates the user\'s Role. Creates a tier history record for auditing. Sends in-app notification. If demoted from DIAMOND, community leader status is revoked.',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Influencer user ID' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignTierRequest' } } },
        },
        responses: {
          200: { description: 'Tier assigned. Role updated. Notification sent.' },
          400: { description: 'User is not an influencer or already has that tier' },
          401: { description: 'Not authenticated' },
          403: { description: 'Insufficient role' },
          404: { description: 'User not found' },
          422: { description: 'Validation error (invalid tier value)' },
        },
      },
    },
    '/api/v1/users/admin/users/{id}/community-leader': {
      post: {
        tags: ['Admin — Tiers'],
        summary: 'FR09 — Appoint or remove a Community Leader',
        description: 'Only DIAMOND influencers can be appointed as Community Leaders. If value=false, the status is revoked. Non-DIAMOND influencers cannot be appointed.',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SetCommunityLeaderRequest' } } },
        },
        responses: {
          200: { description: 'Community leader status updated' },
          400: { description: 'User is not DIAMOND tier' },
          404: { description: 'Influencer profile not found' },
        },
      },
    },
    '/api/v1/users/admin/users/{id}/tier-history': {
      get: {
        tags: ['Admin — Tiers'],
        summary: 'FR09 — Get tier change history for an influencer',
        description: 'Returns all historical tier changes ordered by most recent first. Used for auditing.',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Tier history returned', content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              success:   { type: 'boolean' },
              message:   { type: 'string' },
              data:      { type: 'object', properties: { history: { type: 'array', items: { $ref: '#/components/schemas/TierHistory' } } } },
              timestamp: { type: 'string', format: 'date-time' },
            },
          } } } },
          404: { description: 'Influencer profile not found' },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // FR08 — Business Verification (Admin)
    // ─────────────────────────────────────────────────────────────────────────

    '/api/v1/users/admin/businesses': {
      get: {
        tags: ['Admin — Verification'],
        summary: 'FR08 — List business profiles (filter by verification status)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] }, description: 'Filter by verification status. Omit to return all.' },
        ],
        responses: {
          200: { description: 'Business profiles returned with documents and user data' },
          401: { description: 'Not authenticated' },
          403: { description: 'Insufficient role' },
        },
      },
    },
    '/api/v1/users/admin/businesses/{id}/review': {
      post: {
        tags: ['Admin — Verification'],
        summary: 'FR08 — Approve or reject a business verification submission',
        description: 'On approval: sets verificationStatus=APPROVED, activates user account, sends email + in-app notification. On rejection: sets verificationStatus=REJECTED, records reason, sends email + in-app notification. Rejection reason is mandatory.',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'BusinessProfile ID' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewBusinessRequest' } } },
        },
        responses: {
          200: { description: 'Business reviewed. Email and in-app notification sent.' },
          400: { description: 'Business already reviewed, or rejection reason missing' },
          401: { description: 'Not authenticated' },
          403: { description: 'Insufficient role' },
          404: { description: 'Business profile not found' },
          422: { description: 'Validation error' },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // FR07 — Business Owner Profile
    // ─────────────────────────────────────────────────────────────────────────

    '/api/v1/users/business/profile': {
      post: {
        tags: ['Business Profile'],
        summary: 'FR07 — Create business profile (Business Owner)',
        description: 'BUSINESS_OWNER only. One profile per account. After creation, user status is set to PENDING_VERIFICATION until an admin approves.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BusinessProfileRequest' } } },
        },
        responses: {
          201: { description: 'Business profile created. Status: PENDING_VERIFICATION.' },
          401: { description: 'Not authenticated' },
          403: { description: 'Only BUSINESS_OWNER can create a business profile' },
          409: { description: 'Business profile already exists for this account' },
          422: { description: 'Validation error' },
        },
      },
      get: {
        tags: ['Business Profile'],
        summary: 'FR07 — Get own business profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Business profile with documents', content: { 'application/json': { schema: { $ref: '#/components/schemas/BusinessProfile' } } } },
          401: { description: 'Not authenticated' },
          403: { description: 'Only BUSINESS_OWNER or SYSTEM_ADMIN can access this' },
          404: { description: 'Business profile not found' },
        },
      },
      patch: {
        tags: ['Business Profile'],
        summary: 'FR07 — Update own business profile',
        description: 'If currently APPROVED, updating re-submits the profile to PENDING for re-review.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BusinessProfileRequest' } } },
        },
        responses: {
          200: { description: 'Business profile updated. If was APPROVED, now PENDING re-review.' },
          401: { description: 'Not authenticated' },
          403: { description: 'Only BUSINESS_OWNER can update their profile' },
          404: { description: 'Business profile not found' },
        },
      },
    },
    '/api/v1/users/business/documents': {
      post: {
        tags: ['Business Profile'],
        summary: 'FR07 — Upload a business verification document (metadata)',
        description: 'Stores document metadata (path, type, size, MIME). Actual file upload is handled by a separate storage endpoint. Allowed MIME types: PDF, JPEG, PNG, WEBP, DOC, DOCX. Max size: 10 MB.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadDocumentRequest' } } },
        },
        responses: {
          201: { description: 'Document record created in private storage' },
          400: { description: 'Disallowed MIME type or file exceeds 10 MB' },
          401: { description: 'Not authenticated' },
          403: { description: 'Only BUSINESS_OWNER can upload documents' },
          404: { description: 'Business profile not found — create it first' },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // FR09 — Influencer Profile
    // ─────────────────────────────────────────────────────────────────────────

    '/api/v1/users/influencer/profile': {
      post: {
        tags: ['Influencer Profile'],
        summary: 'FR09 — Create influencer profile',
        description: 'All influencer tiers (DIAMOND, GOLD, SILVER). One profile per account.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/InfluencerProfileRequest' } } },
        },
        responses: {
          201: { description: 'Influencer profile created' },
          401: { description: 'Not authenticated' },
          403: { description: 'Only influencer roles can create influencer profiles' },
          409: { description: 'Influencer profile already exists' },
        },
      },
      get: {
        tags: ['Influencer Profile'],
        summary: 'FR09 — Get own influencer profile with tier history',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Influencer profile with last 10 tier changes', content: { 'application/json': { schema: { $ref: '#/components/schemas/InfluencerProfile' } } } },
          401: { description: 'Not authenticated' },
          403: { description: 'Influencer role required' },
          404: { description: 'Influencer profile not found' },
        },
      },
      patch: {
        tags: ['Influencer Profile'],
        summary: 'FR09 — Update own influencer profile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/InfluencerProfileRequest' } } },
        },
        responses: {
          200: { description: 'Influencer profile updated' },
          401: { description: 'Not authenticated' },
          403: { description: 'Influencer role required' },
          404: { description: 'Influencer profile not found' },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // FR10 — Agent
    // ─────────────────────────────────────────────────────────────────────────

    '/api/v1/users/agent/profile': {
      post: {
        tags: ['Agent'],
        summary: 'FR10 — Create agent profile',
        description: 'AGENT role only. One profile per account.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AgentProfileRequest' } } },
        },
        responses: {
          201: { description: 'Agent profile created' },
          401: { description: 'Not authenticated' },
          403: { description: 'Only AGENT role can create agent profiles' },
          409: { description: 'Agent profile already exists' },
        },
      },
      get: {
        tags: ['Agent'],
        summary: 'FR10 — Get own agent profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Agent profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/AgentProfile' } } } },
          401: { description: 'Not authenticated' },
          403: { description: 'AGENT role required' },
          404: { description: 'Agent profile not found' },
        },
      },
      patch: {
        tags: ['Agent'],
        summary: 'FR10 — Update own agent profile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AgentProfileRequest' } } },
        },
        responses: {
          200: { description: 'Agent profile updated' },
          401: { description: 'Not authenticated' },
          403: { description: 'AGENT role required' },
          404: { description: 'Agent profile not found' },
        },
      },
    },
    '/api/v1/users/agent/businesses': {
      get: {
        tags: ['Agent'],
        summary: 'FR10 — Agent views all businesses (read-only)',
        description: 'Agents can view businesses to assist with onboarding. No modification rights. Also accessible by SYSTEM_ADMIN.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] }, description: 'Filter by verification status' },
        ],
        responses: {
          200: { description: 'Business list returned (read-only)' },
          401: { description: 'Not authenticated' },
          403: { description: 'AGENT or SYSTEM_ADMIN role required' },
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Notifications
    // ─────────────────────────────────────────────────────────────────────────

    '/api/v1/users/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get all notifications for current user',
        description: 'Returns up to 50 most recent notifications, ordered newest first.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Notification list', content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              success:   { type: 'boolean' },
              message:   { type: 'string' },
              data:      { type: 'object', properties: { notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } },
              timestamp: { type: 'string', format: 'date-time' },
            },
          } } } },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/v1/users/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'All notifications marked as read' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/api/v1/users/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark a single notification as read',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Notification marked as read' },
          401: { description: 'Not authenticated' },
        },
      },
    },
  },
};
