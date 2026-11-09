import React, { useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Building, Save, Shield } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState(
    user?.organization?.name || user?.organizationName || 'Acme Sales Corp',
  );
  const [slug] = useState(user?.organization?.slug || 'acme-sales');
  const [timezone, setTimezone] = useState('America/New_York');
  const [currency, setCurrency] = useState('USD');

  const handleSave = (e) => {
    e.preventDefault();
    toast.info('Organization settings API will be connected in Phase 10 (Settings & Configuration).', 'Settings Preview');
  };

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
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
              </Select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Multi-tenant data isolation enabled</span>
            </div>
            <Button type="submit" size="sm" leftIcon={Save}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

