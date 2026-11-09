import { dashboardRepository } from './dashboard.repository.js';
import { AppError } from '../../errors/app-error.js';
import { LEAD_STATUSES } from '../leads/leads.constants.js';

export const dashboardService = {
  /**
   * Helper: Parse date range parameters into UTC Date objects and determine previous period
   */
  _parseDateRange(query = {}) {
    const range = query.range || '30d';
    const now = new Date();

    let startDate;
    let endDate = new Date(now.getTime());

    switch (range) {
      case '7d': {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      }
      case '90d': {
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      }
      case 'this_month': {
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        break;
      }
      case 'prev_month': {
        startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
        endDate = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999),
        );
        break;
      }
      case 'custom': {
        startDate = new Date(query.startDate);
        endDate = new Date(query.endDate);
        break;
      }
      case '30d':
      default: {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      }
    }

    const duration = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - duration);
    const prevEndDate = new Date(startDate.getTime());

    // Determine default interval if not passed
    let interval = query.interval;
    if (!interval) {
      const days = duration / (24 * 60 * 60 * 1000);
      if (days <= 32) {
        interval = 'day';
      } else if (days <= 120) {
        interval = 'week';
      } else {
        interval = 'month';
      }
    }

    return {
      range,
      startDate,
      endDate,
      prevStartDate,
      prevEndDate,
      interval,
    };
  },

  /**
   * Helper: Calculate reliable trend percentage
   */
  _calculateTrend(current, previous) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(1));
  },

  /**
   * 1. Get KPI Overview Metrics with period comparisons
   */
  async getOverview(user, query) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization sales dashboards.',
        'FORBIDDEN',
      );
    }

    const dateRange = this._parseDateRange(query);
    const metrics = await dashboardRepository.getOverviewMetrics(
      user.organizationId,
      user.role,
      user.id,
      dateRange,
    );

    return {
      range: dateRange.range,
      period: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
      kpis: {
        totalLeads: metrics.totalLeads,
        newLeadsInPeriod: metrics.newLeadsInPeriod,
        newLeadsTrend: this._calculateTrend(
          metrics.newLeadsInPeriod,
          metrics.newLeadsPrevPeriod,
        ),
        convertedLeads: metrics.convertedLeads,
        lostLeads: metrics.lostLeads,
        overallConversionRate: metrics.overallConversionRate,
        conversionsInPeriod: metrics.conversionsInPeriod,
        conversionsTrend: this._calculateTrend(
          metrics.conversionsInPeriod,
          metrics.conversionsPrevPeriod,
        ),
        pendingFollowups: metrics.pendingFollowups,
        overdueFollowups: metrics.overdueFollowups,
        dueTodayFollowups: metrics.dueTodayFollowups,
        completedFollowupsInPeriod: metrics.completedFollowupsInPeriod,
        completedFollowupsTrend: this._calculateTrend(
          metrics.completedFollowupsInPeriod,
          metrics.completedFollowupsPrevPeriod,
        ),
      },
    };
  },

  /**
   * 2. Lead Pipeline Stages Distribution
   */
  async getLeadPipeline(user) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization sales dashboards.',
        'FORBIDDEN',
      );
    }

    const rows = await dashboardRepository.getLeadPipeline(
      user.organizationId,
      user.role,
      user.id,
    );

    const countsByStatus = {};
    let total = 0;
    for (const r of rows) {
      countsByStatus[r.status] = r.count;
      total += r.count;
    }

    const stages = LEAD_STATUSES.map((status) => {
      const count = countsByStatus[status] || 0;
      const percentage =
        total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
      return {
        status,
        label: status.replace(/_/g, ' '),
        count,
        percentage,
      };
    });

    return {
      totalLeads: total,
      stages,
    };
  },

  /**
   * 3. Lead Creation & Conversion Trends
   */
  async getLeadTrends(user, query) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization sales dashboards.',
        'FORBIDDEN',
      );
    }

    const dateRange = this._parseDateRange(query);
    const [creationRows, conversionRows] = await Promise.all([
      dashboardRepository.getLeadCreationTrends(
        user.organizationId,
        user.role,
        user.id,
        dateRange.interval,
        dateRange.startDate,
        dateRange.endDate,
      ),
      dashboardRepository.getHistoricalConversionTrends(
        user.organizationId,
        user.role,
        user.id,
        dateRange.interval,
        dateRange.startDate,
        dateRange.endDate,
      ),
    ]);

    // Build timeline points map indexed by ISO date string
    const map = new Map();

    for (const row of creationRows) {
      const d = new Date(row.date_bucket).toISOString();
      map.set(d, {
        date: d,
        newLeads: row.new_leads || 0,
        conversions: 0,
      });
    }

    for (const row of conversionRows) {
      const d = new Date(row.date_bucket).toISOString();
      if (map.has(d)) {
        map.get(d).conversions = row.conversions || 0;
      } else {
        map.set(d, {
          date: d,
          newLeads: 0,
          conversions: row.conversions || 0,
        });
      }
    }

    const timeline = Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return {
      interval: dateRange.interval,
      period: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
      timeline,
    };
  },

  /**
   * 4. Follow-up Analytics (Status, Type, Priority)
   */
  async getFollowupAnalytics(user) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization sales dashboards.',
        'FORBIDDEN',
      );
    }

    return await dashboardRepository.getFollowupAnalytics(
      user.organizationId,
      user.role,
      user.id,
    );
  },

  /**
   * 5. Team Performance (Admin sees all; Manager sees managed teams; Employee is forbidden)
   */
  async getTeamPerformance(user) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization sales dashboards.',
        'FORBIDDEN',
      );
    }

    if (user.role === 'EMPLOYEE') {
      throw AppError.forbidden(
        'Employees cannot access team performance metrics.',
        'FORBIDDEN',
      );
    }

    return await dashboardRepository.getTeamPerformance(
      user.organizationId,
      user.role,
      user.id,
    );
  },

  /**
   * 6. Employee Performance (Admin sees all; Manager sees managed team members; Employee is forbidden)
   */
  async getEmployeePerformance(user, query) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization sales dashboards.',
        'FORBIDDEN',
      );
    }

    if (user.role === 'EMPLOYEE') {
      throw AppError.forbidden(
        'Employees cannot access employee performance metrics.',
        'FORBIDDEN',
      );
    }

    const dateRange = this._parseDateRange(query);
    return await dashboardRepository.getEmployeePerformance(
      user.organizationId,
      user.role,
      user.id,
      dateRange,
    );
  },

  /**
   * 7. Recent Activities
   */
  async getRecentActivity(user, query) {
    if (user.role === 'SUPER_ADMIN' || !user.organizationId) {
      throw AppError.forbidden(
        'Platform Super Admins cannot access organization sales dashboards.',
        'FORBIDDEN',
      );
    }

    const limit = query.limit || 10;
    return await dashboardRepository.getRecentActivity(
      user.organizationId,
      user.role,
      user.id,
      limit,
    );
  },
};

