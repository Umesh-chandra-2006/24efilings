import React, { useState, useRef, useMemo } from 'react';
import { Branch, User, City } from '../types';
import { Plus, Edit2, Trash2, Building, MapPin, Phone, Users, ShieldCheck, Mail, Upload, X, Image as ImageIcon, AlertTriangle, UserCheck, UserX, BarChart2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

interface BranchManagementProps {
  branches?: Branch[];
  users?: User[];
  cities?: City[];
  onAddBranch?: (branch: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateBranch?: (id: string, branch: Partial<Branch>) => Promise<void>;
  onDeleteBranch?: (id: string) => Promise<void>;
  onAddCity?: (cityName: string) => Promise<City>;
  onNavigateToUsers?: (branchName: string) => void;
  onUploadLogo?: (file: File) => Promise<string>;
}

export default function BranchManagement({
  branches = [],
  users = [],
  cities = [],
  onAddBranch = async () => {},
  onUpdateBranch = async () => {},
  onDeleteBranch = async () => {},
  onAddCity,
  onNavigateToUsers = () => {},
  onUploadLogo
}: BranchManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [cityInput, setCityInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city_id: '',
    address: '',
    phone: '',
    email: '',
    manager_id: '',
    is_active: true,
    logo_url: '' as string | null,
  });

  // Eligible managers: Branch Manager, Admin, Super Admin – active only
  const eligibleManagers = useMemo(() =>
    users.filter(u =>
      ['Branch Manager', 'Admin', 'Super Admin'].includes(u.role) && u.is_active
    ),
    [users]
  );

  // Dashboard stats derived from data
  const stats = useMemo(() => {
    const totalBranches = branches.length;
    const assignedBranches = branches.filter(b => !!(b as any).manager_id).length;
    const unassignedBranches = totalBranches - assignedBranches;
    const activeBranchManagers = users.filter(u => u.role === 'Branch Manager' && u.is_active).length;
    return { totalBranches, assignedBranches, unassignedBranches, activeBranchManagers };
  }, [branches, users]);

  const headOfficeBranch = useMemo(() =>
    branches.find(b => (b as any).is_head_office === true || b.code === 'HO-001'),
    [branches]
  );

  const handleOpenForm = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        code: branch.code || '',
        city_id: branch.city_id || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        manager_id: (branch as any).manager_id || '',
        is_active: branch.is_active ?? true,
        logo_url: branch.logo_url || null,
      });
      const existingCity = cities.find(c => c.id === branch.city_id);
      setCityInput(existingCity ? existingCity.city_name : '');
    } else {
      setEditingBranch(null);
      setFormData({
        name: '',
        code: '',
        city_id: '',
        address: '',
        phone: '',
        email: '',
        manager_id: '',
        is_active: true,
        logo_url: null,
      });
      setCityInput('');
    }
    setIsFormOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadLogo) return;
    try {
      setUploadingLogo(true);
      const url = await onUploadLogo(file);
      setFormData(prev => ({ ...prev, logo_url: url }));
    } catch (err: any) {
      alert("Failed to upload logo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalCityId = formData.city_id;

      if (cityInput.trim()) {
        const matchedCity = cities.find(c => c.city_name.toLowerCase() === cityInput.trim().toLowerCase());
        if (matchedCity) {
          finalCityId = matchedCity.id;
        } else if (onAddCity) {
          const newCity = await onAddCity(cityInput.trim());
          finalCityId = newCity.id;
        }
      }

      const payloadToSave = {
        ...formData,
        city_id: finalCityId,
        manager_id: formData.manager_id || null,  // Explicitly null when not assigned
      };

      if (editingBranch) {
        await onUpdateBranch(editingBranch.id, payloadToSave);
      } else {
        await onAddBranch(payloadToSave);
      }
      setIsFormOpen(false);
    } catch (error: any) {
      alert(`Error saving branch: ${error.message || 'Check database connection or columns.'}\n\nDid you run the FIX_BRANCH_MANAGER_OPTIONAL.sql script in Supabase SQL editor?`);
    }
  };

  const confirmDelete = async () => {
    if (branchToDelete) {
      await onDeleteBranch(branchToDelete);
      setIsDeleteOpen(false);
      setBranchToDelete(null);
    }
  };

  const isHeadOffice = (branch: Branch) =>
    (branch as any).is_head_office === true || branch.code === 'HO-001';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building className="h-8 w-8 text-blue-600" />
            Branch Management
          </h2>
          <p className="text-slate-500 mt-1">Manage all company branches, assign managers, and monitor regional activity.</p>
        </div>
        <Button onClick={() => handleOpenForm()} size="lg" className="gap-2 shadow-md">
          <Plus className="h-5 w-5" />
          Add Branch
        </Button>
      </div>

      {/* Branch Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalBranches}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Branches</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700">{stats.assignedBranches}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Assigned Branches</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stats.unassignedBranches > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
            <UserX className={`h-6 w-6 ${stats.unassignedBranches > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className={`text-2xl font-bold ${stats.unassignedBranches > 0 ? 'text-amber-600' : 'text-slate-700'}`}>{stats.unassignedBranches}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Unassigned</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.activeBranchManagers}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Branch Managers</p>
          </div>
        </div>
      </div>

      {/* Unassigned Alert Banner */}
      {stats.unassignedBranches > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            <span className="font-bold">{stats.unassignedBranches} {stats.unassignedBranches === 1 ? 'branch has' : 'branches have'} no manager assigned.</span>
            {' '}Edit each branch below and assign a Branch Manager to complete the setup.
          </p>
        </div>
      )}

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {branches.map((branch) => {
          const manager = users.find(u => u.id === (branch as any).manager_id);
          const employeesCount = users.filter(u => u.branch_id === branch.id).length;
          const isHO = isHeadOffice(branch);

          return (
            <Card key={branch.id} className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden border-0 shadow-md flex flex-col h-full bg-white">
              {/* Cover Area */}
              <div className={`h-20 relative ${isHO ? 'bg-gradient-to-r from-slate-700 to-slate-900' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
                {isHO && (
                  <div className="absolute top-4 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                    Permanent System Branch
                  </div>
                )}
                <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${branch.is_active ? 'bg-green-400/20 text-green-100 border border-green-400/30' : 'bg-slate-800/40 text-slate-300 border border-slate-500/50'}`}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Logo Area */}
              <div className="px-6 relative flex justify-between items-end -mt-10 mb-3">
                <div className="h-20 w-20 rounded-2xl bg-white p-1.5 shadow-lg border-2 border-slate-50 overflow-hidden relative group-hover:-translate-y-1 transition-transform">
                  {branch.logo_url ? (
                    <img src={branch.logo_url} alt={`${branch.name} Logo`} className="w-full h-full object-contain rounded-xl" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
                      <Building className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-white/90 shadow-sm text-slate-500 hover:text-blue-600 border-slate-200" onClick={() => handleOpenForm(branch)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  {!isHO && (
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-white/90 shadow-sm text-slate-500 hover:text-red-600 border-slate-200" onClick={() => { setBranchToDelete(branch.id); setIsDeleteOpen(true); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className="px-6 pb-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{branch.name}</h3>
                  <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest mt-0.5">{branch.code || 'NO CODE'}</p>
                </div>

                {/* Manager Section */}
                {manager ? (
                  <div className="mb-4 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 flex items-center gap-3">
                    {manager.avatar_url ? (
                      <img src={manager.avatar_url} alt={manager.name} className="h-9 w-9 rounded-full border-2 border-white shadow-sm object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-blue-200 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-bold text-xs">
                        {manager.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Branch Manager
                      </span>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{manager.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-amber-100 border-2 border-white shadow-sm flex items-center justify-center">
                      <UserX className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Branch Manager
                      </span>
                      <p className="text-sm font-semibold text-amber-700 leading-tight">Not Assigned</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs text-slate-600 mb-4 flex-1">
                  {branch.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-snug">{branch.address}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700">{branch.phone}</span>
                    </div>
                  )}
                  {branch.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{branch.email}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <button
                    onClick={() => onNavigateToUsers && onNavigateToUsers(branch.name)}
                    className="w-full flex items-center justify-between bg-slate-50 hover:bg-blue-50 p-3 rounded-lg transition-colors border border-slate-100 group/btn"
                  >
                    <div className="flex items-center gap-2 text-slate-600 group-hover/btn:text-blue-700 font-medium text-sm">
                      <Users className="h-4 w-4" />
                      View Personnel
                    </div>
                    <span className="bg-white group-hover/btn:bg-blue-600 group-hover/btn:text-white text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm transition-colors">
                      {employeesCount}
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {branches.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Branches Setup</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
              Get started by creating your first business branch. You can assign a Branch Manager later.
            </p>
            <Button onClick={() => handleOpenForm()} size="lg" className="shadow-md">
              <Plus className="h-4 w-4 mr-2" /> Add Your First Branch
            </Button>
          </div>
        )}
      </div>

      {/* Branch Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 flex flex-col border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingBranch ? 'Edit Branch Profile' : 'Setup New Branch'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Fill in the details to configure this branch. Branch Manager can be assigned later.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">

              {/* Logo Upload Section */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors relative group">
                {formData.logo_url ? (
                  <div className="relative">
                    <img src={formData.logo_url} alt="Logo preview" className="h-24 object-contain rounded-lg shadow-sm bg-white p-2 border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo_url: null }))}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      {uploadingLogo ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" /> : <Upload className="h-5 w-5" />}
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Upload Branch Logo</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingLogo || !onUploadLogo}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* City */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">City <span className="text-red-500">*</span></label>
                  <input
                    required
                    list="city-options"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Search or add a city..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <datalist id="city-options">
                    {cities.filter(c => c.status).map(city => (
                      <option key={city.id} value={city.city_name} />
                    ))}
                  </datalist>
                </div>

                {/* Branch Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Branch / Locality Name <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="e.g., Kukatpally"
                  />
                </div>

                {/* Branch Code */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Branch Code <span className="text-slate-400 font-normal text-xs">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="e.g., HYD-KUK-01"
                  />
                </div>

                {/* Branch Manager – OPTIONAL */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Branch Manager
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Optional</span>
                  </label>
                  <select
                    value={formData.manager_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, manager_id: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="">— Not Assigned —</option>
                    {eligibleManagers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    You can create the branch now and assign a manager later via <strong>Edit Branch</strong>.
                  </p>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="e.g., +91 98765 43210"
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Contact Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="e.g., branch@company.com"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Physical Address</label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                    placeholder="Enter complete branch address..."
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Branch is Active</span>
                    <span className="text-xs text-slate-500">Inactive branches will not be available for selection across the system.</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                <Button type="button" variant="outline" size="lg" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={uploadingLogo}>
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Branch"
        description="Are you sure you want to delete this branch? This action will not delete associated users, but they will need to be reassigned. This action cannot be undone."
        confirmButtonText="Delete Branch"
        cancelButtonText="Cancel"
      />
    </div>
  );
}
