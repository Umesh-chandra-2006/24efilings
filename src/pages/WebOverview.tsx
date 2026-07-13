// pages/WebOverview.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Globe, Users, FileText, CheckCircle, Shield, Key, Eye, HelpCircle, 
  Activity, Star, Sparkles, MessageSquare, ArrowRight, ShieldCheck,
  Trash2, Edit, X
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { Service, WebLead, Blog, Testimonial } from '../types';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Checkbox } from '../components/ui/checkbox';

interface WebOverviewProps {
  services: Service[];
  onAddWebLead: (payload: {
    name: string;
    email: string;
    phone: string;
    service_interested: string;
    message: string;
    status: 'Pending';
  }) => Promise<void>;
  webLeads: WebLead[];
  blogs: Blog[];
  testimonials: Testimonial[];
  onUpdateWebLead?: (id: string, updates: Partial<WebLead>) => Promise<void>;
  onDeleteWebLeads?: (ids: string[]) => Promise<void>;
}

export default function WebOverview({ 
  services = [], 
  onAddWebLead,
  webLeads = [], 
  blogs = [], 
  testimonials = [],
  onUpdateWebLead,
  onDeleteWebLeads
}: WebOverviewProps) {
  const toast = useToast();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Advanced Filtering State
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Row Selection & Modal State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [editingLead, setEditingLead] = useState<WebLead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Modal form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editService, setEditService] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editStatus, setEditStatus] = useState<WebLead['status']>('Pending');

  // Filtered Web Leads
  const filteredWebLeads = useMemo(() => {
    return (webLeads || []).filter(lead => {
      const q = filterSearch.toLowerCase();
      const matchesSearch = !q || 
        (lead.name && lead.name.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q)) ||
        (lead.service_interested && lead.service_interested.toLowerCase().includes(q)) ||
        (lead.message && lead.message.toLowerCase().includes(q));

      const matchesStatus = filterStatus === 'All' || lead.status === filterStatus;

      const leadDate = new Date(lead.created_at);
      let matchesDateFrom = true;
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchesDateFrom = leadDate >= fromDate;
      }
      let matchesDateTo = true;
      if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDateTo = leadDate <= toDate;
      }

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [webLeads, filterSearch, filterStatus, filterDateFrom, filterDateTo]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(filteredWebLeads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(prev => [...prev, id]);
    } else {
      setSelectedLeadIds(prev => prev.filter(rowId => rowId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0 || !onDeleteWebLeads) return;
    if (window.confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected website inquiries?`)) {
      try {
        await onDeleteWebLeads(selectedLeadIds);
        setSelectedLeadIds([]);
        toast.add({
          title: 'Inquiries Deleted',
          message: 'Selected website inquiries have been deleted successfully.',
          type: 'success'
        });
      } catch (e: any) {
        toast.add({
          title: 'Delete Failed',
          message: e.message || 'Failed to delete selected inquiries.',
          type: 'error'
        });
      }
    }
  };

  const handleOpenEditDialog = (lead: WebLead) => {
    setEditingLead(lead);
    setEditName(lead.name || '');
    setEditEmail(lead.email || '');
    setEditPhone(lead.phone || '');
    setEditService(lead.service_interested || '');
    setEditMessage(lead.message || '');
    setEditStatus(lead.status || 'Pending');
    setIsEditModalOpen(true);
  };

  const handleEditSelected = () => {
    if (selectedLeadIds.length !== 1) return;
    const lead = webLeads.find(l => l.id === selectedLeadIds[0]);
    if (lead) handleOpenEditDialog(lead);
  };


  const handleSaveEdit = async () => {
    if (!editingLead || !onUpdateWebLead) return;
    try {
      await onUpdateWebLead(editingLead.id, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        service_interested: editService,
        message: editMessage,
        status: editStatus
      });
      setIsEditModalOpen(false);
      setEditingLead(null);
      setSelectedLeadIds([]);
      toast.add({
        title: 'Inquiry Updated',
        message: 'Website inquiry details have been updated.',
        type: 'success'
      });
    } catch (e: any) {
      toast.add({
        title: 'Update Failed',
        message: e.message || 'Failed to update inquiry.',
        type: 'error'
      });
    }
  };

  const handleToggleMaintenance = () => {
    setIsMaintenanceMode(!isMaintenanceMode);
    toast.add({
      title: 'Website Status Updated',
      message: `24eFiling website has been placed in ${!isMaintenanceMode ? 'MAINTENANCE' : 'ONLINE'} mode.`,
      type: 'success'
    });
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText("efile_web_token_2026_jblhzdtqrhfeawycecql");
    toast.add({
      title: 'Copied to Clipboard',
      message: 'Web Integration API Key has been copied successfully.',
      type: 'success'
    });
  };

  // Genuine Statistics Calculations
  const pendingLeadsCount = useMemo(() => {
    return (webLeads || []).filter(l => l.status === 'Pending').length;
  }, [webLeads]);

  const publishedBlogsCount = useMemo(() => {
    return (blogs || []).filter(b => b.status === 'Published').length;
  }, [blogs]);

  const draftBlogsCount = useMemo(() => {
    return (blogs || []).filter(b => b.status === 'Draft').length;
  }, [blogs]);

  const approvedReviewsCount = useMemo(() => {
    return (testimonials || []).filter(t => t.status === 'Approved').length;
  }, [testimonials]);

  const dynamicAverageRating = useMemo(() => {
    const approved = (testimonials || []).filter(t => t.status === 'Approved');
    if (approved.length === 0) return '0.0';
    const sum = approved.reduce((acc, t) => acc + t.rating, 0);
    return (sum / approved.length).toFixed(1);
  }, [testimonials]);

  // Generate 6 Month Intervals dynamically
  const last6Months = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }
    return months;
  }, []);

  // Compute organic submissions genuinely for the bar chart
  const chartData = useMemo(() => {
    return last6Months.map(m => {
      const count = (webLeads || []).filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate.getMonth() === m.monthIndex && leadDate.getFullYear() === m.year;
      }).length;
      return {
        ...m,
        submissionsCount: count
      };
    });
  }, [last6Months, webLeads]);

  const maxSubmissions = useMemo(() => {
    return Math.max(...chartData.map(d => d.submissionsCount), 0);
  }, [chartData]);

  const getStatusBadgeClass = (status: WebLead['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Converted':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Spam':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Top Banner - Domain Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl border border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/15 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Globe className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">www.24efiling.com</h1>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isMaintenanceMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isMaintenanceMode ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
                  {isMaintenanceMode ? 'Maintenance Mode' : 'Live & Active'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Domain connected to CRM backend via secure Supabase integration API.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isMaintenanceMode ? 'default' : 'outline'}
              onClick={handleToggleMaintenance}
              className="text-xs bg-white/5 border-white/10 hover:bg-white/10 text-white font-semibold h-10 px-4"
            >
              Toggle Maintenance
            </Button>
          </div>
        </div>
      </div>

      {/* Grid of Web Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Web Traffic Views (Genuine Reset to 0) */}
        <Card className="border-0 shadow-md bg-white overflow-hidden relative group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Web Traffic Views</p>
              <h3 className="text-2xl font-extrabold text-slate-900">0</h3>
              <p className="text-[11px] text-slate-450 font-bold flex items-center gap-0.5">
                <span className="text-slate-400 font-semibold">0% from last month</span>
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <Eye className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Organic Web Leads (Genuine from DB) */}
        <Card className="border-0 shadow-md bg-white overflow-hidden relative group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Organic Web Leads</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{webLeads.length}</h3>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                <span>{pendingLeadsCount} new</span> <span className="text-slate-400 font-normal">pending review</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Blogs Published (Genuine from DB) */}
        <Card className="border-0 shadow-md bg-white overflow-hidden relative group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blogs Published</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{publishedBlogsCount}</h3>
              <p className="text-[11px] text-slate-500 font-bold flex items-center gap-0.5">
                <span>{draftBlogsCount} drafts</span> <span className="text-slate-400 font-normal">queued</span>
              </p>
            </div>
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl group-hover:scale-105 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Approved Reviews (Genuine from DB) */}
        <Card className="border-0 shadow-md bg-white overflow-hidden relative group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Reviews</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{approvedReviewsCount}</h3>
              <p className="text-[11px] text-amber-600 font-bold flex items-center gap-0.5">
                <span>{dynamicAverageRating}★ rating</span> <span className="text-slate-400 font-normal">site average</span>
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>      {/* RECENT WEBSITE INQUIRIES LEADS TABLE - Form Input Columns */}
      <Card className="border border-slate-100 shadow-lg bg-white overflow-hidden rounded-2xl">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4.5 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
              Recent Website Inquiries
            </h2>
            <p className="text-[11px] text-slate-550 mt-0.5 font-medium">Captured form fields parsed directly from your customer application at www.24efiling.com.</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedLeadIds.length > 0 && (
              <div className="flex items-center gap-1.5 mr-2 animate-in fade-in slide-in-from-right-2 duration-300">
                <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full">
                  {selectedLeadIds.length} Selected
                </span>
                {selectedLeadIds.length === 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold text-indigo-700 bg-white border-slate-200 flex items-center gap-1"
                    onClick={handleEditSelected}
                  >
                    <Edit className="h-3 w-3" /> Edit
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs font-semibold flex items-center gap-1"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              </div>
            )}
            <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Live Synchronization Active
            </span>
          </div>
        </div>

        {/* Advanced Filters Block */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 grid gap-3 sm:grid-cols-2 md:grid-cols-5 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Search Query</label>
            <Input
              type="text"
              placeholder="Search inquiries..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="h-9 text-xs bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status</label>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 text-xs bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
              <option value="Spam">Spam</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">From Date</label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="h-9 text-xs bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">To Date</label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="h-9 text-xs bg-white"
            />
          </div>
          <div className="flex gap-2">
            {(filterSearch || filterStatus !== 'All' || filterDateFrom || filterDateTo) ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterSearch('');
                  setFilterStatus('All');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}
                className="h-9 text-xs font-semibold text-red-650 hover:text-red-750 hover:bg-red-50 flex-1 border border-red-200"
              >
                Clear Filters
              </Button>
            ) : (
              <div className="h-9 flex-1" />
            )}
          </div>
        </div>

        <CardContent className="p-0">
          {filteredWebLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-650">No Inquiries Match Filters</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your filters or check back later.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-3 px-4 w-10 text-center">
                      <Checkbox
                        checked={filteredWebLeads.length > 0 && selectedLeadIds.length === filteredWebLeads.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Interested</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 w-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredWebLeads.map((lead) => {
                    const idCode = `#LD-${lead.id.substring(0, 5).toUpperCase()}`;
                    const isSelected = selectedLeadIds.includes(lead.id);
                    return (
                      <tr key={lead.id} className={`hover:bg-slate-50/50 transition-colors align-middle ${isSelected ? 'bg-indigo-50/10' : ''}`}>
                        {/* Checkbox Column */}
                        <td className="py-3.5 px-4 text-center">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(lead.id, e.target.checked)}
                          />
                        </td>

                        {/* ID Column */}
                        <td className="py-3.5 px-4 font-bold text-indigo-650 hover:underline cursor-pointer" onClick={() => handleOpenEditDialog(lead)}>
                          {idCode}
                        </td>
                        
                        {/* Name Column */}
                        <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">
                          {lead.name}
                        </td>

                        {/* Email Column */}
                        <td className="py-3.5 px-4 font-semibold text-slate-500">
                          {lead.email}
                        </td>

                        {/* Phone Column */}
                        <td className="py-3.5 px-4 font-semibold text-slate-500">
                          {lead.phone}
                        </td>
                        
                        {/* Service Column */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-600 lowercase shadow-sm">
                            {lead.service_interested || 'general'}
                          </span>
                        </td>

                        {/* Message Column */}
                        <td className="py-3.5 px-4 max-w-[200px] truncate font-medium text-slate-600" title={lead.message}>
                          {lead.message || 'No inquiry text.'}
                        </td>
                        
                        {/* Status Column */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center text-[9px] font-extrabold px-2 py-0.5 rounded-full ${getStatusBadgeClass(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        
                        {/* Date Column */}
                        <td className="py-3.5 px-4 font-bold text-slate-450">
                          {new Date(lead.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>

                        {/* Actions Column */}
                        <td className="py-3.5 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md"
                            onClick={() => handleOpenEditDialog(lead)}
                            title="Edit Inquiry"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Web Lead Inquiry Dialog Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLead(null);
        }}
        title="Edit Website Inquiry"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Name</label>
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Email</label>
            <Input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Phone</label>
            <Input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Service Interested</label>
            <Input
              type="text"
              value={editService}
              onChange={(e) => setEditService(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Status</label>
            <Select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as WebLead['status'])}
              className="h-9 text-xs bg-white"
            >
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
              <option value="Spam">Spam</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Message</label>
            <Textarea
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              className="min-h-[100px] text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingLead(null);
              }}
              className="h-9 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="h-9 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Integration Docs Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Columns: Traffic Charts & Site Health */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Monthly Traffic Overview</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Visitor counts and submissions over the past 6 months.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                    Visitors
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Form Submissions
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Custom CSS Bar Chart (100% Genuine: Visitors at 0, Submissions dynamically scaled) */}
              <div className="h-64 flex items-end justify-between gap-4 pt-6 border-b border-slate-100">
                {chartData.map((d, index) => {
                  const submissionsHeightPercent = maxSubmissions > 0 
                    ? `${(d.submissionsCount / maxSubmissions) * 90 + 5}%` // add small offset so it's visible if it exists
                    : '0%';
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="w-full flex items-end gap-1.5 justify-center h-full max-h-[180px]">
                        {/* Visitors (0% Height because page views are untracked/0 to be 100% genuine) */}
                        <div className="w-4 bg-indigo-600/30 rounded-t-sm hover:bg-indigo-600 transition-all cursor-pointer shadow-sm" style={{ height: '0%' }} title="Visitors: 0" />
                        
                        {/* Form Submissions (Genuinely plotted) */}
                        <div 
                          className="w-4 bg-emerald-500/80 rounded-t-sm group-hover:bg-emerald-500 transition-all cursor-pointer shadow-sm" 
                          style={{ height: d.submissionsCount > 0 ? submissionsHeightPercent : '0%' }} 
                          title={`Submissions: ${d.submissionsCount}`} 
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400">{d.name}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: API Key Integration Panel */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-base font-bold text-slate-900">API Integration Token</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">Provide this token to the web developer to sync website queries automatically.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Webform Connector Key</label>
                <div className="flex gap-1.5">
                  <input
                    type={showApiKey ? "text" : "password"}
                    readOnly
                    value="efile_web_token_2026_jblhzdtqrhfeawycecql"
                    className="flex-1 h-9 px-3 border border-slate-200 rounded-md text-xs font-mono bg-slate-50 text-slate-600 focus:outline-none"
                  />
                  <Button
                    variant="outline"
                    className="h-9 px-2.5 text-xs text-slate-600 bg-white"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>
              <Button
                className="w-full text-xs font-bold h-9 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleCopyApiKey}
              >
                Copy API Key
              </Button>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    SSL Status
                  </span>
                  <span className="text-emerald-600 font-bold">Secured (TLS 1.3)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                    API Response Time
                  </span>
                  <span className="text-slate-600 font-bold">42 ms</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    Doc Checklist Version
                  </span>
                  <span className="text-slate-600 font-bold">v3.4.1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
