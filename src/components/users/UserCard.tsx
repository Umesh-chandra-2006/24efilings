import React from 'react';
import { User } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Mail, Phone, MapPin, Building2, MoreVertical, Edit2, Shield, Eye, Key, ArrowRightLeft } from 'lucide-react';
import { Switch } from '../ui/Switch';
import { Popover } from '../ui/Popover';
import { getRoleColor } from '../../constants';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User, status: boolean) => void;
  onViewActivity: (user: User) => void;
  onTransfer: (user: User) => void;
  currentUserRole?: string;
  currentUser?: User;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onToggleStatus, onViewActivity, onTransfer, currentUserRole, currentUser }) => {
  const roleColor = getRoleColor(user.role);
  const canManage = (() => {
    if (!currentUser) return false;
    if (user.id === currentUser.id) return false;
    if (currentUserRole === 'Super Admin') return user.role !== 'Super Admin';
    if (currentUserRole === 'Admin' || currentUserRole === 'Branch Manager') {
      return user.role === 'Sales Executive' && 
             (user.branch_id === currentUser.branch_id || user.branch_name === currentUser.branch_name);
    }
    return false;
  })();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all duration-300 flex flex-col group overflow-hidden">
      {/* Top Banner (Color bar based on role) */}
      <div className={`h-2 w-full ${roleColor.replace('text-', 'bg-').replace('bg-opacity-10', '')}`} style={{ backgroundColor: user.role === 'Super Admin' ? '#dc2626' : user.role === 'Admin' ? '#f59e0b' : '#3b82f6' }} />
      
      {/* Header Profile Section */}
      <div className="p-5 flex flex-col items-center relative border-b border-slate-50">
        
        {/* Actions Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover 
            trigger={<button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><MoreVertical className="h-4 w-4" /></button>}
            content={
              <div className="flex flex-col py-1 min-w-[140px]">
                <button onClick={() => onViewActivity(user)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left">
                  <Eye className="h-4 w-4 text-slate-400" /> View Profile
                </button>
                {canManage && (
                  <>
                    <button onClick={() => onEdit(user)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left">
                      <Edit2 className="h-4 w-4 text-slate-400" /> Edit User
                    </button>
                    {currentUserRole === 'Super Admin' && (
                      <button onClick={() => onEdit(user)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left">
                        <Shield className="h-4 w-4 text-slate-400" /> Assign Role
                      </button>
                    )}
                    <button onClick={() => onTransfer(user)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left">
                      <ArrowRightLeft className="h-4 w-4 text-slate-400" /> Transfer
                    </button>
                    <button onClick={() => onEdit(user)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left">
                      <Key className="h-4 w-4 text-slate-400" /> Reset Password
                    </button>
                  </>
                )}
              </div>
            }
          />
        </div>

        {/* Avatar */}
        <Avatar className="h-20 w-20 border-4 border-white shadow-sm mb-3">
          <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
          <AvatarFallback className="bg-slate-100 text-[#1c398e] text-2xl font-semibold">
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Name & Role */}
        <h3 className="text-lg font-bold text-slate-800 leading-tight text-center">{user.name}</h3>
        <span className={`mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${roleColor}`}>
          {user.role}
        </span>
      </div>

      {/* Details Section */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-3 text-slate-600">
          <Mail className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm truncate" title={user.email}>{user.email}</span>
        </div>
        
        <div className="flex items-center gap-3 text-slate-600">
          <Phone className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm truncate">{user.phone_number || 'N/A'}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm truncate">{user.city_name || 'N/A'}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm truncate">{user.branch_name || 'N/A'}</span>
        </div>
      </div>

      {/* Footer / Status */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className={`text-xs font-semibold ${user.is_active ? 'text-emerald-700' : 'text-slate-500'}`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <Switch
          checked={user.is_active}
          onChange={(checked) => onToggleStatus(user, checked)}
          disabled={!canManage}
          className="data-[state=checked]:bg-[#1c398e] scale-90"
        />
      </div>
    </div>
  );
};
