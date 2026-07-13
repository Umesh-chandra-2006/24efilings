import React, { useMemo } from 'react';
import { User, City, Branch } from '../../types';
import { Users, UserCheck, Building2, Map, ShieldCheck, UserPlus } from 'lucide-react';
import { isThisMonth } from 'date-fns';

interface UserStatsProps {
  filteredUsers: User[];
  allUsers: User[];
  branches: Branch[];
  cities: City[];
  selectedCity: string;
  selectedBranch: string;
}

export const UserStats: React.FC<UserStatsProps> = ({ 
  filteredUsers, 
  allUsers, 
  branches, 
  cities, 
  selectedCity, 
  selectedBranch 
}) => {
  const stats = useMemo(() => {
    // We base some stats on the filtered subset and some globally depending on context.
    const totalFiltered = filteredUsers.length;
    const activeUsers = filteredUsers.filter(u => u.is_active).length;
    
    // For branches/cities, if a city is selected, show branches in that city.
    // Otherwise show total branches.
    let relevantBranches = branches;
    if (selectedCity !== 'All Cities') {
      const cityId = cities.find(c => c.city_name === selectedCity)?.id;
      relevantBranches = branches.filter(b => b.city_id === cityId);
    }
    const branchCount = selectedBranch !== 'All Branches' ? 1 : relevantBranches.length;
    
    // Total cities
    const cityCount = selectedCity !== 'All Cities' ? 1 : cities.length;

    // Managers in the filtered list
    const branchManagers = filteredUsers.filter(u => u.role === 'Branch Manager' || u.role === 'Admin' || u.role === 'Super Admin').length;

    // New users this month (from filtered)
    const newThisMonth = filteredUsers.filter(u => {
      if (!u.created_at) return false;
      return isThisMonth(new Date(u.created_at));
    }).length;

    return {
      total: totalFiltered,
      active: activeUsers,
      branches: branchCount,
      cities: cityCount,
      managers: branchManagers,
      newThisMonth
    };
  }, [filteredUsers, allUsers, branches, cities, selectedCity, selectedBranch]);

  const statCards = [
    { title: 'Total Users', value: stats.total, icon: Users, color: 'bg-blue-600' },
    { title: 'Active Users', value: stats.active, icon: UserCheck, color: 'bg-emerald-500' },
    { title: 'Total Branches', value: stats.branches, icon: Building2, color: 'bg-indigo-600' },
    { title: 'Total Cities', value: stats.cities, icon: Map, color: 'bg-purple-600' },
    { title: 'Managers/Admins', value: stats.managers, icon: ShieldCheck, color: 'bg-amber-500' },
    { title: 'New This Month', value: stats.newThisMonth, icon: UserPlus, color: 'bg-rose-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className={`${stat.color} text-white p-3 rounded-full mb-3`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <h4 className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</h4>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.title}</p>
        </div>
      ))}
    </div>
  );
};
