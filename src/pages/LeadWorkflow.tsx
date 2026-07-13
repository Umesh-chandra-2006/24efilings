import React, { useState } from 'react';
import { Lead, User } from '../types';
import { LeadCard } from '../components/LeadCard';
import { Button } from '../components/ui/Button';
import { PlusCircle, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Popover } from '../components/ui/Popover';
import { Calendar } from '../components/ui/Calendar';
import { cn } from '../lib/utils';
import { Badge } from '../components/ui/Badge';

interface LeadWorkflowProps {
  leads?: Lead[];
  onUpdateLead?: (lead: Lead) => void;
  onViewLead?: (leadId: string) => void;
  onAddLead?: () => void;
  onDeleteLeads?: (leadIds: string[]) => void;
  dateRange?: { from: string; to: string };
  setDateRange?: (value: React.SetStateAction<{ from: string; to: string; }>) => void;
  onOpenLeadForm?: (lead: Lead | null) => void;
  currentUser?: User;
}

// Modern, colorful palette for workflow stages
const workflowStages: {
  title: string;
  status: Lead['status'];
  headerClass: string;
  bgClass: string;
  badgeClass: string;
  borderAccent: string;
}[] = [
    {
      title: 'New Lead',
      status: 'New Lead',
      headerClass: 'bg-blue-100/80 text-blue-900',
      bgClass: 'bg-blue-50/50',
      badgeClass: 'bg-blue-200 text-blue-800',
      borderAccent: 'border-t-blue-500'
    },
    {
      title: 'Lead Confirmed',
      status: 'Lead Confirmed',
      headerClass: 'bg-indigo-100/80 text-indigo-900',
      bgClass: 'bg-indigo-50/50',
      badgeClass: 'bg-indigo-200 text-indigo-800',
      borderAccent: 'border-t-indigo-500'
    },
    {
      title: 'Documents & Payments',
      status: 'Documents & Payments',
      headerClass: 'bg-purple-100/80 text-purple-900',
      bgClass: 'bg-purple-50/50',
      badgeClass: 'bg-purple-200 text-purple-800',
      borderAccent: 'border-t-purple-500'
    },
    {
      title: 'In-Progress',
      status: 'In-Progress',
      headerClass: 'bg-amber-100/80 text-amber-900',
      bgClass: 'bg-amber-50/50',
      badgeClass: 'bg-amber-200 text-amber-800',
      borderAccent: 'border-t-amber-500'
    },
    {
      title: 'Success',
      status: 'Success',
      headerClass: 'bg-emerald-100/80 text-emerald-900',
      bgClass: 'bg-emerald-50/50',
      badgeClass: 'bg-emerald-200 text-emerald-800',
      borderAccent: 'border-t-emerald-500'
    },
    {
      title: 'Lost',
      status: 'Lost',
      headerClass: 'bg-red-100/80 text-red-900',
      bgClass: 'bg-red-50/50',
      badgeClass: 'bg-red-200 text-red-800',
      borderAccent: 'border-t-red-500'
    },
  ];

const LeadWorkflow: React.FC<LeadWorkflowProps> = ({
  leads = [],
  onUpdateLead,
  onViewLead,
  onAddLead,
  onDeleteLeads,
  dateRange = { from: '', to: '' },
  setDateRange,
  onOpenLeadForm,
  currentUser = { id: '', name: '', role: 'Sales Executive' } as any
}) => {
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.currentTarget.style.opacity = '0.5';
    // Add a class to body to indicate dragging if needed
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, title: string) => {
    e.preventDefault();
    setDraggedOverColumn(title);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: Lead['status']) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const leadId = e.dataTransfer.getData('leadId');
    const leadToUpdate = leads.find(l => l.id === leadId);

    if (leadToUpdate && leadToUpdate.status !== targetStatus) {
      onUpdateLead?.({ ...leadToUpdate, status: targetStatus });
    }
  };

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (leadToDelete) {
      onDeleteLeads?.([leadToDelete.id]);
      setIsDeleteConfirmOpen(false);
      setLeadToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const canAddLead = ['Super Admin', 'Admin'].includes(currentUser.role);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lead Workflow</h1>
          <p className="text-sm text-slate-500">Visualize and manage your sales pipeline.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Popover
            align="end"
            trigger={
              <Button variant="outline" className={cn("w-auto sm:w-[240px] justify-start text-left font-normal gap-2 transition-all hover:bg-slate-50", (dateRange.from || dateRange.to) && "border-primary/50 text-primary")}>
                <CalendarIcon className="h-4 w-4 opacity-70" />
                <span className="truncate">
                  {dateRange.from && dateRange.to ? (
                    `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
                  ) : dateRange.from ? (
                    `${formatDate(dateRange.from)} - ...`
                  ) : (
                    <span>Filter by Date</span>
                  )}
                </span>
              </Button>
            }
            content={<Calendar dateRange={dateRange} onDateChange={setDateRange} />}
          />
          {(dateRange.from || dateRange.to) &&
            <Button variant="ghost" size="icon" onClick={() => setDateRange?.({ from: '', to: '' })} title="Clear date filter" className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          }
          {canAddLead && (
            <Button onClick={() => onAddLead?.()} className="gap-2 shadow-md hover:shadow-lg transition-all">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Add Lead</span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 -mx-2 px-2">
        <div className="flex h-full gap-6 min-w-[1200px] pb-2">
          {workflowStages.map((stage) => {
            const stageLeads = leads.filter(lead => lead.status === stage.status);
            return (
              <div
                key={stage.title}
                onDragOver={(e) => handleDragOver(e, stage.title)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.status)}
                className={cn(
                  "flex flex-col w-80 min-w-[20rem] rounded-xl transition-all duration-300 border border-transparent",
                  stage.bgClass,
                  draggedOverColumn === stage.title ? 'ring-2 ring-primary/20 scale-[1.01] bg-white shadow-lg' : ''
                )}
              >
                <div className={cn("flex items-center justify-between p-3 mx-2 mt-2 rounded-lg border border-transparent/10 shadow-sm", stage.headerClass, stage.borderAccent, "border-t-[3px]")}>
                  <h2 className="font-semibold text-sm uppercase tracking-wide">{stage.title}</h2>
                  <Badge variant="secondary" className={cn("rounded-full px-2 min-w-[1.5rem] justify-center", stage.badgeClass)}>
                    {stageLeads.length}
                  </Badge>
                </div>

                <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                  {stageLeads.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onViewLead={onViewLead}
                      onEdit={() => onOpenLeadForm?.(lead)}
                      onDelete={() => handleDeleteClick(lead)}
                    />
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-300/50 rounded-lg flex items-center justify-center text-slate-400 text-sm italic">
                      No Item
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete Lead`}
        description={`Are you sure you want to permanently delete lead "${leadToDelete?.business_name}"? This action cannot be undone.`}
        confirmButtonText="Yes, Delete"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default LeadWorkflow;
