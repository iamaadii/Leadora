// users.controller.js
// Phase 10: User Profile Controller

import { userRepository } from '../../repositories/user.repository.js';
import { updateProfileSchema } from './users.validation.js';

export const usersController = {
  /**
   * PATCH /api/v1/users/profile
   * Allows any authenticated user to update their own permitted personal profile fields
   */
  async updateProfile(req, res, next) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updatedUser = await userRepository.updateProfile(req.user.id, validated);

      return res.status(200).json({
        success: true,
        data: {
          id: updatedUser.id,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          organizationId: updatedUser.organization_id,
        },
        message: 'Profile updated successfully',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/users/profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);
      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          organizationId: user.organization_id,
          organizationName: user.organization_name,
          organizationSlug: user.organization_slug,
          isActive: user.is_active,
          lastLoginAt: user.last_login_at,
          createdAt: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
