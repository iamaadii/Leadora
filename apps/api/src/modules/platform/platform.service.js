// platform.service.js
// Phase 10: Platform Super Admin Tenant Management Service

import argon2 from 'argon2';
import { platformRepository } from './platform.repository.js';
import { withTransaction } from '../../config/database.js';
import { AppError } from '../../errors/app-error.js';

export const platformService = {
  /**
   * List organizations with search, status filters, and pagination
   */
  async getOrganizations(user, query) {
    if (user.role !== 'SUPER_ADMIN') {
      throw AppError.forbidden('Only Platform Super Admins can access tenant management.', 'FORBIDDEN');
    }

    return await platformRepository.findOrganizations(query);
  },

  /**
   * Get organization details by ID
   */
  async getOrganizationById(user, orgId) {
    if (user.role !== 'SUPER_ADMIN') {
      throw AppError.forbidden('Only Platform Super Admins can access tenant management.', 'FORBIDDEN');
    }

    const org = await platformRepository.findById(orgId);
    if (!org) {
      throw AppError.notFound('Organization not found', 'ORGANIZATION_NOT_FOUND');
    }

    return org;
  },

  /**
   * Provision new tenant organization and initial Admin user atomically
   */
  async createOrganization(user, data) {
    if (user.role !== 'SUPER_ADMIN') {
      throw AppError.forbidden('Only Platform Super Admins can provision organizations.', 'FORBIDDEN');
    }

    // Check slug uniqueness
    const existingSlug = await platformRepository.findBySlug(data.slug);
    if (existingSlug) {
      throw AppError.conflict(
        `Organization slug "${data.slug}" is already taken. Please choose another slug.`,
        'SLUG_EXISTS',
      );
    }

    const passwordHash = await argon2.hash(data.adminPassword);

    return await withTransaction(async (client) => {
      // 1. Create organization
      const org = await platformRepository.createOrganization(
        {
          name: data.name,
          slug: data.slug,
          email: data.adminEmail,
          phone: data.phone,
          website: data.website,
          address: data.address,
          currency: data.currency,
          timezone: data.timezone,
        },
        client,
      );

      // 2. Create initial Admin user
      const admin = await platformRepository.createAdminUser(
        {
          organization_id: org.id,
          first_name: data.adminFirstName,
          last_name: data.adminLastName,
          email: data.adminEmail,
          password_hash: passwordHash,
        },
        client,
      );

      // 3. Record audit log
      await platformRepository.createAuditLog(
        {
          organization_id: org.id,
          actor_user_id: user.id,
          action: 'ORGANIZATION_PROVISIONED',
          entity_type: 'ORGANIZATION',
          entity_id: org.id,
          new_values: {
            organizationName: org.name,
            slug: org.slug,
            adminEmail: admin.email,
          },
        },
        client,
      );

      return {
        organization: org,
        initialAdmin: {
          id: admin.id,
          name: `${admin.first_name} ${admin.last_name}`,
          email: admin.email,
          role: admin.role,
        },
      };
    });
  },

  /**
   * Suspend or reactivate organization
   */
  async updateOrganizationStatus(user, orgId, isActive) {
    if (user.role !== 'SUPER_ADMIN') {
      throw AppError.forbidden('Only Platform Super Admins can change tenant status.', 'FORBIDDEN');
    }

    const existing = await platformRepository.findById(orgId);
    if (!existing) {
      throw AppError.notFound('Organization not found', 'ORGANIZATION_NOT_FOUND');
    }

    return await withTransaction(async (client) => {
      const updated = await platformRepository.updateStatus(orgId, isActive, client);

      // If suspended, immediately revoke all active refresh tokens for all users in that organization
      let revokedSessionsCount = 0;
      if (!isActive) {
        revokedSessionsCount = await platformRepository.revokeOrganizationSessions(orgId, client);
      }

      await platformRepository.createAuditLog(
        {
          organization_id: orgId,
          actor_user_id: user.id,
          action: isActive ? 'ORGANIZATION_ACTIVATED' : 'ORGANIZATION_SUSPENDED',
          entity_type: 'ORGANIZATION',
          entity_id: orgId,
          old_values: { is_active: existing.is_active },
          new_values: { is_active: isActive, revokedSessionsCount },
        },
        client,
      );

      return {
        ...updated,
        revokedSessionsCount,
      };
    });
  },
};
