import React, { useMemo } from 'react';
import { City, Branch, UserRole } from '../../types';
import { Search, MapPin, Building, Shield, LayoutGrid, List, Network } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { USER_ROLES_WITH_DESCRIPTIONS } from '../../constants';

interface UserFilterBarProps {
  cities: City[];
  branches: Branch[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'grid' | 'table' | 'tree';
  setViewMode: (mode: 'grid' | 'table' | 'tree') => void;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  cities,
  branches,
  selectedCity,
  setSelectedCity,
  selectedBranch,
  setSelectedBranch,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode
}) => {

  const cityOptions = useMemo(() => {
    return ['All Cities', ...cities.map(c => c.city_name)];
  }, [cities]);

  const branchOptions = useMemo(() => {
    if (selectedCity === 'All Cities') {
      return ['All Branches'];
    }
    const cityId = cities.find(c => c.city_name === selectedCity)?.id;
    const filteredBranches = branches.filter(b => b.city_id === cityId).map(b => b.name);
    return ['All Branches', ...filteredBranches];
  }, [selectedCity, branches, cities]);

  // When city changes, reset branch if it's no longer valid in the new city
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    setSelectedBranch('All Branches'); // Reset branch on city change
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-4">
      {/* Top Row: Search & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, code..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1c398e] focus:border-[#1c398e] outline-none transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md flex items-center justify-center transition-all ${
              viewMode === 'grid' 
                ? 'bg-white text-[#1c398e] shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md flex items-center justify-center transition-all ${
              viewMode === 'table' 
                ? 'bg-white text-[#1c398e] shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`p-2 rounded-md flex items-center justify-center transition-all ${
              viewMode === 'tree' 
                ? 'bg-white text-[#1c398e] shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
            title="Organization Tree View"
          >
            <Network className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* City Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1c398e] focus:border-[#1c398e] outline-none appearance-none text-sm text-slate-700"
            value={selectedCity}
            onChange={handleCityChange}
          >
            {cityOptions.map((city, idx) => (
              <option key={idx} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Branch Filter */}
        <div className="relative">
          <Building className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${selectedCity === 'All Cities' ? 'text-slate-300' : 'text-slate-400'}`} />
          <select
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1c398e] focus:border-[#1c398e] outline-none appearance-none text-sm text-slate-700 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            disabled={selectedCity === 'All Cities'}
            title={selectedCity === 'All Cities' ? "Select a city first" : ""}
          >
            {branchOptions.map((branch, idx) => (
              <option key={idx} value={branch}>{branch}</option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1c398e] focus:border-[#1c398e] outline-none appearance-none text-sm text-slate-700"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="All Roles">All Roles</option>
            {USER_ROLES_WITH_DESCRIPTIONS.map((roleObj, idx) => (
              <option key={idx} value={roleObj.role}>{roleObj.role}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-500 pointer-events-none" />
          <select
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1c398e] focus:border-[#1c398e] outline-none appearance-none text-sm text-slate-700"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
};
