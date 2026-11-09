// organization.service.js
// Phase 10: Organization Settings Business Logic

import { organizationRepository } from './organization.repository.js';
import { AppError } from '../../errors/app-error.js';

export const organizationService = {
  /**
   * Get organization settings for authenticated admin
   */
  async getSettings(user) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access tenant organization settings through this endpoint.',
        'FORBIDDEN',
      );
    }

    const org = await organizationRepository.getSettings(user.organizationId);
    if (!org) {
      throw AppError.notFound('Organization not found', 'ORGANIZATION_NOT_FOUND');
    }

    return org;
  },

  /**
   * Update organization settings (Admin only)
   */
  async updateSettings(user, updateData) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access tenant organization settings through this endpoint.',
        'FORBIDDEN',
      );
    }

    if (user.role !== 'ADMIN') {
      throw AppError.forbidden(
        'Only Organization Admins can modify organization settings.',
        'FORBIDDEN',
      );
    }

    const updated = await organizationRepository.updateSettings(
      user.organizationId,
      updateData,
    );

    return updated;
  },
};
