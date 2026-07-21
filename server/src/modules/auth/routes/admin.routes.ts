// ─────────────────────────────────────────────────────────────────────────────
// Admin Routes — SYSTEM_ADMIN only
// All routes require: authenticate + authorize(SYSTEM_ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

import { Router, Request, Response, NextFunction } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../../../middleware/authenticate';
import { authorize } from '../../../middleware/authorize';
import { generalRateLimiter } from '../../../middleware/rateLimiter';

const router = Router();

// Cast authorize result to standard RequestHandler for router.use()
const requireAdmin = (req: Request, res: Response, next: NextFunction) =>
  authorize('SYSTEM_ADMIN')(req as any, res, next);

// All admin routes require authentication + SYSTEM_ADMIN role
router.use(authenticate);
router.use(requireAdmin);
router.use(generalRateLimiter);

/**
 * @route   GET /api/v1/admin/users
 * @desc    List all users
 * @access  SYSTEM_ADMIN
 */
router.get('/users', adminController.listUsers.bind(adminController));

/**
 * @route   POST /api/v1/admin/users/:id/unlock
 * @desc    Manually unlock a locked/suspended user account
 * @access  SYSTEM_ADMIN
 */
router.post('/users/:id/unlock', adminController.unlockUser.bind(adminController));

export default router;
