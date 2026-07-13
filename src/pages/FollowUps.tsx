import React, { useMemo } from 'react';
import { Lead, Task } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { ClockIcon, CalendarIcon, CheckCircleIcon } from '../components/icons';
import { Button } from '../components/ui/Button';
import { Popover } from '../components/ui/Popover';
import { Calendar } from '../components/ui/Calendar';

interface FollowUpsProps {
    leads?: Lead[];
    dateRange?: { from: string; to: string };
    setDateRange?: (value: React.SetStateAction<{ from: string; to: string; }>) => void;
    onViewLead?: (leadId: string) => void;
}

interface FollowUpItem {
    id: string;
    type: 'General Follow-up' | 'Task';
    title: string;
    subtitle: string;
    date: Date;
    priority: string;
    priorityColor: string;
    leadId: string;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'High': return 'text-red-600 bg-red-50 border-red-100';
        case 'Hot': return 'text-red-600 bg-red-50 border-red-100';
        case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-100';
        case 'Warm': return 'text-orange-600 bg-orange-50 border-orange-100';
        case 'Low': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'Cold': return 'text-blue-600 bg-blue-50 border-blue-100';
        default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
};

const FollowUps: React.FC<FollowUpsProps & { onUpdateTask?: (leadId: string, task: Task) => void; onUpdateLead?: (lead: Lead) => void; }> = ({
    leads = [],
    dateRange = { from: '', to: '' },
    setDateRange,
    onViewLead,
    onUpdateTask,
    onUpdateLead
}) => {

    const handleComplete = (item: FollowUpItem) => {
        const lead = leads.find(l => l.id === item.leadId);
        if (!lead) return;

        if (item.type === 'Task') {
            const taskId = item.id.replace('task-', '');
            const task = lead.tasks?.find(t => t.id === taskId);
            if (task) {
                onUpdateTask?.(lead.id, { ...task, is_completed: true, completed_at: new Date().toISOString() });
            }
        } else {
            // For General Follow-up, we clear the date or move it? 
            // Usually 'Mark Done' implies the action is taken. We can clear the date.
            // Or better, we can maybe ask for outcome? For now, simplest is to clear it or mark as 'Success' if that was the goal?
            // Actually, just clearing next_follow_up is standard for "Done this follow up".
            onUpdateLead?.({ ...lead, next_follow_up: undefined });
        }
    };

    // Aggregate all follow-up items (Lead "Next Follow-up" + Individual Tasks)
    const allItems = useMemo(() => {
        const items: FollowUpItem[] = [];
        leads.forEach(lead => {
            // 1. General Lead Follow-up
            if (lead.next_follow_up && lead.status !== 'Success' && lead.status !== 'Lost') {
                items.push({
                    id: `lead-fu-${lead.id}`,
                    type: 'General Follow-up',
                    title: lead.business_name,
                    subtitle: 'General Lead Follow-up',
                    date: new Date(lead.next_follow_up),
                    priority: lead.priority,
                    priorityColor: getPriorityColor(lead.priority),
                    leadId: lead.id
                });
            }

            // 2. Individual Tasks
            if (lead.tasks && lead.tasks.length > 0) {
                lead.tasks.forEach(task => {
                    if (task.due_date && !task.is_completed) {
                        items.push({
                            id: `task-${task.id}`,
                            type: 'Task',
                            title: task.content,
                            subtitle: `${lead.business_name} • Assigned by ${task.created_by?.name || 'Unknown'}`,
                            date: new Date(task.due_date),
                            priority: task.priority,
                            priorityColor: getPriorityColor(task.priority),
                            leadId: lead.id
                        });
                    }
                });
            }
        });

        // Sort by date (ascending - nearest first)
        return items.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [leads]);

    const { overdue, today, upcoming } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const overdue: FollowUpItem[] = [];
        const todayItems: FollowUpItem[] = [];
        const upcoming: FollowUpItem[] = [];

        allItems.forEach(item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);

            if (itemDate < now) {
                overdue.push(item);
            } else if (itemDate.getTime() === now.getTime()) {
                todayItems.push(item);
            } else {
                upcoming.push(item);
            }
        });

        return { overdue, today: todayItems, upcoming };
    }, [allItems]);

    // Apply main date filter if selected
    const filterByRange = (items: FollowUpItem[]) => {
        if (!dateRange.from) return items;
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from); // Default to single day if no 'to'
        toDate.setHours(23, 59, 59, 999);

        return items.filter(item => {
            const d = new Date(item.date);
            return d >= fromDate && d <= toDate;
        });
    };

    const filteredOverdue = filterByRange(overdue);
    const filteredToday = filterByRange(today);
    const filteredUpcoming = filterByRange(upcoming);

    const FollowUpList: React.FC<{ title: string, items: FollowUpItem[], headerColor: string, emptyMessage: string }> = ({ title, items, headerColor, emptyMessage }) => (
        <div className="flex flex-col h-full">
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${headerColor}`}>
                <div className={`p-1.5 rounded-md ${headerColor.replace('text-', 'bg-').replace('600', '100')}`}>
                    <ClockIcon className="h-5 w-5" />
                </div>
                {title}
                <span className="ml-auto text-sm font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {items.length}
                </span>
            </h2>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {items.length > 0 ? items.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500 cursor-pointer group relative" onClick={() => onViewLead?.(item.leadId)}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <h4 className="font-semibold text-slate-800 leading-snug">{item.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">{item.subtitle}</p>
                                </div>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${item.priorityColor}`}>
                                    {item.priority}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className={`flex items-center gap-1 text-xs ${item.type === 'Task' ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded' : 'text-slate-600 bg-slate-100 px-2 py-0.5 rounded'}`}>
                                    {item.type === 'Task' ? <CheckCircleIcon className="h-3 w-3" /> : <CalendarIcon className="h-3 w-3" />}
                                    {item.type}
                                </span>
                                <div className="flex items-center gap-2">
                                     <span className="text-xs text-slate-500">
                                        Due: {item.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        {item.date.getHours() !== 0 || item.date.getMinutes() !== 0 ? ` at ${item.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}
                                    </span>
                                    <Button size="sm" variant="outline" className="h-7 text-xs ml-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200" onClick={(e) => {
                                        e.stopPropagation();
                                        handleComplete(item);
                                    }}>
                                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                                        Complete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center h-32">
                        <p className="text-sm text-slate-400 font-medium">{emptyMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Follow-ups & Reminders</h1>
                    <p className="text-slate-500 mt-1">Manage your upcoming follow-ups and lead tasks.</p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <Popover
                        align="end"
                        trigger={
                            <Button variant="outline" className="w-auto sm:w-[280px] justify-start text-left font-normal gap-2 bg-white shadow-sm hover:bg-slate-50">
                                <CalendarIcon className="h-4 w-4 text-slate-500" />
                                <span className="hidden sm:inline">
                                    {dateRange.from ? (
                                        dateRange.to ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}` : `${formatDate(dateRange.from)}`
                                    ) : (
                                        <span className="text-slate-500">Filter by Date</span>
                                    )}
                                </span>
                                <span className="sm:hidden">Dates</span>
                            </Button>
                        }
                        content={<Calendar dateRange={dateRange} onDateChange={setDateRange} />}
                    />
                    {(dateRange.from || dateRange.to) &&
                        <Button variant="ghost" size="sm" onClick={() => setDateRange?.({ from: '', to: '' })} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Clear
                        </Button>
                    }
                </div>
            </header>

            {/* Alert Banner for Context */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start sm:items-center gap-3 text-sm text-blue-700 shrink-0">
                <div className="bg-blue-100 p-1 rounded-full shrink-0">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                </div>
                <p>
                    Showing <strong>General Follow-ups</strong> (set in Lead Edit) and <strong>Tasks</strong> (created in Lead Detail).
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 flex-1 min-h-0">
                <FollowUpList title="Overdue" items={filteredOverdue} headerColor="text-red-600" emptyMessage="No overdue items! Great job." />
                <FollowUpList title="Today" items={filteredToday} headerColor="text-amber-600" emptyMessage="Nothing scheduled for today." />
                <FollowUpList title="Upcoming" items={filteredUpcoming} headerColor="text-blue-600" emptyMessage="No upcoming items scheduled." />
            </div>
        </div>
    );
};

export default FollowUps;
