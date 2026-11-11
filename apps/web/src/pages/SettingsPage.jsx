import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Building, Save, Shield, AlertTriangle } from 'lucide-react';
import {
  useOrganizationSettings,
  useUpdateOrganizationSettings,
} from '../features/organization/hooks/useOrganization.js';

export function SettingsPage() {
  const { user, refreshUser, updateOrganizationSettings } = useAuth();
  const { toast } = useToast();

  const userRole = user?.role || 'EMPLOYEE';
  const isAdmin = userRole === 'ADMIN';

  const { data, isLoading, error } = useOrganizationSettings({
    enabled: isAdmin,
  });

  const updateMutation = useUpdateOrganizationSettings();

  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('America/New_York');

  useEffect(() => {
    if (data?.data) {
      setCompanyName(data.data.name || '');
      setSlug(data.data.slug || '');
      setCurrency(data.data.currency || 'USD');
      setTimezone(data.data.timezone || 'America/New_York');
    }
  }, [data]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        name: companyName.trim(),
        currency,
        timezone,
      });
      toast.success('Settings saved');
      if (updateOrganizationSettings) {
        updateOrganizationSettings({
          currency,
          timezone,
          name: companyName.trim(),
        });
      }
      if (refreshUser) {
        refreshUser();
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to save settings';
      toast.error(msg);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Organization Settings"
          description="Configure company identity and regional defaults."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings' },
          ]}
        />
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600">
            <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Administrator Access Required</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tenant organization settings and business localization defaults can only be modified
              by an organization Administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Settings"
        description="Configure your company identity, regional localization, and business defaults."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-3xl">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Loading organization configuration...
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            Failed to load organization settings.
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Company Information</h3>
                <p className="text-xs text-slate-500">
                  Tenant organization identity visible to all company team members.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company / Organization Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Sales Corp"
                  required
                />
                <Input
                  label="Organization Slug (Tenant Key)"
                  value={slug}
                  disabled
                  helperText="Fixed system identifier for multi-tenant isolation."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Primary Operating Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </Select>

                <Select
                  label="Standard Timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT / BST)</option>
                  <option value="Europe/Paris">Central European Time (CET)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                  <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                  <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Multi-tenant data isolation enabled</span>
              </div>
              <Button
                type="submit"
                size="sm"
                leftIcon={Save}
                isLoading={updateMutation.isPending}
              >
                Save Settings
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
