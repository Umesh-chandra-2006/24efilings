import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { supabase } from './lib/supabaseClient'; // Import supabase for storage operations
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { User, Lead, Document, Customer, Task, TaskPriority } from './types';
import { useToast } from './components/Toast';
import { useAuth } from './context/AuthContext';
import { useApi } from './hooks/useApi';
import { UserForm } from './components/UserForm';
import { LeadForm } from './components/LeadForm';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import { ConfirmationDialog } from './components/ui/ConfirmationDialog';
import { SuccessConversionModal } from './components/ui/SuccessConversionModal';

// Import all page components
import DashboardOverview from './pages/DashboardOverview';
import UserManagement from './pages/UserManagement';
import LeadsOverview from './pages/LeadsOverview';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import TeamManagement from './pages/TeamManagement';
import DocumentVerification from './pages/DocumentVerification';
import PaymentTracker from './pages/PaymentTracker';
import FollowUps from './pages/FollowUps';
import ClientDocuments from './pages/ClientDocuments';
import Notifications from './pages/Notifications';
import LeadDetail from './pages/LeadDetail';
import CreateLead from './pages/CreateLead';
import LeadWorkflow from './pages/LeadWorkflow';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import ActivityFeed from './pages/ActivityFeed';
import ServiceManagement from './pages/ServiceManagement';
import { checkAndTriggerBirthdays } from './lib/birthdayScheduler';
import OffersManagement from './pages/OffersManagement';
import { checkAndTriggerOfferStatus } from './lib/offerScheduler';
import WebOverview from './pages/WebOverview';
import WebLeadsManagement from './pages/WebLeadsManagement';
import BlogsManagement from './pages/BlogsManagement';
import TestimonialsManagement from './pages/TestimonialsManagement';
import BranchManagement from './pages/BranchManagement';
import { GlobalFilterProvider, useGlobalFilter } from './contexts/GlobalFilterContext';
import { GlobalFilterBar } from './components/ui/GlobalFilterBar';

const PAGE_CONFIG: Record<string, { title: string, subtitle: string }> = {
  'Dashboard': { title: 'Dashboard', subtitle: 'Key metrics and recent activities at a glance.' },
  'Branch Management': { title: 'Branch Management', subtitle: 'Manage company branches and monitor branch-wise activity.' },
  'User Management': { title: 'User Management', subtitle: 'Manage system users and their roles.' },
  'Leads Overview': { title: 'Leads Overview', subtitle: 'Manage and track all leads in the system.' },
  'All Leads': { title: 'All Leads', subtitle: 'View and manage all leads across the system.' },
  'Lead Workflow': { title: 'Lead Workflow', subtitle: 'Visualize and manage your sales pipeline.' },
  'Customers': { title: 'Customers', subtitle: 'View all converted leads and manage customer relationships.' },
  'Payments': { title: 'Payment Tracking', subtitle: 'Manage and track all payments in the system.' },
  'Reports & Analytics': { title: 'Reports & Analytics', subtitle: 'Comprehensive business intelligence and performance metrics.' },
  'Activity Feed': { title: 'Activity Feed', subtitle: 'Track all user actions across the system.' },
  'System Settings': { title: 'System Settings', subtitle: 'Configure application and user settings.' },
  'Lead Management': { title: 'Lead Management', subtitle: 'Manage and track all team leads.' },
  'Team Management': { title: 'Team Management', subtitle: 'Oversee your sales executives and their performance.' },
  'Document Verification': { title: 'Document Verification', subtitle: 'Review and verify client documents.' },
  'Reports': { title: 'Reports', subtitle: 'Analyze team performance and track key metrics.' },
  'My Leads': { title: 'My Leads', subtitle: 'View and manage leads created by you.' },
  'Follow-ups': { title: 'Follow-ups', subtitle: 'Track and manage your upcoming follow-ups.' },
  'Client Documents': { title: 'Client Documents', subtitle: 'Manage all documents related to your clients.' },
  'Performance Report': { title: 'Performance Report', subtitle: 'Review your personal sales performance.' },
  'Support': { title: 'Support', subtitle: 'Get help and find answers to your questions.' },
  'Notifications': { title: 'Notifications', subtitle: 'View all your recent notifications.' },
  'Lead Detail': { title: 'Lead Detail', subtitle: 'Viewing lead information and activity.' },
  'Customer Detail': { title: 'Customer Detail', subtitle: 'Viewing customer information and history.' },
  'Create New Lead': { title: 'Create New Lead', subtitle: 'Add a new potential customer to the system.' },
  'Services': { title: 'Manage Services', subtitle: 'Add and manage services and sub-services.' },
  'Offers & Coupons': { title: 'Offers & Coupons', subtitle: 'Manage discount campaigns, coupons, and referral offers.' },
  '24efiling Web': { title: '24eFiling Web', subtitle: 'Manage your website, articles, leads, and customer reviews.' },
  'Web Leads': { title: 'Organic Website Leads', subtitle: 'Review organic contact form queries from the main website.' },
  'Blogs': { title: 'Blogs Content Manager', subtitle: 'Compose educational resources and company updates.' },
  'Testimonials': { title: 'Client Testimonials Board', subtitle: 'Moderate client reviews, star ratings, and success quotes.' },
};


const uploadAvatar = async (fileData: string | undefined, fileNamePrefix: string): Promise<string | undefined> => {
  // Only upload if it's a local data: or blob: URL — otherwise it's already a remote URL, return as-is
  if (!fileData) return fileData;
  if (!fileData.startsWith('data:') && !fileData.startsWith('blob:')) return fileData;

  try {
    const res = await fetch(fileData);
    const blob = await res.blob();
    const fileExt = blob.type.split('/')[1] || 'png';
    const safePrefix = fileNamePrefix.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `user-avatars/${safePrefix}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, blob, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error("Avatar upload failed:", error);
    throw new Error("Failed to upload profile picture.");
  }
};

// Dedicated uploader for branch logos — takes the raw File object directly
const uploadBranchLogo = async (file: File): Promise<string> => {
  try {
    const fileExt = file.type.split('/')[1] || 'png';
    const fileName = `branch-logos/logo_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error("Branch logo upload failed:", error);
    throw new Error("Failed to upload branch logo.");
  }
};

export default function App() {
  const authData = useAuth();
  const apiData = useApi();

  if (!authData.profile) {
    return <FilteredAppContent authData={authData} apiData={apiData} />;
  }

  return (
    <GlobalFilterProvider 
      currentUser={authData.profile} 
      allUsers={apiData.users} 
      allCities={apiData.cities} 
      allBranches={apiData.branches}
    >
      <FilteredAppContent authData={authData} apiData={apiData} />
    </GlobalFilterProvider>
  );
}

