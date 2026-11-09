import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { authService } from '../features/auth/services/auth.service.js';
import { User, Lock, KeyRound, ShieldCheck, Mail, Building, Phone, Save } from 'lucide-react';

export function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();

  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadFullProfile() {
      try {
        const res = await authService.getProfile();
        if (isMounted && res?.data?.user) {
          const u = res.data.user;
          setFirstName(u.firstName || u.first_name || '');
          setLastName(u.lastName || u.last_name || '');
          setPhone(u.phone || '');
        }
      } catch (_err) {
        // Fall back to context user
        if (isMounted && user) {
          setFirstName(user.firstName || '');
          setLastName(user.lastName || '');
          setPhone(user.phone || '');
        }
      }
    }
    loadFullProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error('First name is required.');
      return;
    }

    setProfileLoading(true);
    try {
      await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
      });

      toast.success('Profile details updated successfully.');
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to update profile details.';
      toast.error(msg, 'Update Failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);

    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      toast.success('Password updated successfully. Please sign in with your new password.', 'Security Update');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Per security spec, changing password revokes all refresh tokens and logs out
      setTimeout(async () => {
        await logout();
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to change password. Please verify your current password.';
      setPasswordError(msg);
      toast.error(msg, 'Password Change Failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="User Profile & Security"
        description="Manage your account profile details, role permissions, and authentication security."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Identity Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-sm">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="pt-1">
              <Badge variant="primary" size="md" dot>
                {user?.role || 'EMPLOYEE'}
              </Badge>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1.5 text-slate-500">
                <Building className="w-3.5 h-3.5" />
                <span>Organization:</span>
              </span>
              <span className="font-semibold text-slate-800">
                {user?.organization?.name || user?.organizationName || 'Global Platform'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1.5 text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                <span>Account Email:</span>
              </span>
              <span className="font-mono text-slate-800 truncate max-w-[140px]">
                {user?.email}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center space-x-1.5 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Account Status:</span>
              </span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* Profile Details & Password Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editable Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Personal Details</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  leftIcon={Phone}
                />
                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  helperText="Email is managed by organization admin."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Assigned Role"
                  value={user?.role || ''}
                  disabled
                  helperText="Role assigned by organization administrator."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  leftIcon={Save}
                  isLoading={profileLoading}
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={Lock}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 8 chars"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={Lock}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={Lock}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  leftIcon={KeyRound}
                  isLoading={passwordLoading}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
