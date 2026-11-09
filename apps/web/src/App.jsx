import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/context/AuthContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';

// Route Guards & Layouts
import { ProtectedRoute } from './features/auth/components/ProtectedRoute.jsx';
import { RoleRoute } from './features/auth/components/RoleRoute.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';

// Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './features/auth/pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { LeadsPage } from './pages/LeadsPage.jsx';
import { LeadsKanbanPage } from './pages/LeadsKanbanPage.jsx';
import { LeadDetailsPage } from './features/leads/pages/LeadDetailsPage.jsx';
import { EmployeesPage } from './pages/EmployeesPage.jsx';
import { TeamsPage } from './features/teams/pages/TeamsPage.jsx';
import { TeamDetailsPage } from './features/teams/pages/TeamDetailsPage.jsx';
import { FollowupsPage } from './pages/FollowupsPage.jsx';
import { ActivitiesPage } from './pages/ActivitiesPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { PlatformOrganizationsPage } from './pages/PlatformOrganizationsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { HomePage } from './pages/HomePage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes inside DashboardLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="leads/kanban" element={<LeadsKanbanPage />} />
                <Route path="leads/:id" element={<LeadDetailsPage />} />

                {/* Role-Guarded: Employees (Admin only) */}
                <Route
                  path="employees"
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <EmployeesPage />
                    </RoleRoute>
                  }
                />

                {/* Role-Guarded: Teams (Admin & Manager) */}
                <Route
                  path="teams"
                  element={
                    <RoleRoute allowedRoles={['ADMIN', 'MANAGER']}>
                      <TeamsPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path="teams/:id"
                  element={
                    <RoleRoute allowedRoles={['ADMIN', 'MANAGER']}>
                      <TeamDetailsPage />
                    </RoleRoute>
                  }
                />

                {/* Role-Guarded: Follow-ups (Admin, Manager, Employee) */}
                <Route
                  path="follow-ups"
                  element={
                    <RoleRoute allowedRoles={['ADMIN', 'MANAGER', 'EMPLOYEE']}>
                      <FollowupsPage />
                    </RoleRoute>
                  }
                />

                {/* Role-Guarded: Activities (Admin, Manager, Employee) */}
                <Route
                  path="activities"
                  element={
                    <RoleRoute allowedRoles={['ADMIN', 'MANAGER', 'EMPLOYEE']}>
                      <ActivitiesPage />
                    </RoleRoute>
                  }
                />

                <Route path="notifications" element={<NotificationsPage />} />

                {/* Role-Guarded: Reports (SuperAdmin, Admin, Manager, Employee) */}
                <Route
                  path="reports"
                  element={
                    <RoleRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']}>
                      <ReportsPage />
                    </RoleRoute>
                  }
                />

                {/* Role-Guarded: Tenant Settings (Admin only) */}
                <Route
                  path="settings"
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <SettingsPage />
                    </RoleRoute>
                  }
                />

                {/* Role-Guarded: Platform Organizations (Super Admin only) */}
                <Route
                  path="platform/organizations"
                  element={
                    <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                      <PlatformOrganizationsPage />
                    </RoleRoute>
                  }
                />

                {/* Authenticated User Profile */}
                <Route path="profile" element={<ProfilePage />} />

                {/* Diagnostic System Health page from Phase 1 */}
                <Route path="system-status" element={<HomePage />} />
              </Route>

              {/* Catch-all Wildcard Route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
