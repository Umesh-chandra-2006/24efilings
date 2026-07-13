import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MapPin, Building, Users, Mail, Phone, CheckCircle, XCircle, ChevronDown, ChevronUp, User } from 'lucide-react';

export const CityNode = ({ data }: { data: any }) => {
  return (
    <div className={`w-[280px] p-5 bg-blue-50/70 rounded-xl border-2 ${data.selected ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-blue-200'} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative group`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-white -mt-1.5" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-white/60 flex items-center justify-center shrink-0 border border-blue-200 group-hover:bg-white transition-colors">
            <MapPin className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-lg tracking-tight">{data.label}</div>
            <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-0.5">{data.subtitle}</div>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); if(data.onToggleCollapse) data.onToggleCollapse(data.raw?.data?.id); }}
          className="p-1.5 rounded-md hover:bg-white/50 text-blue-500 hover:text-blue-700 transition-colors"
        >
          {data.isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-blue-200/50 flex justify-between items-center">
         <div className="flex items-center gap-2">
           <Users className="w-4 h-4 text-blue-500" />
           <span className="text-sm text-slate-700 font-medium">Total Employees</span>
         </div>
         <span className="text-sm font-bold text-blue-800 bg-white px-2.5 py-1 rounded-md border border-blue-200">{data.employees || 0}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white -mb-1.5" />
    </div>
  );
};

export const BranchNode = ({ data }: { data: any }) => {
  // data.managers is an array of { name, role, avatar_url, is_active }
  const managers: Array<{ name: string; role: string; avatar_url?: string; is_active?: boolean }> =
    Array.isArray(data.managers) ? data.managers : [];

  const roleColor = (role: string) => {
    if (role === 'Branch Manager') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role === 'Super Admin' || role === 'Admin') return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  return (
    <div className={`w-[300px] bg-emerald-50/70 rounded-xl border-2 ${data.selected ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-emerald-200'} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative group overflow-hidden`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500 border-2 border-white -mt-1.5" />

      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shrink-0 border border-emerald-200 group-hover:bg-white transition-colors shadow-sm">
              <Building className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-base tracking-tight leading-tight truncate">{data.label}</div>
              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">{data.subtitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-sm whitespace-nowrap">
              {data.employees || 0} <span className="font-normal text-emerald-600">emp</span>
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); if (data.onToggleCollapse) data.onToggleCollapse(data.raw?.data?.id); }}
              className="p-1 rounded-md hover:bg-white/70 text-emerald-500 hover:text-emerald-700 transition-colors"
            >
              {data.isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-emerald-200/60" />

      {/* Members Section */}
      <div className="p-4 pt-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Branch Members</span>
        </div>

        {managers.length === 0 ? (
          <div className="flex items-center gap-2 py-2 px-3 bg-white/60 rounded-lg border border-dashed border-emerald-200">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-xs text-slate-400 italic">No members assigned</span>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5">
            {managers.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 bg-white/80 hover:bg-white rounded-lg px-2.5 py-1.5 border border-emerald-100 hover:border-emerald-200 transition-all shadow-sm"
              >
                {/* Avatar */}
                {m.avatar_url ? (
                  <img
                    src={m.avatar_url}
                    alt={m.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                    <span className="text-white font-bold text-[11px]">
                      {m.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Name + Role */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate leading-tight">{m.name}</div>
                  <div className={`inline-flex items-center px-1.5 rounded text-[9px] font-bold uppercase tracking-wider border mt-0.5 ${roleColor(m.role)}`}>
                    {m.role}
                  </div>
                </div>

                {/* Active status dot */}
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${m.is_active !== false ? 'bg-emerald-400' : 'bg-slate-300'}`}
                  title={m.is_active !== false ? 'Active' : 'Inactive'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-white -mb-1.5" />
    </div>
  );
};

export const UserNode = ({ data }: { data: any }) => {
  const isManager = data.role === 'Branch Manager' || data.role === 'Super Admin' || data.role === 'Admin';
  
  const bgClass = isManager ? 'bg-purple-50/80' : 'bg-orange-50/80';
  const borderClass = isManager ? 'border-purple-200' : 'border-orange-200';
  const ringClass = isManager ? 'ring-purple-500/20 border-purple-500' : 'ring-orange-500/20 border-orange-500';
  const handleColor = isManager ? 'bg-purple-500' : 'bg-orange-500';
  
  const roleBadgeStyle = isManager 
    ? 'bg-white text-purple-700 border-purple-200'
    : 'bg-white text-orange-700 border-orange-200';

  return (
    <div className={`w-[280px] p-5 ${bgClass} rounded-xl border-2 ${data.selected ? `${ringClass} ring-4` : borderClass} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative group`}>
      <Handle type="target" position={Position.Top} className={`w-3 h-3 ${handleColor} border-2 border-white -mt-1.5 z-10`} />
      
      <div className="flex items-start gap-4">
        {/* Profile Image */}
        <div className="relative shrink-0 mt-0.5">
          <div className={`w-14 h-14 rounded-full relative z-10 border-2 ${borderClass} shadow-sm bg-white p-0.5`}>
            {data.avatar_url ? (
              <img src={data.avatar_url} alt={data.label} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-slate-600 bg-slate-100">
                 <span className="font-bold text-xl">{data.label.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-900 text-lg truncate tracking-tight">{data.label}</div>
          <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1 border ${roleBadgeStyle}`}>
            {data.role}
          </div>
          
          {!isManager && (
            <div className="flex items-center gap-1.5 mt-2">
               {data.is_active ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
               <span className="text-xs font-bold text-slate-700">{data.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Details Box */}
      <div className={`mt-4 pt-3 border-t ${isManager ? 'border-purple-200/50' : 'border-orange-200/50'}`}>
        {isManager ? (
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${isManager ? 'text-purple-500' : 'text-orange-500'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Team Size</span>
              </div>
              <span className={`text-sm font-bold px-2 py-0.5 rounded border bg-white ${isManager ? 'text-purple-700 border-purple-200' : 'text-orange-700 border-orange-200'}`}>{data.directReports}</span>
           </div>
        ) : (
           <div className="space-y-2">
             <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium truncate text-slate-700">{data.email}</span>
             </div>
             {data.raw?.data?.phone_number && (
               <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-medium truncate text-slate-700">{data.raw.data.phone_number}</span>
               </div>
             )}
           </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${handleColor} border-2 border-white -mb-1.5 z-10`} />
    </div>
  );
};
