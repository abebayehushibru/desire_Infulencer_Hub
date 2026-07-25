// ─────────────────────────────────────────────────────────────────────────────
// Admin Routes — SUPER_ADMIN only
// All routes require: authenticate + authorize(SUPER_ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

import { Router, Request, Response, NextFunction } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../../../middleware/authenticate';
import { authorize } from '../../../middleware/authorize';
import { generalRateLimiter } from '../../../middleware/rateLimiter';

const router = Router();

// Cast authorize result to standard RequestHandler for router.use()
const requireAdmin = (req: Request, res: Response, next: NextFunction) =>
  authorize('SUPER_ADMIN')(req as any, res, next);

// All admin routes require authentication + SUPER_ADMIN role
router.use(authenticate);
router.use(requireAdmin);
router.use(generalRateLimiter);

/**
 * @route   GET /api/v1/admin/users
 * @desc    List all users
 * @access  SUPER_ADMIN
 */
router.get('/users', adminController.listUsers.bind(adminController));

/**
 * @route   POST /api/v1/admin/users/:id/unlock
 * @desc    Manually unlock a locked/suspended user account
 * @access  SUPER_ADMIN
 */
router.post('/users/:id/unlock', adminController.unlockUser.bind(adminController));

export default router;
