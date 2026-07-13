import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { GlobalFilterBar } from '@/components/ui/GlobalFilterBar';
import { UserForm } from '@/components/UserForm';
import { LeadForm } from '@/components/LeadForm';
import { SuccessConversionModal } from '@/components/ui/SuccessConversionModal';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useGlobalFilter } from '@/contexts/GlobalFilterContext';
import { useToast } from '@/components/Toast';
import { User, Lead, TaskPriority, Task } from '@/types';

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

const pathToPageMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/branch-management': 'Branch Management',
  '/user-management': 'User Management',
  '/leads': 'All Leads',
  '/leads/new': 'Create New Lead',
  '/leads/my': 'My Leads',
  '/leads/workflow': 'Lead Workflow',
  '/customers': 'Customers',
  '/payments': 'Payments',
  '/reports': 'Reports',
  '/activity-feed': 'Activity Feed',
  '/system-settings': 'System Settings',
  '/team-management': 'Team Management',
  '/documents': 'Document Verification',
  '/follow-ups': 'Follow-ups',
  '/client-documents': 'Client Documents',
  '/notifications': 'Notifications',
  '/services': 'Services',
  '/offers-coupons': 'Offers & Coupons',
  '/24efiling-web': '24efiling Web',
  '/web-leads': 'Web Leads',
  '/blogs': 'Blogs',
  '/testimonials': 'Testimonials'
};

