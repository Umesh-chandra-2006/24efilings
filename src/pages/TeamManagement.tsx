import React, { useState } from 'react';
import { User, Lead } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { CalendarIcon, BarChartIcon } from '../components/icons';
import { Button } from '../components/ui/Button';
import { Popover } from '../components/ui/Popover';
import { Calendar } from '../components/ui/Calendar';
import { SalesExecutivePerformanceModal } from '../components/SalesExecutivePerformanceModal';
import { Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

interface TeamManagementProps {
  teamMembers: User[];
  allLeads: Lead[];
  dateRange: { from: string; to: string };
  setDateRange: (value: React.SetStateAction<{ from: string; to: string; }>) => void;
  onDeleteUsers: (userIds: string[]) => void;
}

const TeamMemberCard: React.FC<{member: User, leads: Lead[], onClick: () => void, onDelete: (e: React.MouseEvent) => void}> = ({ member, leads, onClick, onDelete }) => {
    const assignedLeads = leads.filter(l => l.assigned_to?.id === member.id);
    const convertedLeads = assignedLeads.filter(l => l.status === 'Success');
    const conversionRate = assignedLeads.length > 0 ? ((convertedLeads.length / assignedLeads.length) * 100).toFixed(1) : 0;
    const totalRevenue = convertedLeads.reduce((sum, l) => sum + (l.total_payment || 0), 0);

    return (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-slate-200" onClick={onClick}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <img src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.name}&background=random`} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                    <CardTitle className="text-base">{member.name}</CardTitle>
                    <CardDescription className="text-xs">{member.email}</CardDescription>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#1c398e]" onClick={onClick}>
                         <BarChartIcon className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" onClick={onDelete}>
                         <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center text-sm pt-2 border-t mt-2">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Leads</p>
                        <p className="font-bold text-lg text-slate-700">{assignedLeads.length}</p>
                    </div>
                     <div>
                        <p className="text-xs text-slate-500 mb-1">Conversion</p>
                        <p className="font-bold text-lg text-green-600">{conversionRate}%</p>
                    </div>
                     <div>
                        <p className="text-xs text-slate-500 mb-1">Revenue</p>
                        <p className="font-bold text-lg text-[#1c398e]">₹{(totalRevenue/1000).toFixed(1)}k</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};
const TeamManagement: React.FC<TeamManagementProps> = ({ teamMembers, allLeads, dateRange, setDateRange, onDeleteUsers }) => {
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleMemberClick = (member: User) => {
      setSelectedMember(member);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedMember(null);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      onDeleteUsers([userToDelete.id]);
      setUserToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
            <p className="text-slate-500">Oversee your sales executives and their performance.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
            <Popover
                align="end"
                trigger={
                    <Button variant="outline" className="w-auto sm:w-[280px] justify-start text-left font-normal gap-2 bg-white">
                        <CalendarIcon className="h-4 w-4 text-slate-500" />
                        <span className="hidden sm:inline">
                            {dateRange.from && dateRange.to ? (
                                `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
                            ) : dateRange.from ? (
                                `${formatDate(dateRange.from)} - ...`
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </span>
                        <span className="sm:hidden">
                            Filter Dates
                        </span>
                    </Button>
                }
                content={<Calendar dateRange={dateRange} onDateChange={setDateRange} />}
            />
            {(dateRange.from || dateRange.to) &&
                <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: '', to: '' })}>
                    Clear
                </Button>
            }
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map(member => (
            <TeamMemberCard 
                key={member.id} 
                member={member} 
                leads={allLeads} 
                onClick={() => handleMemberClick(member)}
                onDelete={(e) => handleDeleteClick(e, member)}
            />
        ))}
      </div>

      <SalesExecutivePerformanceModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedMember}
        leads={allLeads}
      />

      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Employee"
        description={`Are you sure you want to remove ${userToDelete?.name} from the portal? This action cannot be undone.`}
        confirmButtonText="Remove Employee"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default TeamManagement;