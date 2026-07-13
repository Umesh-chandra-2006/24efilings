import React, { lazy, Suspense } from 'react';
import { createHashRouter, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { RequireAuth, RequireRole } from '@/components/auth/RouteGuards';

// Lazy-loaded pages (code-splitted chunks)
const Dashboard = lazy(() => import('@/pages/DashboardOverview'));
const LeadsOverview = lazy(() => import('@/pages/LeadsOverview'));
const CreateLead = lazy(() => import('@/pages/CreateLead'));
const LeadDetail = lazy(() => import('@/pages/LeadDetail'));
const LeadWorkflow = lazy(() => import('@/pages/LeadWorkflow'));
const Customers = lazy(() => import('@/pages/Customers'));
const CustomerDetail = lazy(() => import('@/pages/CustomerDetail'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const TeamManagement = lazy(() => import('@/pages/TeamManagement'));
const Reports = lazy(() => import('@/pages/Reports'));
const PaymentTracker = lazy(() => import('@/pages/PaymentTracker'));
const BranchManagement = lazy(() => import('@/pages/BranchManagement'));
const Settings = lazy(() => import('@/pages/Settings'));
const ActivityFeed = lazy(() => import('@/pages/ActivityFeed'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const FollowUps = lazy(() => import('@/pages/FollowUps'));
const DocumentVerification = lazy(() => import('@/pages/DocumentVerification'));
const ClientDocuments = lazy(() => import('@/pages/ClientDocuments'));
const ServiceManagement = lazy(() => import('@/pages/ServiceManagement'));
const OffersManagement = lazy(() => import('@/pages/OffersManagement'));
const WebOverview = lazy(() => import('@/pages/WebOverview'));
const WebLeads = lazy(() => import('@/pages/WebLeadsManagement'));
const Blogs = lazy(() => import('@/pages/BlogsManagement'));
const Testimonials = lazy(() => import('@/pages/TestimonialsManagement'));
const Login = lazy(() => import('@/pages/Login'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

const SuspenseWrapper = () => (
  <Suspense fallback={<PageSkeleton />}>
    <Outlet />
  </Suspense>
);

export const router = createHashRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <ResetPassword />
      </Suspense>
    ),
  },

  // Authenticated routes
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // Universal routes (all authenticated roles)
      {
        element: <SuspenseWrapper />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'leads', element: <LeadsOverview title="All Leads" /> },
          { path: 'leads/new', element: <CreateLead /> },
          { path: 'leads/:leadId', element: <LeadDetail /> },
          { path: 'leads/my', element: <LeadsOverview title="My Leads" isMyLeadsOnly /> },
          { path: 'leads/workflow', element: <LeadWorkflow /> },
          { path: 'customers', element: <Customers /> },
          { path: 'customers/:customerId', element: <CustomerDetail /> },
          { path: 'follow-ups', element: <FollowUps /> },
          { path: 'notifications', element: <Notifications /> },
        ],
      },

      // Admin+ routes
      {
        element: <RequireRole roles={['Super Admin', 'Admin', 'Branch Manager']} />,
        children: [
          {
            element: <SuspenseWrapper />,
            children: [
              { path: 'user-management', element: <UserManagement /> },
              { path: 'team-management', element: <TeamManagement /> },
              { path: 'reports', element: <Reports /> },
              { path: 'services', element: <ServiceManagement /> },
              { path: 'documents', element: <DocumentVerification /> },
              { path: 'client-documents', element: <ClientDocuments /> },
              { path: '24efiling-web', element: <WebOverview /> },
              { path: 'web-leads', element: <WebLeads /> },
              { path: 'blogs', element: <Blogs /> },
              { path: 'testimonials', element: <Testimonials /> },
            ],
          },
        ],
      },

      // Super Admin only routes
      {
        element: <RequireRole roles={['Super Admin']} />,
        children: [
          {
            element: <SuspenseWrapper />,
            children: [
              { path: 'branch-management', element: <BranchManagement /> },
              { path: 'payments', element: <PaymentTracker /> },
              { path: 'activity-feed', element: <ActivityFeed /> },
              { path: 'system-settings', element: <Settings /> },
              { path: 'offers-coupons', element: <OffersManagement /> },
            ],
          },
        ],
      },
    ],
  },
]);
