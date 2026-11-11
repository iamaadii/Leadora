import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  Building2,
  Plus,
  Search,
  Power,
  PowerOff,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  usePlatformOrganizations,
  useProvisionOrganization,
  useUpdateOrganizationStatus,
} from '../features/platform/hooks/usePlatform.js';

export function PlatformOrganizationsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedOrgId, setExpandedOrgId] = useState(null);

  const { data, isLoading, error } = usePlatformOrganizations({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit: 15,
  });

  const provisionMutation = useProvisionOrganization();
  const statusMutation = useUpdateOrganizationStatus();

  // Modal state
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formAdminFirstName, setFormAdminFirstName] = useState('');
  const [formAdminLastName, setFormAdminLastName] = useState('');
  const [formAdminEmail, setFormAdminEmail] = useState('');
  const [formAdminPassword, setFormAdminPassword] = useState('');
  const [formError, setFormError] = useState(null);

  // Status toggle confirmation
  const [targetOrg, setTargetOrg] = useState(null);
  const [targetNewStatus, setTargetNewStatus] = useState(null);

  const handleNameChange = (val) => {
    setFormName(val);
    if (!formSlug || formSlug === slugify(formName)) {
      setFormSlug(slugify(val));
    }
  };

  const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const resetProvisionForm = () => {
    setFormName('');
    setFormSlug('');
    setFormAdminFirstName('');
    setFormAdminLastName('');
    setFormAdminEmail('');
    setFormAdminPassword('');
    setFormError(null);
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formSlug.trim() || !formAdminEmail.trim() || !formAdminPassword || !formAdminFirstName.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (formAdminPassword.length < 8) {
      setFormError('Initial administrator password must be at least 8 characters long.');
      return;
    }

    try {
      await provisionMutation.mutateAsync({
        name: formName.trim(),
        slug: formSlug.trim().toLowerCase(),
        adminFirstName: formAdminFirstName.trim(),
        adminLastName: formAdminLastName.trim() || undefined,
        adminEmail: formAdminEmail.trim().toLowerCase(),
        adminPassword: formAdminPassword,
      });

      toast.success(`Organization "${formName.trim()}" provisioned`);
      setIsProvisionOpen(false);
      resetProvisionForm();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to provision organization';
      setFormError(msg);
      toast.error(msg);
    }
  };

  const handleStatusToggle = (org) => {
    const nextStatus = org.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setTargetOrg(org);
    setTargetNewStatus(nextStatus);
  };

  const confirmStatusChange = async () => {
    if (!targetOrg || !targetNewStatus) return;

    try {
      await statusMutation.mutateAsync({
        id: targetOrg.id,
        status: targetNewStatus,
      });

      toast.success(`Organization "${targetOrg.name}" ${targetNewStatus.toLowerCase()}`);
      setTargetOrg(null);
      setTargetNewStatus(null);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to update organization status';
      toast.error(msg);
    }
  };

  const organizations = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 15, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Organizations"
        description="Provision, monitor, and govern multi-tenant organizations across the system."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Organizations' },
        ]}
        actions={
          <Button
            size="sm"
            leftIcon={Plus}
            onClick={() => {
              resetProvisionForm();
              setIsProvisionOpen(true);
            }}
          >
            Provision Organization
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search by organization name or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={Search}
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-44"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </Select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Loading tenant organizations...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm">
            Failed to load platform organizations.
          </div>
        ) : organizations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Building2}
              title="No organizations found"
              description="No tenant organizations match the current search or status filter."
            />
          </div>
        ) : (
          <>
            {/* Mobile View: Concise Summary Cards with Progressive Disclosure */}
            <div className="sm:hidden divide-y divide-slate-100">
              {organizations.map((org) => {
                const isActive = org.status === 'ACTIVE';
                const isExpanded = expandedOrgId === org.id;

                return (
                  <div key={org.id} className="p-4 space-y-3">
                    <div
                      onClick={() => setExpandedOrgId(isExpanded ? null : org.id)}
                      className="flex items-center justify-between cursor-pointer gap-2"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-blue-100/60">
                          {org.name?.[0] || 'O'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {org.name}
                          </h4>
                          <span className="text-xs font-mono text-slate-500">
                            @{org.slug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <Badge
                          variant={isActive ? 'success' : 'danger'}
                          size="xs"
                          dot
                        >
                          {org.status}
                        </Badge>
                        <button
                          type="button"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Progressive Disclosure: Revealed on Click */}
                    {isExpanded && (
                      <div className="pt-2.5 pb-1 border-t border-slate-100 space-y-3 text-xs animate-in fade-in duration-150">
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                              Currency
                            </span>
                            <span className="font-bold text-slate-800">
                              {org.currency || 'USD'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                              Timezone
                            </span>
                            <span className="font-medium text-slate-700 truncate block">
                              {org.timezone || 'America/New_York'}
                            </span>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                              Provisioned On
                            </span>
                            <span className="text-slate-600 font-medium">
                              {org.created_at ? new Date(org.created_at).toLocaleDateString() : '—'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-1">
                          <Button
                            variant={isActive ? 'ghost' : 'outline'}
                            size="sm"
                            leftIcon={isActive ? PowerOff : Power}
                            className={`w-full justify-center ${
                              isActive
                                ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200'
                                : 'text-emerald-600 hover:text-emerald-700'
                            }`}
                            onClick={() => handleStatusToggle(org)}
                          >
                            {isActive ? 'Suspend Organization' : 'Reactivate Organization'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Slug (Tenant ID)</th>
                    <th className="py-3 px-4">Currency / Timezone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {organizations.map((org) => {
                    const isActive = org.status === 'ACTIVE';
                    return (
                      <tr key={org.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {org.name?.[0] || 'O'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {org.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          @{org.slug}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="font-semibold text-slate-800">{org.currency || 'USD'}</span>
                          <span className="text-slate-400 text-[11px] block">{org.timezone || 'America/New_York'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={isActive ? 'success' : 'danger'}
                            size="sm"
                            dot
                          >
                            {org.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {org.created_at ? new Date(org.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant={isActive ? 'ghost' : 'outline'}
                            size="xs"
                            leftIcon={isActive ? PowerOff : Power}
                            className={isActive ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50' : 'text-emerald-600 hover:text-emerald-700'}
                            onClick={() => handleStatusToggle(org)}
                          >
                            {isActive ? 'Suspend' : 'Reactivate'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} organizations)
            </span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="xs"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Provision New Organization Modal */}
      <Modal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        title="Provision New Organization"
        description="Creates a new isolated tenant database record and registers its initial Administrator account."
        size="lg"
      >
        <form onSubmit={handleProvisionSubmit} className="space-y-4 py-2">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-3 pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tenant Company Identity
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Organization Name"
                placeholder="e.g. Apex Global Logistics"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
              <Input
                label="Organization Slug"
                placeholder="e.g. apex-global"
                value={formSlug}
                onChange={(e) => setFormSlug(slugify(e.target.value))}
                helperText="Tenant key used in login (lowercase alphanumeric and hyphens)"
                required
              />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Initial Administrator Account
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Admin First Name"
                placeholder="First name"
                value={formAdminFirstName}
                onChange={(e) => setFormAdminFirstName(e.target.value)}
                required
              />
              <Input
                label="Admin Last Name"
                placeholder="Last name"
                value={formAdminLastName}
                onChange={(e) => setFormAdminLastName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Admin Email Address"
                type="email"
                placeholder="admin@tenant.com"
                value={formAdminEmail}
                onChange={(e) => setFormAdminEmail(e.target.value)}
                required
              />
              <Input
                label="Initial Password"
                type="password"
                placeholder="At least 8 characters"
                value={formAdminPassword}
                onChange={(e) => setFormAdminPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsProvisionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              leftIcon={Building2}
              isLoading={provisionMutation.isPending}
            >
              Provision Organization
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Suspend / Reactivate */}
      <ConfirmationDialog
        isOpen={!!targetOrg}
        onClose={() => setTargetOrg(null)}
        onConfirm={confirmStatusChange}
        title={targetNewStatus === 'SUSPENDED' ? 'Suspend Organization?' : 'Reactivate Organization?'}
        description={
          targetNewStatus === 'SUSPENDED'
            ? `Are you sure you want to suspend "${targetOrg?.name}"? All active user sessions and refresh tokens for this tenant will be immediately revoked, preventing user login.`
            : `Are you sure you want to reactivate "${targetOrg?.name}"? Users belonging to this organization will be permitted to log in again.`
        }
        confirmText={targetNewStatus === 'SUSPENDED' ? 'Suspend Organization' : 'Reactivate Organization'}
        variant={targetNewStatus === 'SUSPENDED' ? 'danger' : 'primary'}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
}