function FilteredAppContent({ authData, apiData }: { authData: any, apiData: any }) {
  const { session, profile, signOut, loading: authLoading, isPasswordRecovery, updateUserPassword, createUserByAdmin, refreshProfile, profileError } = authData;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toast = useToast();

  const {
    leads,
    users,
    customers,
    notifications,
    userActivities,
    services,
    loading: dataLoading,
    error: dataError,
    addLead,
    addNotification,
    updateLead,
    updateUser,
    addActivityToLead,
    updateMultipleLeads,
    deleteMultipleLeads,
    deleteMultipleUsers,
    uploadDocument,
    deleteDocument,
    updateDocumentStatus,
    markNotificationsAsRead,
    addTaskToLead,
    updateTaskOnLead,
    deleteTaskFromLead,
    refreshData,
    addService,
    updateService,
    deleteService,
    addSubService,
    updateSubService,
    deleteSubService,
    offers,
    addOffer,
    updateOffer,
    deleteOffer,
    incrementOfferUsage,
    webLeads,
    blogs,
    testimonials,
    cities,
    addWebLead,
    updateWebLeadStatus,
    assignWebLead,
    convertWebLeadToCrmLead,
    updateWebLead,
    deleteMultipleWebLeads,
    addBlog,
    updateBlog,
    deleteBlog,
    addTestimonial,
    updateTestimonialStatus,
    deleteTestimonial,
    updateCustomer,
    branches,
    uploadBranchLogo,
    addBranch,
    updateBranch,
    addCity,
    deleteBranch,
    transferUser,
    transferLogs,
    auditLogs
  } = apiData;

  const viewProfile = profile;

  // ── ROLE-SCOPED BASE ARRAYS ──────────────────────────────────────────────
  const roleScopedUsers = React.useMemo(() => {
    if (!viewProfile) return [];
    if (viewProfile.role === 'Super Admin') return users;
    if (viewProfile.role === 'Admin' || viewProfile.role === 'Branch Manager') {
      return users.filter(u => u.branch_id === viewProfile.branch_id);
    }
    return users.filter(u => u.id === viewProfile.id);
  }, [users, viewProfile]);

  const roleScopedLeads = React.useMemo(() => {
    if (!viewProfile) return [];
    if (viewProfile.role === 'Super Admin') return leads;
    if (viewProfile.role === 'Admin' || viewProfile.role === 'Branch Manager') {
      return leads.filter(lead => lead.branch_id === viewProfile.branch_id || lead.assigned_to?.branch_id === viewProfile.branch_id || lead.branch_name === viewProfile.branch_name);
    }
    return leads.filter(lead =>
      lead.assigned_to?.id === viewProfile.id ||
      lead.created_by === viewProfile.id
    );
  }, [leads, viewProfile]);

  const roleScopedCustomers = React.useMemo(() => {
    if (!viewProfile) return [];
    if (viewProfile.role === 'Super Admin') return customers;
    if (viewProfile.role === 'Admin' || viewProfile.role === 'Branch Manager') {
      return customers.filter(c => c.branch_id === viewProfile.branch_id || c.assigned_to?.branch_id === viewProfile.branch_id);
    }
    return customers.filter(c => c.assigned_to?.id === viewProfile.id || c.created_by?.id === viewProfile.id);
  }, [customers, viewProfile]);

  const roleScopedActivities = React.useMemo(() => {
    if (!viewProfile) return [];
    if (viewProfile.role === 'Super Admin') return userActivities;
    if (viewProfile.role === 'Admin' || viewProfile.role === 'Branch Manager') {
      const branchUserIds = roleScopedUsers.map(u => u.id);
      return userActivities.filter(a => branchUserIds.includes(a.user_id));
    }
    return userActivities.filter(a => a.user_id === viewProfile.id);
  }, [userActivities, roleScopedUsers, viewProfile]);

  const { cityId, branchId, adminId, employeeId, leadSourceId, dateRange: globalDateRange, availableCities, availableBranches } = profile ? useGlobalFilter() : { cityId: 'All Cities', branchId: 'All Branches', adminId: 'All Managers', employeeId: 'All Employees', leadSourceId: 'All Sources', dateRange: {from: undefined, to: undefined}, availableCities: [] as City[], availableBranches: [] as Branch[] };

  // ── GLOBALLY FILTERED ARRAYS ──────────────────────────────────────────────
  const globallyFilteredUsers = React.useMemo(() => {
    let res = roleScopedUsers;
    if (cityId !== 'All Cities') res = res.filter((u: any) => u.city_id === cityId || u.city_name === cityId);
    if (branchId !== 'All Branches') res = res.filter((u: any) => u.branch_id === branchId || u.branch_name === branchId);
    if (adminId !== 'All Managers') res = res.filter((u: any) => u.reporting_to === adminId || u.id === adminId);
    if (employeeId !== 'All Employees') res = res.filter((u: any) => u.id === employeeId);
    return res;
  }, [roleScopedUsers, cityId, branchId, adminId, employeeId]);

  const globallyFilteredLeads = React.useMemo(() => {
    let res = roleScopedLeads;
    if (cityId !== 'All Cities') res = res.filter((l: any) => { const u = roleScopedUsers.find((x: any) => x.id === (l.assigned_to?.id || l.created_by)); return u?.city_id === cityId || u?.city_name === cityId; });
    if (branchId !== 'All Branches') res = res.filter((l: any) => l.branch_id === branchId || (l.assigned_to?.branch_id === branchId) || l.branch_name === branchId);
    if (adminId !== 'All Managers') res = res.filter((l: any) => { const u = roleScopedUsers.find((x: any) => x.id === (l.assigned_to?.id || l.created_by)); return u?.reporting_to === adminId || u?.id === adminId; });
    if (employeeId !== 'All Employees') res = res.filter((l: any) => l.assigned_to?.id === employeeId || l.created_by === employeeId);
    if (leadSourceId !== 'All Sources') res = res.filter((l: any) => l.lead_source_id === leadSourceId);
    if (globalDateRange?.from) res = res.filter((l: any) => new Date(l.created_at) >= globalDateRange.from!);
    if (globalDateRange?.to) res = res.filter((l: any) => new Date(l.created_at) <= globalDateRange.to!);
    return res;
  }, [roleScopedLeads, roleScopedUsers, cityId, branchId, adminId, employeeId, leadSourceId, globalDateRange]);

  const globallyFilteredCustomers = React.useMemo(() => {
    let res = roleScopedCustomers;
    if (cityId !== 'All Cities') res = res.filter((c: any) => { const l = roleScopedLeads.find((x: any) => x.id === c.lead_id); const u = roleScopedUsers.find((x: any) => x.id === (c.assigned_to?.id || l?.assigned_to?.id)); return u?.city_id === cityId || u?.city_name === cityId; });
    if (branchId !== 'All Branches') res = res.filter((c: any) => { const l = roleScopedLeads.find((x: any) => x.id === c.lead_id); return l?.branch_id === branchId || c.assigned_to?.branch_id === branchId; });
    if (adminId !== 'All Managers') res = res.filter((c: any) => { const l = roleScopedLeads.find((x: any) => x.id === c.lead_id); const u = roleScopedUsers.find((x: any) => x.id === (c.assigned_to?.id || l?.assigned_to?.id)); return u?.reporting_to === adminId || u?.id === adminId; });
    if (employeeId !== 'All Employees') res = res.filter((c: any) => c.assigned_to?.id === employeeId);
    if (leadSourceId !== 'All Sources') res = res.filter((c: any) => c.lead_source_id === leadSourceId);
    if (globalDateRange?.from) res = res.filter((c: any) => new Date(c.created_at || Date.now()) >= globalDateRange.from!);
    if (globalDateRange?.to) res = res.filter((c: any) => new Date(c.created_at || Date.now()) <= globalDateRange.to!);
    return res;
  }, [roleScopedCustomers, roleScopedLeads, roleScopedUsers, cityId, branchId, adminId, employeeId, leadSourceId, globalDateRange]);

  const globallyFilteredActivities = React.useMemo(() => {
    let res = roleScopedActivities;
    if (globalDateRange?.from) res = res.filter((a: any) => new Date(a.timestamp) >= globalDateRange.from!);
    if (globalDateRange?.to) res = res.filter((a: any) => new Date(a.timestamp) <= globalDateRange.to!);
    if (employeeId !== 'All Employees') res = res.filter((a: any) => a.user_id === employeeId);
    return res;
  }, [roleScopedActivities, employeeId, globalDateRange]);

  // Routing helper functions
  const pageToHash = useCallback((page: string, leadId?: string | null, customerId?: string | null) => {
    if (page === 'Lead Detail' && leadId) {
      return `#/lead-detail/${leadId}`;
    }
    if (page === 'Customer Detail' && customerId) {
      return `#/customer-detail/${customerId}`;
    }
    const clean = page.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
    return `#/${clean}`;
  }, []);

  const hashToState = useCallback((hash: string) => {
    if (!hash || hash === '#/' || hash === '#') {
      return { page: 'Dashboard', leadId: null, customerId: null };
    }
    
    if (hash.startsWith('#/lead-detail/')) {
      const id = hash.replace('#/lead-detail/', '');
      return { page: 'Lead Detail', leadId: id, customerId: null };
    }
    if (hash.startsWith('#/customer-detail/')) {
      const id = hash.replace('#/customer-detail/', '');
      return { page: 'Customer Detail', leadId: null, customerId: id };
    }

    const kebab = hash.replace('#/', '');
    
    const kebabMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'branch-management': 'Branch Management',
      'user-management': 'User Management',
      'leads-overview': 'Leads Overview',
      'all-leads': 'All Leads',
      'lead-workflow': 'Lead Workflow',
      'customers': 'Customers',
      'payments': 'Payments',
      'reports-analytics': 'Reports & Analytics',
      'activity-feed': 'Activity Feed',
      'system-settings': 'System Settings',
      'lead-management': 'Lead Management',
      'team-management': 'Team Management',
      'document-verification': 'Document Verification',
      'reports': 'Reports',
      'my-leads': 'My Leads',
      'follow-ups': 'Follow-ups',
      'client-documents': 'Client Documents',
      'performance-report': 'Performance Report',
      'support': 'Support',
      'notifications': 'Notifications',
      'services': 'Services',
      'offers-coupons': 'Offers & Coupons',
      '24efiling-web': '24efiling Web',
      '24efiling-web-dropdown': '24efiling Web',
      'web-leads': 'Web Leads',
      'blogs': 'Blogs',
      'testimonials': 'Testimonials',
      'create-new-lead': 'Create New Lead',
      'create-lead': 'Create New Lead'
    };

    return {
      page: kebabMap[kebab] || 'Dashboard',
      leadId: null,
      customerId: null
    };
  }, []);

  const initialRoutingState = useMemo(() => hashToState(window.location.hash), [hashToState]);

  const [activePage, _setActivePage] = useState(() => initialRoutingState.page);
  const [previousPage, setPreviousPage] = useState('Dashboard');
  const [userManagementBranchFilter, setUserManagementBranchFilter] = useState<string | null>(null);
  const [viewingLeadId, _setViewingLeadId] = useState<string | null>(() => initialRoutingState.leadId);
  const [viewingCustomerId, _setViewingCustomerId] = useState<string | null>(() => initialRoutingState.customerId);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadForCustomerCreation, setLeadForCustomerCreation] = useState<Lead | null>(null);

  const [initialPageSet, setInitialPageSet] = useState(false);

  // Wrapper functions to update location hash (source of truth)
  const setActivePage = useCallback((page: string) => {
    window.location.hash = pageToHash(page, viewingLeadId, viewingCustomerId);
  }, [pageToHash, viewingLeadId, viewingCustomerId]);

  const setViewingLeadId = useCallback((leadId: string | null) => {
    _setViewingLeadId(leadId);
    window.location.hash = pageToHash(leadId ? 'Lead Detail' : activePage, leadId, viewingCustomerId);
  }, [activePage, pageToHash, viewingCustomerId]);

  const setViewingCustomerId = useCallback((customerId: string | null) => {
    _setViewingCustomerId(customerId);
    window.location.hash = pageToHash(customerId ? 'Customer Detail' : activePage, viewingLeadId, customerId);
  }, [activePage, pageToHash, viewingLeadId]);

  // Keep previousPage updated on page transition
  useEffect(() => {
    if (activePage && activePage !== 'Lead Detail' && activePage !== 'Customer Detail' && activePage !== 'Create New Lead') {
      setPreviousPage(activePage);
    }
  }, [activePage]);

  // Clear any existing URL parameters (e.g. ?branch=) on mount
  useEffect(() => {
    if (window.location.search) {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Listen for browser navigation changes (Back/Forward)
  useEffect(() => {
    const handleHashChange = () => {
      const { page, leadId, customerId } = hashToState(window.location.hash);
      
      _setActivePage((currentActive) => currentActive !== page ? page : currentActive);
      _setViewingLeadId((currentLead) => currentLead !== leadId ? leadId : currentLead);
      _setViewingCustomerId((currentCustomer) => currentCustomer !== customerId ? customerId : currentCustomer);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [hashToState]);

  // ===== ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS =====
  useEffect(() => {
    if (profile && !initialPageSet) {
      if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
        window.location.hash = '#/dashboard';
      }
      setInitialPageSet(true);
    }
  }, [profile, initialPageSet]);


  // Daily birthday scheduler check upon login/load
  useEffect(() => {
    if (customers.length > 0 && viewProfile && users.length > 0) {
      checkAndTriggerBirthdays(customers, viewProfile, users, addNotification, addTaskToLead);
    }
  }, [customers, viewProfile, users, addNotification, addTaskToLead]);

  // Daily offer scheduler check upon login/load
  useEffect(() => {
    if (offers.length > 0 && viewProfile && users.length > 0) {
      checkAndTriggerOfferStatus(offers, viewProfile, users, addNotification, updateOffer);
    }
  }, [offers, viewProfile, users, addNotification, updateOffer]);

  // Real-time task and follow-up due time checker (runs every 10 seconds)
  const notifiedTasksRef = useRef<Set<string>>(new Set());
  const notifiedFollowUpsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!profile || leads.length === 0) return;

    const checkTasksInterval = setInterval(async () => {
      const now = new Date();

      for (const lead of globallyFilteredLeads) {
        // 1. Check General Lead Follow-Up due dates
        if (lead.next_follow_up && lead.status !== 'Success' && lead.status !== 'Lost') {
          const followUpDate = new Date(lead.next_follow_up);
          if (followUpDate <= now) {
            const fuRefTag = `(FollowUpRef: ${lead.id}-${lead.next_follow_up.split('T')[0]})`;
            const alreadyNotifiedInState = notifications.some(n =>
              n.message && n.message.includes(fuRefTag)
            );
            const alreadyNotifiedInRef = notifiedFollowUpsRef.current.has(fuRefTag);

            if (!alreadyNotifiedInState && !alreadyNotifiedInRef) {
              notifiedFollowUpsRef.current.add(fuRefTag);
              const targetUserId = lead.assigned_to?.id || lead.created_by || profile.id;

              try {
                await addNotification({
                  user_id: targetUserId,
                  type: 'Status Updated',
                  title: '⏰ Follow-Up Reminder Due!',
                  message: `Scheduled follow-up for lead "${lead.business_name || (lead.first_name + ' ' + lead.last_name)}" is due now. ${fuRefTag}`,
                  link: { page: 'Lead Detail', id: lead.id }
                });

                if (targetUserId === profile.id) {
                  toast.addToast(`Follow-up due: "${lead.business_name || (lead.first_name + ' ' + lead.last_name)}"`, 'info');
                }
              } catch (e) {
                console.error("Failed to create follow-up notification", e);
                notifiedFollowUpsRef.current.delete(fuRefTag);
              }
            }
          }
        }

        // 2. Check Individual Task due dates
        if (!lead.tasks || lead.tasks.length === 0) continue;

        for (const task of lead.tasks) {
          if (task.is_completed || !task.due_date) continue;

          const dueDate = new Date(task.due_date);
          if (dueDate <= now) {
            const taskRefTag = `(Ref: ${task.id})`;
            const alreadyNotifiedInState = notifications.some(n =>
              n.message && n.message.includes(taskRefTag)
            );
            const alreadyNotifiedInRef = notifiedTasksRef.current.has(task.id);

            if (!alreadyNotifiedInState && !alreadyNotifiedInRef) {
              notifiedTasksRef.current.add(task.id);

              const targetUserId = lead.assigned_to?.id || task.created_by?.id || profile.id;

              try {
                await addNotification({
                  user_id: targetUserId,
                  type: 'Note Added',
                  title: '⏰ Task Reminder Due!',
                  message: `Scheduled task "${task.content}" is due now for lead "${lead.business_name || (lead.first_name + ' ' + lead.last_name)}". ${taskRefTag}`,
                  link: { page: 'Lead Detail', id: lead.id }
                });

                if (targetUserId === profile.id) {
                  toast.addToast(`Task Due: "${task.content}"`, 'info');
                }
              } catch (e) {
                console.error("Failed to create task due notification", e);
                notifiedTasksRef.current.delete(task.id);
              }
            }
          }
        }
      }
    }, 10000);

    return () => clearInterval(checkTasksInterval);
  }, [leads, notifications, profile, addNotification, toast]);

  const filteredLeads = useMemo(() => {
    const { from, to } = dateRange;
    if (!from && !to) {
      return leads;
    }
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);

    return leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      if (fromDate && leadDate < fromDate) return false;
      if (toDate && leadDate > toDate) return false;
      return true;
    });
  }, [leads, dateRange]);

  const filteredUsers = useMemo(() => {
    const { from, to } = dateRange;
    if (!from && !to) {
      return users;
    }
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);

    return users.filter(user => {
      const userDate = new Date(user.created_at);
      if (fromDate && userDate < fromDate) return false;
      if (toDate && userDate > toDate) return false;
      return true;
    });
  }, [users, dateRange]);

  const userLeads = useMemo(() => {
    if (!viewProfile) return [];
    if (viewProfile.role === 'Super Admin') {
      return filteredLeads;
    }
    if (viewProfile.role === 'Admin' || viewProfile.role === 'Branch Manager') {
      return filteredLeads.filter(lead => lead.branch_id === viewProfile.branch_id || lead.assigned_to?.branch_id === viewProfile.branch_id || lead.branch_name === viewProfile.branch_name);
    }
    // Sales Exec can see:
    // 1. Leads assigned to them
    // 2. Leads created by them (regardless of current assignment)
    return filteredLeads.filter(lead =>
      lead.assigned_to?.id === viewProfile.id ||
      lead.created_by === viewProfile.id
    );
  }, [filteredLeads, viewProfile]);

  const userNotifications = useMemo(() => {
    if (!profile) return [];
    return notifications.filter(n => n.user_id === profile.id);
  }, [notifications, profile]);

  const unreadCount = useMemo(() => {
    return userNotifications.filter(n => !n.is_read).length;
  }, [userNotifications]);

  const myLeads = useMemo(() => {
    if (!viewProfile) return [];
    // "My Leads" shows only leads created by the current user
    return filteredLeads.filter(lead => lead.created_by === viewProfile.id);
  }, [filteredLeads, viewProfile]);

  const leadsForPayments = useMemo(() => {
    return userLeads.filter(lead => ['Documents & Payments', 'Success', 'Lost'].includes(lead.status))
  }, [userLeads]);

  const activeUsers = useMemo(() => users.filter(u => u.is_active), [users]);

  const salesExecutives = useMemo(() => users.filter(u => u.role === 'Sales Executive'), [users]);
  const activeSalesExecutives = useMemo(() => salesExecutives.filter(u => u.is_active), [salesExecutives]);

  // Wrapped handlers in useCallback to prevent re-creation on every render,
  // fixing infinite loops and improving performance.
  const handlePasswordUpdate = useCallback(async (password: string) => {
    await updateUserPassword(password);
    toast.addToast('Password updated successfully! Please sign in again.', 'success');
    await signOut();
  }, [updateUserPassword, toast, signOut]);

  const handleNavigate = useCallback((page: string) => {
    setActivePage(page);
  }, [setActivePage]);

  const handleLogout = useCallback(async () => {
    await signOut();
    setActivePage('Dashboard');
  }, [signOut, setActivePage]);

  const handleViewLead = useCallback((leadId: string) => {
    setViewingLeadId(leadId);
  }, [setViewingLeadId]);

  const handleViewCustomer = useCallback((customerId: string) => {
    setViewingCustomerId(customerId);
  }, [setViewingCustomerId]);

  const handleBackFromDetail = useCallback(() => {
    window.location.hash = pageToHash(previousPage);
  }, [previousPage, pageToHash]);

  const handleNavigateToCreateLead = useCallback(() => {
    setActivePage('Create New Lead');
  }, [setActivePage]);

  const handleCancelCreateLead = useCallback(() => {
    window.location.hash = pageToHash(previousPage);
  }, [previousPage, pageToHash]);

  const handleAddLead = useCallback(async (leadData: Omit<Lead, 'id' | 'created_at' | 'last_contacted' | 'status' | 'assigned_to'>, assignedToId: string | null) => {
    if (!profile) return;
    try {
      let assigned_to: User | undefined = undefined;
      // HEAD_OFFICE is a special sentinel value — treat as unassigned (goes to central pool)
      if (assignedToId && assignedToId !== 'HEAD_OFFICE') {
        assigned_to = users.find(u => u.id === assignedToId);
        if (!assigned_to) {
          toast.addToast('Error: Could not find the selected user to assign.', 'error');
          return;
        }
      }

      const totalPaymentFromSets = leadData.service_sets?.reduce((total, set) =>
        total + set.subservices.reduce((subTotal, sub) => subTotal + (sub.amount * sub.quantity) + (Number(sub.tax_amount) || 0), 0) + (Number(set.service_fee) || 0), 0) || 0;

      const requestedServices = leadData.service_sets?.flatMap(s => s.subservices.map(sub => sub.name));
      const serviceRequestedString = requestedServices && requestedServices.length > 0 ? requestedServices.join(', ') : 'No service specified';

      const newLeadData = {
        ...leadData,
        status: 'New Lead' as Lead['status'],
        assigned_to: assigned_to,
        total_payment: totalPaymentFromSets,
        service_requested: serviceRequestedString,
        // Tag lead as Head Office assignment in notes if applicable
        notes: assignedToId === 'HEAD_OFFICE'
          ? `[Assigned to Head Office]\n${leadData.notes || ''}`.trim()
          : leadData.notes,
      };

      await addLead(newLeadData);
      toast.addToast('Lead created successfully!', 'success');
      setActivePage(previousPage);
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
    }
  }, [profile, users, addLead, toast, previousPage]);

  const handleUpdateLead = useCallback(async (leadData: Lead) => {
    const originalLead = leads.find(l => l.id === leadData.id);

    setIsLeadFormOpen(false);
    setEditingLead(null);

    if (originalLead && originalLead.status !== 'Success' && leadData.status === 'Success') {
      setLeadForCustomerCreation(leadData);
    } else {
      try {
        await updateLead(leadData);
        toast.addToast('Lead updated successfully!', 'success');
      } catch (error: any) {
        toast.addToast(`Error: ${error.message}`, 'error');
      }
    }
  }, [leads, updateLead, toast]);

  const handleConfirmCustomerCreation = useCallback(async (dob: string, pan: string, aadhar: string) => {
    if (!leadForCustomerCreation) return;
    try {
      const updatedLead = {
        ...leadForCustomerCreation,
        pan_number: pan || leadForCustomerCreation.pan_number
      };
      await updateLead(updatedLead, true, dob, aadhar);
      toast.addToast('Lead converted and customer created!', 'success');
      setLeadForCustomerCreation(null);
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
      setLeadForCustomerCreation(null);
      refreshData();
    }
  }, [leadForCustomerCreation, updateLead, toast, refreshData]);

  const handleCancelCustomerCreation = useCallback(() => {
    setLeadForCustomerCreation(null);
    toast.addToast('Conversion cancelled. Date of birth is mandatory for Success stage.', 'warning');
    refreshData();
  }, [refreshData, toast]);

  const handleAddUser = useCallback(async (userData: Omit<User, 'id'> & { password?: string }) => {
    try {
      if (!userData.password || !userData.email || !userData.name) {
        throw new Error("Name, email, and password are required to create a new user.");
      }

      const avatarUrl = await uploadAvatar(userData.avatar_url, userData.email);

      await createUserByAdmin({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        branch_id: userData.branch_id,
        is_active: userData.is_active,
        phone_number: userData.phone_number,
        department: userData.department,
        skills: userData.skills,
        avatar_url: avatarUrl,
        date_of_birth: userData.date_of_birth,
        gender: userData.gender,
        reporting_to: userData.reporting_to,
        employee_code: userData.employee_code
      });
      toast.addToast(`User created. An invitation has been sent to ${userData.email}.`, 'success');
      await refreshData(); // Force refresh to show new user
    } catch (error: any) {
      toast.addToast(`Error creating user: ${error.message}`, 'error');
    }
  }, [createUserByAdmin, toast, refreshData]);

  const handleUpdateUser = useCallback(async (userData: User) => {
    try {
      const avatarUrl = await uploadAvatar(userData.avatar_url, userData.email);
      await updateUser({ ...userData, avatar_url: avatarUrl });
      toast.addToast(`Profile for ${userData.name} has been updated.`, 'success');
    } catch (error: any) {
      toast.addToast(`Error updating profile: ${error.message}`, 'error');
    }
  }, [updateUser, toast]);

  const handleOpenUserForm = useCallback((user: User | null) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  }, []);

  const handleSaveUser = useCallback(async (userData: (User | Omit<User, 'id'>) & { password?: string }) => {
    if ('id' in userData) {
      await handleUpdateUser(userData);
    } else {
      await handleAddUser(userData);
    }
    setIsUserFormOpen(false);
  }, [handleUpdateUser, handleAddUser]);

  const handleOpenLeadForm = useCallback((lead: Lead | null) => {
    setEditingLead(lead);
    setIsLeadFormOpen(true);
  }, []);

  const handleSaveLead = useCallback(async (leadData: Lead | Omit<Lead, 'id' | 'created_at' | 'last_contacted'>) => {
    if ('id' in leadData) {
      await handleUpdateLead(leadData);
    }
    setIsLeadFormOpen(false);
    setEditingLead(null);
  }, [handleUpdateLead]);

  const handleBulkUpdateLeads = useCallback(async (leadIds: string[], updates: Partial<Omit<Lead, 'id'>>) => {
    if (leadIds.length === 0) return;
    try {
      await updateMultipleLeads(leadIds, updates);
      const count = leadIds.length;
      toast.addToast(`${count} lead${count > 1 ? 's' : ''} updated successfully.`, 'success');
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
    }
  }, [updateMultipleLeads, toast]);

  const handleBulkDeleteLeads = useCallback(async (leadIds: string[]) => {
    if (leadIds.length === 0) return;
    try {
      await deleteMultipleLeads(leadIds);
      const count = leadIds.length;
      toast.addToast(`${count} lead${count > 1 ? 's' : ''} deleted successfully.`, 'success');
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
    }
  }, [deleteMultipleLeads, toast]);

  const handleBulkDeleteUsers = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) return;
    try {
      await deleteMultipleUsers(userIds);
      const count = userIds.length;
      toast.addToast(`${count} user${count > 1 ? 's' : ''} deleted successfully.`, 'success');
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
    }
  }, [deleteMultipleUsers, toast]);

  const handleAddActivity = useCallback((leadId: string, content: string) => {
    if (!profile) return;
    addActivityToLead(leadId, {
      type: 'Note',
      content,
    }, profile);
    toast.addToast('Note added successfully.', 'info');
  }, [profile, addActivityToLead, toast]);

  const handleUploadDocument = useCallback(async (leadId: string, file: File, docType: string) => {
    if (!profile) return;
    try {
      await uploadDocument(leadId, file, docType, profile.id);
      toast.addToast('Document uploaded successfully!', 'success');
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
    }
  }, [profile, uploadDocument, toast]);

  const handleDeleteDocument = useCallback(async (leadId: string, docId: string) => {
    try {
      await deleteDocument(leadId, docId);
      toast.addToast('Document deleted successfully.', 'success');
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
    }
  }, [deleteDocument, toast]);

  const handleUpdateDocumentStatus = useCallback(async (leadId: string, docId: string, status: 'Approved' | 'Rejected', notes: string) => {
    try {
      await updateDocumentStatus(leadId, docId, status, notes);
      toast.addToast(`Document ${status.toLowerCase()}.`, 'success');
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
    }
  }, [updateDocumentStatus, toast]);

  const handleAddTask = useCallback(async (leadId: string, content: string, dueDate?: string, priority?: TaskPriority) => {
    if (!profile) return;
    try {
      await addTaskToLead(leadId, { content, due_date: dueDate, created_by: profile, priority: priority || 'Medium' });
      toast.addToast('Task added.', 'success');
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
      throw error;
    }
  }, [profile, addTaskToLead, toast]);

  const handleUpdateTask = useCallback(async (leadId: string, task: Task) => {
    try {
      await updateTaskOnLead(leadId, task);
      toast.addToast('Task updated.', 'info');
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
      throw error;
    }
  }, [updateTaskOnLead, toast]);

  const handleDeleteTask = useCallback(async (leadId: string, taskId: string) => {
    try {
      await deleteTaskFromLead(leadId, taskId);
      toast.addToast('Task deleted.', 'success');
    } catch (error: any) {
      toast.addToast(`Error: ${error.message}`, 'error');
      throw error;
    }
  }, [deleteTaskFromLead, toast]);

  const handleMarkNotificationsRead = useCallback(() => {
    if (profile) {
      markNotificationsAsRead(profile.id);
    }
  }, [profile, markNotificationsAsRead]);
  // ===== END OF HANDLERS SECTION =====


  // ===== AUTO-HEALING FOR STUCK LOADING STATE =====
  useEffect(() => {
    // If the user is authenticated (session exists) but profile is missing,
    // and we are NOT in the initial loading state, and no error is showing,
    // it implies we are stuck. Force a refresh.
    let timeout: NodeJS.Timeout;
    if (session && !profile && !authLoading && !profileError) {
      console.warn("App stuck in profile loading limbo. Triggering manual refresh...");
      timeout = setTimeout(() => {
        refreshProfile();
      }, 2000); // Wait 2s before forcing retry to avoid conflicts with ongoing fetches
    }
    return () => clearTimeout(timeout);
  }, [session, profile, authLoading, profileError, refreshProfile]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
        <p className="text-slate-600 font-medium animate-pulse">Initializing Application...</p>
      </div>
    );
  }

  if (isPasswordRecovery) {
    return <ResetPassword onPasswordUpdate={handlePasswordUpdate} />;
  }

  if (!session) {
    return <Login />;
  }

  if (!profile || !viewProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        {profileError ? (
          <div className="text-center px-4">
            <p className="text-red-600 mb-2 font-medium">Error loading profile</p>
            <p className="text-sm text-slate-500 mb-4">{profileError}</p>
            <p className="text-xs text-slate-400 mb-4">User ID: {session?.user?.id}</p>
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={() => refreshProfile()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm text-sm font-medium transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  signOut();
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-sm text-sm font-medium text-slate-700 transition-colors"
              >
                Force Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-slate-600 font-medium animate-pulse">Initializing Application...</p>
          </>
        )}
      </div>
    );
  }

  const renderPage = () => {
    if (dataLoading) {
      return <div className="p-8 text-center text-slate-500">Loading data...</div>;
    }
    if (dataError) {
      return <div className="p-8 text-center text-red-500">Error: {dataError}</div>
    }

    if (activePage === 'Lead Detail' && viewingLeadId) {
      const lead = leads.find(l => l.id === viewingLeadId);
      if (lead) {
        return <LeadDetail
          lead={lead}
          onBack={handleBackFromDetail}
          onUpdateLead={handleUpdateLead}
          onAddActivity={(content) => handleAddActivity(lead.id, content)}
          onUploadDocument={(file, docType) => handleUploadDocument(lead.id, file, docType)}
          onDeleteDocument={(docId) => handleDeleteDocument(lead.id, docId)}
          onEditLead={() => handleOpenLeadForm(lead)}
          onAddTask={(content, dueDate, priority) => handleAddTask(lead.id, content, dueDate, priority)}
          onUpdateTask={(task) => handleUpdateTask(lead.id, task)}
          onDeleteTask={(taskId) => handleDeleteTask(lead.id, taskId)}
        />;
      }
      // Lead not found – show friendly fallback instead of "Page not found"
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-bold text-slate-800">Lead Not Found</h2>
          <p className="text-slate-500 max-w-md">This lead may have been removed or you may not have permission to view it.</p>
          <button onClick={handleBackFromDetail} className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Go Back</button>
        </div>
      );
    }

    if (activePage === 'Customer Detail' && viewingCustomerId) {
      // Try direct ID match first, then fallback to lead_id match (for notifications that store lead ID)
      const customer = customers.find(c => c.id === viewingCustomerId) ||
                       customers.find(c => c.lead_id === viewingCustomerId);
      if (customer) {
        return <CustomerDetail 
          customer={customer} 
          onBack={handleBackFromDetail} 
          leads={leads} 
          onAddActivityToLead={addActivityToLead} 
          refreshData={refreshData} 
          onUpdateCustomer={updateCustomer}
        />;
      }
      // Customer not found – show friendly fallback instead of "Page not found"
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-bold text-slate-800">Customer Not Found</h2>
          <p className="text-slate-500 max-w-md">This customer record may have been removed or you may not have permission to view it.</p>
          <button onClick={handleBackFromDetail} className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Go Back</button>
        </div>
      );
    }

    if (activePage === 'Create New Lead') {
      return <CreateLead onAddLead={handleAddLead} onCancel={handleCancelCreateLead} salesExecutives={activeSalesExecutives} services={services} leads={leads} offers={offers} />;
    }

    if (activePage === 'Dashboard') {
      return <DashboardOverview
        leads={roleScopedLeads}
        users={users}
        customers={customers}
        branches={branches}
        cities={cities}
        userActivities={userActivities}
        currentUser={viewProfile!}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onViewCustomer={handleViewCustomer}
        onViewLead={handleViewLead}
        onNavigate={setActivePage}
        services={services}
        onAddActivityToLead={addActivityToLead}
        refreshData={refreshData}
        testimonials={testimonials}
      />;
    }

    // --- Page-Level Role Guards ---
    const isSuperAdmin = viewProfile!.role === 'Super Admin';
    const isAdminOrAbove = ['Super Admin', 'Admin', 'Branch Manager'].includes(viewProfile!.role);
    const isSalesExec = viewProfile!.role === 'Sales Executive';

    const AccessDenied = ({ requiredRole }: { requiredRole: string }) => (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 max-w-md">You don't have permission to view this page. This section requires <strong>{requiredRole}</strong> access.</p>
        <button onClick={() => setActivePage('Dashboard')} className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Go to Dashboard</button>
      </div>
    );

    switch (activePage) {
      case 'Branch Management':
        if (!isSuperAdmin) return <AccessDenied requiredRole="Super Admin" />;
        return <BranchManagement 
              branches={branches} 
              users={users} 
              cities={cities}
              onAddBranch={addBranch} 
              onAddCity={addCity}
              onUpdateBranch={updateBranch} 
              onDeleteBranch={deleteBranch} 
              onNavigateToUsers={(branchName) => {
                setUserManagementBranchFilter(branchName);
                handleNavigate('User Management');
              }}
              onUploadLogo={(file) => uploadBranchLogo(file)}
            />;
      case 'User Management':
        if (!isAdminOrAbove) return <AccessDenied requiredRole="Admin or Super Admin" />;
        return <UserManagement 
                 users={globallyFilteredUsers} 
                 cities={availableCities}
                 branches={availableBranches}
                 onOpenUserForm={handleOpenUserForm} 
                 onUpdateUser={handleUpdateUser} 
                 onDeleteUsers={handleBulkDeleteUsers} 
                 dateRange={dateRange} 
                 setDateRange={setDateRange} 
                 userActivities={globallyFilteredActivities} 
                 currentUserRole={viewProfile!.role} 
                 currentUser={viewProfile!}
                 initialBranchFilter={userManagementBranchFilter}
                 onFilterClear={() => setUserManagementBranchFilter(null)}
                 onTransferUser={transferUser}
               />;
      case 'All Leads':
      case 'Leads Overview':
        return <LeadsOverview currentUser={viewProfile!} leads={globallyFilteredLeads} users={globallyFilteredUsers} services={services} offers={offers} onAddLead={handleNavigateToCreateLead} onUpdateLead={handleUpdateLead} onViewLead={handleViewLead} onUpdateMultipleLeads={handleBulkUpdateLeads} onDeleteMultipleLeads={handleBulkDeleteLeads} dateRange={dateRange} setDateRange={setDateRange} title="All Leads" />;
      case 'Lead Workflow':
        return <LeadWorkflow
          currentUser={viewProfile!}
          leads={globallyFilteredLeads}
          onUpdateLead={handleUpdateLead}
          onViewLead={handleViewLead}
          onAddLead={handleNavigateToCreateLead}
          onDeleteLeads={handleBulkDeleteLeads}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onOpenLeadForm={handleOpenLeadForm}
        />;
      case 'Customers':
        return <Customers customers={globallyFilteredCustomers} users={globallyFilteredUsers} onViewCustomer={handleViewCustomer} leads={globallyFilteredLeads} onViewLead={handleViewLead} services={services} />;
      case 'Reports & Analytics':
        if (!isAdminOrAbove) return <AccessDenied requiredRole="Admin or Super Admin" />;
        return <Reports userRole={viewProfile!.role} users={globallyFilteredUsers} allLeads={globallyFilteredLeads} customers={globallyFilteredCustomers} dateRange={dateRange} setDateRange={setDateRange} currentUser={viewProfile!} />;
      case 'Activity Feed':
        if (!isSuperAdmin) return <AccessDenied requiredRole="Super Admin" />;
        return <ActivityFeed userActivities={globallyFilteredActivities} users={globallyFilteredUsers} />;
      case 'System Settings':
        if (!isSuperAdmin) return <AccessDenied requiredRole="Super Admin" />;
        return <Settings currentUser={viewProfile!} transferLogs={transferLogs} auditLogs={auditLogs} />;
      case 'Lead Management':
        return <LeadsOverview currentUser={viewProfile!} leads={globallyFilteredLeads} users={globallyFilteredUsers} services={services} offers={offers} onAddLead={handleNavigateToCreateLead} onUpdateLead={handleUpdateLead} title="Lead Management" onViewLead={handleViewLead} onUpdateMultipleLeads={handleBulkUpdateLeads} onDeleteMultipleLeads={handleBulkDeleteLeads} dateRange={dateRange} setDateRange={setDateRange} />;
      case 'Team Management':
        if (!isAdminOrAbove) return <AccessDenied requiredRole="Admin or Super Admin" />;
        return <TeamManagement teamMembers={globallyFilteredUsers.filter((u: any) => u.role === 'Sales Executive')} allLeads={globallyFilteredLeads} dateRange={dateRange} setDateRange={setDateRange} onDeleteUsers={handleBulkDeleteUsers} />;
      case 'Document Verification':
        if (!isAdminOrAbove) return <AccessDenied requiredRole="Admin or Super Admin" />;
        return <DocumentVerification
          leads={globallyFilteredLeads}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onUpdateDocumentStatus={handleUpdateDocumentStatus}
        />;
      case 'Payments':
        if (!isSuperAdmin) return <AccessDenied requiredRole="Super Admin" />;
        return <PaymentTracker leads={globallyFilteredLeads} users={globallyFilteredUsers} currentUser={viewProfile!} onViewLead={handleViewLead} dateRange={dateRange} setDateRange={setDateRange} />;
      case 'Reports':
        return <Reports userRole={viewProfile!.role} users={globallyFilteredUsers} allLeads={globallyFilteredLeads} customers={globallyFilteredCustomers} dateRange={dateRange} setDateRange={setDateRange} currentUser={viewProfile!} />;
      case 'My Leads':
        return <LeadsOverview currentUser={viewProfile!} leads={globallyFilteredLeads.filter((l: any) => l.assigned_to?.id === viewProfile?.id)} users={globallyFilteredUsers} services={services} offers={offers} onAddLead={handleNavigateToCreateLead} onUpdateLead={handleUpdateLead} title="My Leads" onViewLead={handleViewLead} onUpdateMultipleLeads={handleBulkUpdateLeads} onDeleteMultipleLeads={handleBulkDeleteLeads} dateRange={dateRange} setDateRange={setDateRange} />;
      case 'Follow-ups':
        return <FollowUps leads={globallyFilteredLeads} dateRange={dateRange} setDateRange={setDateRange} onUpdateTask={(leadId, task) => handleUpdateTask(leadId, task)} onUpdateLead={handleUpdateLead} onViewLead={handleViewLead} />;
      case 'Client Documents':
        return <ClientDocuments
          leads={globallyFilteredLeads}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onUploadDocument={(leadId, file) => handleUploadDocument(leadId, file, 'Other Documents')}
          onDeleteDocument={handleDeleteDocument}
          onViewLead={handleViewLead}
        />;
      case 'Performance Report':
        return <Reports userRole={viewProfile!.role} leads={globallyFilteredLeads} customers={globallyFilteredCustomers} dateRange={dateRange} setDateRange={setDateRange} currentUser={viewProfile!} users={globallyFilteredUsers} />;
      case 'Notifications':
        return <Notifications
          notifications={userNotifications}
          onMarkAllRead={handleMarkNotificationsRead}
          onNavigate={(page, id) => {
            if (page === 'Lead Detail') handleViewLead(id);
            if (page === 'Customer Detail') handleViewCustomer(id);
          }}
        />;
      case 'Services':
        if (!isAdminOrAbove) return <AccessDenied requiredRole="Admin or Super Admin" />;
        return <ServiceManagement
          services={services}
          onAddService={addService}
          onUpdateService={updateService}
          onDeleteService={deleteService}
          onAddSubService={addSubService}
          onUpdateSubService={updateSubService}
          onDeleteSubService={deleteSubService}
        />;
      case 'Offers & Coupons':
        if (!isSuperAdmin) return <AccessDenied requiredRole="Super Admin" />;
        return <OffersManagement
          offers={offers}
          services={services}
          onAddOffer={addOffer}
          onUpdateOffer={updateOffer}
          onDeleteOffer={deleteOffer}
        />;
      case '24efiling Web':
        if (!isAdminOrAbove) return <AccessDenied requiredRole="Admin or Super Admin" />;
        return <WebOverview
          services={services}
          onAddWebLead={addWebLead}
          webLeads={webLeads}
          blogs={blogs}
          testimonials={testimonials}
          onUpdateWebLead={updateWebLead}
          onDeleteWebLeads={deleteMultipleWebLeads}
        />;
      case 'Web Leads':
        if (!isAdminOrAbove) return <AccessDenied requiredRole="Admin or Super Admin" />;
        return <WebLeadsManagement
          webLeads={webLeads}
          salesExecutives={users}
          onAssignWebLead={assignWebLead}
          onUpdateWebLeadStatus={updateWebLeadStatus}
          onConvertWebLeadToCrmLead={convertWebLeadToCrmLead}
        />;
      case 'Blogs':
        if (!isAdminOrAbove) return <AccessDenied requiredRole="Admin or Super Admin" />;
        return <BlogsManagement
          blogs={blogs}
          onAddBlog={addBlog}
          onUpdateBlog={updateBlog}
          onDeleteBlog={deleteBlog}
        />;
      case 'Testimonials':
        if (!isAdminOrAbove) return <AccessDenied requiredRole="Admin or Super Admin" />;
        return <TestimonialsManagement
          testimonials={testimonials}
          onAddTestimonial={addTestimonial}
          onUpdateTestimonialStatus={updateTestimonialStatus}
          onDeleteTestimonial={deleteTestimonial}
        />;
      default:
        return <div className="p-4"><h1 className="text-xl font-bold">Page not found</h1><p>The requested page '{activePage}' does not exist.</p></div>;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userRole={viewProfile.role}
        currentUser={viewProfile}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        users={globallyFilteredUsers}
        leads={globallyFilteredLeads}
        unreadCount={unreadCount}
      />
      <div className="flex flex-col md:ml-64 transition-all duration-300">
        <Header
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          currentUser={viewProfile}
          setActivePage={setActivePage}
          pageConfig={PAGE_CONFIG[activePage] || { title: activePage, subtitle: '' }}
          unreadCount={unreadCount}
        />
        {['Dashboard', 'All Leads', 'Customers', 'Payments', 'Reports', 'Activity Feed', 'User Management', 'Web Leads'].includes(activePage) && (
          <div className="w-full bg-white border-b border-slate-200">
            <GlobalFilterBar currentUserRole={viewProfile.role} />
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
          {renderPage()}
        </main>
      </div>
      <UserForm
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        branches={branches}
        cities={cities}
        initialBranchName={userManagementBranchFilter}
        allUsers={users}
      />
      <LeadForm
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        onSave={handleSaveLead}
        lead={editingLead}
        users={activeUsers}
        currentUser={viewProfile}
        services={services}
        offers={offers}
        onUploadDocument={editingLead ? (file) => handleUploadDocument(editingLead.id, file, 'Other Documents') : undefined}
        onDeleteDocument={editingLead ? (docId) => handleDeleteDocument(editingLead.id, docId) : undefined}
      />
      <SuccessConversionModal
        isOpen={!!leadForCustomerCreation}
        onClose={handleCancelCustomerCreation}
        onConfirm={handleConfirmCustomerCreation}
        lead={leadForCustomerCreation}
      />
    </div>
  );
}