const uploadAvatar = async (fileData: string | undefined, fileNamePrefix: string): Promise<string | undefined> => {
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

const getLocalDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

import { supabase } from '@/lib/supabaseClient';

export const AppShell = () => {
  const { profile, signOut, createUserByAdmin, refreshProfile } = useAuth();
  const apiData = useApi();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const outlet = useOutlet();
  const { dateRange: globalFilterDateRange, setDateRange: setGlobalFilterDateRange } = useGlobalFilter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadForCustomerCreation, setLeadForCustomerCreation] = useState<Lead | null>(null);

  const {
    leads,
    users,
    customers,
    notifications,
    updateLead,
    updateUser,
    refreshData,
    addLead,
    addNotification,
    updateMultipleLeads,
    deleteMultipleLeads,
    deleteMultipleUsers,
    uploadDocument,
    deleteDocument,
    updateDocumentStatus,
    addTaskToLead,
    updateTaskOnLead,
    deleteTaskFromLead,
    services,
    offers,
    branches,
    cities
  } = apiData;

  // Active page resolution
  const activePage = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/leads/')) {
      if (path === '/leads/new') return 'Create New Lead';
      if (path === '/leads/my') return 'My Leads';
      if (path === '/leads/workflow') return 'Lead Workflow';
      return 'Lead Detail';
    }
    if (path.startsWith('/customers/')) {
      return 'Customer Detail';
    }
    return pathToPageMap[path] || 'Dashboard';
  }, [location.pathname]);

  const unreadCount = useMemo(() => {
    if (!profile) return 0;
    return notifications.filter((n: any) => n.user_id === profile.id && !n.is_read).length;
  }, [notifications, profile]);

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/login');
  }, [signOut, navigate]);

  const handleUpdateLead = useCallback(async (leadData: Lead) => {
    const originalLead = leads.find((l: any) => l.id === leadData.id);

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
      await refreshData();
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

  const handleSaveUser = useCallback(async (userData: (User | Omit<User, 'id'>) & { password?: string }) => {
    if ('id' in userData) {
      await handleUpdateUser(userData);
    } else {
      await handleAddUser(userData);
    }
    setIsUserFormOpen(false);
  }, [handleUpdateUser, handleAddUser]);

  const handleSaveLead = useCallback(async (leadData: Lead | Omit<Lead, 'id' | 'created_at' | 'last_contacted'>) => {
    if ('id' in leadData) {
      await handleUpdateLead(leadData);
    }
    setIsLeadFormOpen(false);
    setEditingLead(null);
  }, [handleUpdateLead]);

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

  const activeUsers = useMemo(() => users.filter((u: any) => u.is_active), [users]);

  // Filters visibility check
  const showFilters = useMemo(() => {
    return ['Dashboard', 'All Leads', 'Customers', 'Payments', 'Reports', 'Activity Feed', 'User Management', 'Web Leads'].includes(activePage);
  }, [activePage]);

  if (!profile) return null;

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userRole={profile.role}
        currentUser={profile}
        activePage={activePage}
        setActivePage={(page) => {
          if (page === 'Dashboard') navigate('/dashboard');
          else if (page === 'All Leads') navigate('/leads');
          else if (page === 'My Leads') navigate('/leads/my');
          else if (page === 'Lead Workflow') navigate('/leads/workflow');
          else if (page === 'Customers') navigate('/customers');
          else if (page === 'User Management') navigate('/user-management');
          else if (page === 'Team Management') navigate('/team-management');
          else if (page === 'Reports & Analytics' || page === 'Reports') navigate('/reports');
          else if (page === 'Activity Feed') navigate('/activity-feed');
          else if (page === 'System Settings') navigate('/system-settings');
          else if (page === 'Follow-ups') navigate('/follow-ups');
          else if (page === 'Notifications') navigate('/notifications');
          else if (page === 'Create New Lead') navigate('/leads/new');
          else if (page === 'Payments') navigate('/payments');
          else if (page === 'Branch Management') navigate('/branch-management');
          else if (page === 'Services') navigate('/services');
          else if (page === 'Offers & Coupons') navigate('/offers-coupons');
          else if (page === '24efiling Web') navigate('/24efiling-web');
          else if (page === 'Web Leads') navigate('/web-leads');
          else if (page === 'Blogs') navigate('/blogs');
          else if (page === 'Testimonials') navigate('/testimonials');
        }}
        onLogout={handleLogout}
        users={users}
        leads={leads}
        unreadCount={unreadCount}
      />
      <div className="flex flex-col md:ml-64 transition-all duration-300">
        <Header
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          currentUser={profile}
          setActivePage={(page) => {
            if (page === 'Notifications') navigate('/notifications');
          }}
          pageConfig={PAGE_CONFIG[activePage] || { title: activePage, subtitle: '' }}
          unreadCount={unreadCount}
        />
        {showFilters && (
          <div className="w-full bg-white border-b border-slate-200">
            <GlobalFilterBar currentUserRole={profile.role} />
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
          {outlet ? React.cloneElement(outlet as React.ReactElement, {
            leads,
            users,
            customers,
            branches,
            cities,
            testimonials: apiData.testimonials || [],
            userActivities: apiData.userActivities || [],
            services,
            offers,
            notifications,
            currentUser: profile,
            
            dateRange: {
              from: globalFilterDateRange.from ? getLocalDateString(globalFilterDateRange.from) : '',
              to: globalFilterDateRange.to ? getLocalDateString(globalFilterDateRange.to) : ''
            },
            setDateRange: (range: { from: string; to: string }) => {
              setGlobalFilterDateRange({
                from: range?.from ? new Date(range.from) : undefined,
                to: range?.to ? new Date(range.to) : undefined
              });
            },

            onViewCustomer: (customerId: string) => navigate(`/customers/${customerId}`),
            onViewLead: (leadId: string) => navigate(`/leads/${leadId}`),
            onNavigate: (page: string) => {
              if (page === 'Dashboard') navigate('/dashboard');
              else if (page === 'All Leads') navigate('/leads');
              else if (page === 'My Leads') navigate('/leads/my');
              else if (page === 'Lead Workflow') navigate('/leads/workflow');
              else if (page === 'Customers') navigate('/customers');
              else if (page === 'User Management') navigate('/user-management');
              else if (page === 'Team Management') navigate('/team-management');
              else if (page === 'Reports & Analytics' || page === 'Reports') navigate('/reports');
              else if (page === 'Activity Feed') navigate('/activity-feed');
              else if (page === 'System Settings') navigate('/system-settings');
              else if (page === 'Follow-ups') navigate('/follow-ups');
              else if (page === 'Notifications') navigate('/notifications');
              else if (page === 'Create New Lead') navigate('/leads/new');
              else if (page === 'Payments') navigate('/payments');
              else if (page === 'Branch Management') navigate('/branch-management');
              else if (page === 'Services') navigate('/services');
              else if (page === 'Offers & Coupons') navigate('/offers-coupons');
              else if (page === '24efiling Web') navigate('/24efiling-web');
              else if (page === 'Web Leads') navigate('/web-leads');
              else if (page === 'Blogs') navigate('/blogs');
              else if (page === 'Testimonials') navigate('/testimonials');
            },

            onAddLead: addLead,
            onUpdateLead: updateLead,
            onUpdateUser: updateUser,
            onDeleteLeads: deleteMultipleLeads,
            onDeleteUsers: deleteMultipleUsers,
            onUploadDocument: handleUploadDocument,
            onDeleteDocument: handleDeleteDocument,
            onUpdateDocumentStatus: updateDocumentStatus,
            onAddTask: addTaskToLead,
            onUpdateTask: updateTaskOnLead,
            onDeleteTask: deleteTaskFromLead,
            onAddActivityToLead: apiData.addActivityToLead,
            refreshData,

            isLeadFormOpen,
            setIsLeadFormOpen,
            editingLead,
            setEditingLead,
            isUserFormOpen,
            setIsUserFormOpen,
            editingUser,
            setEditingUser,
            handleOpenLeadForm: (lead: Lead | null) => {
              setEditingLead(lead);
              setIsLeadFormOpen(true);
            },
            handleOpenUserForm: (user: User | null) => {
              setEditingUser(user);
              setIsUserFormOpen(true);
            }
          }) : null}
        </main>
      </div>

      <UserForm
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        branches={branches}
        cities={cities}
        initialBranchName={null}
        allUsers={users}
      />

      <LeadForm
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        onSave={handleSaveLead}
        lead={editingLead}
        users={activeUsers}
        currentUser={profile}
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
};
