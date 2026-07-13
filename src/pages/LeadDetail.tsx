import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lead, Activity, Document, Task, Payment, TaskPriority } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeftIcon, MailIcon, PhoneIcon, FileTextIcon, BriefcaseIcon, FileUpIcon, Trash2Icon, EditIcon, DownloadIcon, TargetIcon, PlusIcon, CheckCircleIcon } from '../components/icons';
import { getStatusColor, getPriorityColor, DOCUMENT_TYPES, getTaskPriorityColor, TASK_PRIORITIES } from '../constants';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { calculateLeadScore, getScoreCategory, getScoreBreakdown } from '../lib/scoring';
import { Select } from '../components/ui/Select';
import { ServiceSetItem } from '../components/ServiceSetItem';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getNextPaymentSequenceClientSide, formatPaymentReferenceId } from '../lib/paymentUtils';

interface LeadDetailProps {
    lead?: Lead;
    onBack?: () => void;
    onUpdateLead?: (lead: Lead) => void;
    onAddActivity?: (content: string) => void;
    onUploadDocument?: (file: File, docType: string) => Promise<void>;
    onDeleteDocument?: (docId: string) => Promise<void>;
    onEditLead?: () => void;
    onAddTask?: (content: string, dueDate: string | undefined, priority: TaskPriority) => Promise<void>;
    onUpdateTask?: (task: Task) => Promise<void>;
    onDeleteTask?: (taskId: string) => Promise<void>;
}

interface DocumentUploadRow {
    id: number;
    docType: string;
    file: File | null;
}

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const ActivityIcon: React.FC<{ type: Activity['type'] }> = ({ type }) => {
    const iconMap = {
        'Note': FileTextIcon,
        'Status Change': BriefcaseIcon,
        'Document Upload': FileUpIcon,
        'Call': PhoneIcon,
        'Email': MailIcon
    };
    const Icon = iconMap[type] || FileTextIcon;
    return <Icon className="h-4 w-4 text-slate-500" />;
}

const WORKFLOW_STAGES: Lead['status'][] = ['New Lead', 'Lead Confirmed', 'Documents & Payments', 'In-Progress', 'Success'];

const StatusStepper: React.FC<{ currentStatus: Lead['status'], onStatusChange: (newStatus: Lead['status']) => void }> = ({ currentStatus, onStatusChange }) => {
    const currentIndex = WORKFLOW_STAGES.indexOf(currentStatus);

    return (
        <div className="flex items-start justify-center pt-2">
            {WORKFLOW_STAGES.map((status, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isUpcoming = index > currentIndex;

                return (
                    <React.Fragment key={status}>
                        <div className="flex flex-col items-center group">
                            <button
                                disabled={!isUpcoming}
                                onClick={() => onStatusChange(status)}
                                className={`relative h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-[#1c398e] border-[#1c398e] text-white' :
                                    isCurrent ? 'border-[#1c398e] bg-white scale-110 shadow-lg' :
                                        'border-slate-300 bg-white group-hover:border-[#1c398e]'
                                    } ${isUpcoming ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                {isCompleted ? <CheckCircleIcon className="h-5 w-5" /> :
                                    isCurrent ? <div className="h-3 w-3 rounded-full bg-[#1c398e]"></div> :
                                        <span className="text-slate-400 font-semibold">{index + 1}</span>}
                            </button>
                            <p className={`mt-2 text-xs text-center w-24 ${isCompleted ? 'text-slate-600' :
                                isCurrent ? 'font-semibold text-[#1c398e]' :
                                    'text-slate-500'
                                }`}>{status}</p>
                        </div>
                        {index < WORKFLOW_STAGES.length - 1 && (
                            <div className={`flex-1 h-0.5 mt-4 ${isCompleted || isCurrent ? 'bg-[#1c398e]' : 'bg-slate-300'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};


import { StandardInvoice, InvoiceItem } from '../components/StandardInvoice';
import { Dialog } from '../components/ui/Dialog';
import { EditPaymentDialog } from '../components/EditPaymentDialog';

const LeadDetail: React.FC<LeadDetailProps> = ({
    lead: propsLead,
    onBack: propsOnBack,
    onUpdateLead: propsOnUpdateLead,
    onAddActivity: propsOnAddActivity,
    onUploadDocument: propsOnUploadDocument,
    onDeleteDocument: propsOnDeleteDocument,
    onEditLead: propsOnEditLead,
    onAddTask: propsOnAddTask,
    onUpdateTask: propsOnUpdateTask,
    onDeleteTask: propsOnDeleteTask
}) => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const apiData = useApi();
    const { profile } = useAuth();
    const { fetchLeadDetails } = useApi({ fetchOnMount: false });

    const lead = propsLead ?? apiData.leads.find(l => l.id === leadId);

    const onBack = propsOnBack ?? (() => navigate(-1));
    const onUpdateLead = propsOnUpdateLead ?? (async (updatedLead) => {
        await apiData.updateLead(updatedLead);
    });
    const onAddActivity = propsOnAddActivity ?? (async (content) => {
        if (lead) await apiData.addActivityToLead(lead.id, { content, type: 'Note' });
    });
    const onUploadDocument = propsOnUploadDocument ?? (async (file, docType) => {
        if (lead && profile) await apiData.uploadDocument(lead.id, file, docType, profile.id);
    });
    const onDeleteDocument = propsOnDeleteDocument ?? (async (docId) => {
        if (lead) await apiData.deleteDocument(lead.id, docId);
    });
    const onEditLead = propsOnEditLead ?? (() => {
        if (lead) {
            // trigger edit lead modal
        }
    });
    const onAddTask = propsOnAddTask ?? (async (content, dueDate, priority) => {
        if (lead && profile) {
            await apiData.addTaskToLead({
                lead_id: lead.id,
                content,
                due_date: dueDate,
                priority,
                created_by: profile.id
            });
        }
    });
    const onUpdateTask = propsOnUpdateTask ?? (async (task) => {
        if (lead) await apiData.updateTaskOnLead(lead.id, task);
    });
    const onDeleteTask = propsOnDeleteTask ?? (async (taskId) => {
        if (lead) await apiData.deleteTaskFromLead(lead.id, taskId);
    });

    if (!lead) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
                <p className="text-slate-500">Loading lead details...</p>
            </div>
        );
    }

    // Local state for full details (Lazy Loading)
    const [details, setDetails] = useState<{
        activities: Activity[];
        documents: Document[];
        tasks: Task[];
    }>({ activities: [], documents: [], tasks: [] });

    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    // Fetch details on mount or when lead changes (and likely has new counts)
    useEffect(() => {
        let isMounted = true;
        const loadDetails = async () => {
            setIsLoadingDetails(true);
            try {
                const data = await fetchLeadDetails(lead.id);
                if (isMounted) {
                    setDetails(data);
                }
            } catch (error) {
                console.error("Failed to load lead details:", error);
            } finally {
                if (isMounted) setIsLoadingDetails(false);
            }
        };

        loadDetails();

        return () => {
            isMounted = false;
        };
    }, [lead.id, fetchLeadDetails, lead.activities?.length, lead.documents?.length, lead.tasks?.length]);


    const [newNote, setNewNote] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [docToDelete, setDocToDelete] = useState<Document | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isTaskDeleteConfirmOpen, setIsTaskDeleteConfirmOpen] = useState(false);
    const [animatedTaskId, setAnimatedTaskId] = useState<string | null>(null);
    const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
    const [documentUploads, setDocumentUploads] = useState<DocumentUploadRow[]>([{ id: Date.now(), docType: DOCUMENT_TYPES[0], file: null }]);
    // Payment state
    const [newPaymentAmount, setNewPaymentAmount] = useState('');
    const [newPaymentMethod, setNewPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Bank Transfer'>('UPI');
    const [newPaymentServiceId, setNewPaymentServiceId] = useState('');
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false); 
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null); 

    const score = lead.score ?? calculateLeadScore(lead);
    const scoreInfo = getScoreCategory(score);
    const scoreBreakdown = getScoreBreakdown(lead);

    const handleAddNote = () => {
        if (newNote.trim()) {
            onAddActivity(newNote.trim());
            setNewNote('');
        }
    };

    const handleDeleteClick = (doc: Document) => {
        setDocToDelete(doc);
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (docToDelete) {
            await onDeleteDocument(docToDelete.id);
            setIsDeleteConfirmOpen(false);
            setDocToDelete(null);
        }
    };

    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
    const [editTaskContent, setEditTaskContent] = useState('');
    const [editTaskDueDate, setEditTaskDueDate] = useState('');
    const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>('Medium');

    const handleAddTask = async () => {
        if (newTaskContent.trim()) {
            setIsLoadingDetails(true);
            try {
                await onAddTask(newTaskContent.trim(), newTaskDueDate || undefined, newTaskPriority);
                const data = await fetchLeadDetails(lead.id);
                setDetails(data);
                setNewTaskContent('');
                setNewTaskDueDate('');
                setNewTaskPriority('Medium');
                setIsTaskDialogOpen(false);
            } catch (e) {
                console.error("Failed to add task:", e);
            } finally {
                setIsLoadingDetails(false);
            }
        }
    };

    const handleToggleTask = async (task: Task) => {
        const updatedTask = {
            ...task,
            is_completed: !task.is_completed,
            completed_at: !task.is_completed ? new Date().toISOString() : undefined,
        };
        
        setAnimatedTaskId(task.id);
        setTimeout(() => setAnimatedTaskId(null), 700);

        if (updatedTask.is_completed) {
            setCompletedTaskId(task.id);
            setTimeout(() => setCompletedTaskId(null), 1000);
        }

        setIsLoadingDetails(true);
        try {
            await onUpdateTask(updatedTask);
            const data = await fetchLeadDetails(lead.id);
            setDetails(data);
        } catch (e) {
            console.error("Failed to update task:", e);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleDeleteTaskClick = (task: Task) => {
        setTaskToDelete(task);
        setIsTaskDeleteConfirmOpen(true);
    };

    const handleConfirmDeleteTask = async () => {
        if (taskToDelete) {
            setIsLoadingDetails(true);
            try {
                await onDeleteTask(taskToDelete.id);
                const data = await fetchLeadDetails(lead.id);
                setDetails(data);
                setIsTaskDeleteConfirmOpen(false);
                setTaskToDelete(null);
            } catch (e) {
                console.error("Failed to delete task:", e);
            } finally {
                setIsLoadingDetails(false);
            }
        }
    };

    const handleEditTaskClick = (task: Task) => {
        setEditingTask(task);
        setEditTaskContent(task.content);
        setEditTaskDueDate(task.due_date ? task.due_date.substring(0, 16) : '');
        setEditTaskPriority(task.priority);
        setIsEditTaskDialogOpen(true);
    };

    const handleSaveTaskEdit = async () => {
        if (editingTask && editTaskContent.trim()) {
            const updatedTask: Task = {
                ...editingTask,
                content: editTaskContent.trim(),
                due_date: editTaskDueDate || undefined,
                priority: editTaskPriority,
            };
            setIsLoadingDetails(true);
            try {
                await onUpdateTask(updatedTask);
                const data = await fetchLeadDetails(lead.id);
                setDetails(data);
                setIsEditTaskDialogOpen(false);
                setEditingTask(null);
            } catch (e) {
                console.error("Failed to edit task:", e);
            } finally {
                setIsLoadingDetails(false);
            }
        }
    };

    const handleAddUploadRow = () => {
        setDocumentUploads(prev => [...prev, { id: Date.now(), docType: DOCUMENT_TYPES[0], file: null }]);
    };

    const handleRemoveUploadRow = (id: number) => {
        setDocumentUploads(prev => prev.filter(row => row.id !== id));
    };

    const handleUploadRowChange = (id: number, updates: Partial<DocumentUploadRow>) => {
        setDocumentUploads(prev => prev.map(row =>
            row.id === id ? { ...row, ...updates } : row
        ));
    };

    const handleUploadSelectedFiles = async () => {
        const filesToUpload = documentUploads.filter(row => row.file);
        if (filesToUpload.length === 0) return;

        setIsUploading(true);
        try {
            for (const upload of filesToUpload) {
                if (upload.file) {
                    await onUploadDocument(upload.file, upload.docType);
                }
            }
            setDocumentUploads([{ id: Date.now(), docType: DOCUMENT_TYPES[0], file: null }]);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddPayment = async (amountArg?: number, methodArg?: string, serviceId?: string, serviceName?: string) => {
        const amount = amountArg || parseFloat(newPaymentAmount);
        const method = (methodArg as any) || newPaymentMethod;

        if (!amount || amount <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }

        const selectedServiceId = serviceId || newPaymentServiceId;
        // If serviceId passed, use passed name, otherwise find in list
        let paymentServiceName = serviceName;
        if (!paymentServiceName && selectedServiceId) {
            paymentServiceName = lead.service_sets?.find(s => s.id === selectedServiceId)?.mainService;
        }

        const currentYear = new Date().getFullYear();
        let nextSeq: number;
        try {
            const { data, error } = await (supabase.rpc as any)('generate_next_payment_sequence', { payment_year: currentYear });
            if (error || data === null) throw error || new Error("RPC returned null");
            nextSeq = Number(data);
        } catch (err) {
            console.warn("Postgres RPC not available, falling back to database-wide client-side sequence calculation", err);
            try {
                const { data: leadsData } = await supabase.from('leads').select('payments');
                const mockLeads = (leadsData || []) as any[];
                nextSeq = getNextPaymentSequenceClientSide(mockLeads, currentYear);
            } catch (fallbackErr) {
                console.error("Database fetch fallback failed, using current lead's payments only", fallbackErr);
                nextSeq = getNextPaymentSequenceClientSide([lead], currentYear);
            }
        }
        const receiptNumber = formatPaymentReferenceId(nextSeq, currentYear);

        const newPayment: Payment = {
            id: `pay_${Date.now()}`,
            amount, // Received
            received: amount,
            tax: 0,
            fee: 0,
            total: 0,
            due: 0 - amount, // Initial logic: Bill is 0, Paid is amount, Due is negative (Overpaid) until user edits Bill
            sales_amount: amount, // Default to full received amount, user can edit to exclude tax later
            method,
            date: new Date().toISOString(),
            receipt_number: receiptNumber,
            service_set_id: selectedServiceId,
            service_name: paymentServiceName,
        };
        const updatedPayments = [...(lead.payments || []), newPayment];
        
        // Auto-open edit dialog for the new payment to enforce data entry?
        // For now, just add it. User sees audit warning if they edit.
        
        onUpdateLead({ ...lead, payments: updatedPayments });
        setNewPaymentAmount('');
        setNewPaymentServiceId('');
    };

    const handleStatusUpdate = (newStatus: Lead['status']) => {
        onUpdateLead({ ...lead, status: newStatus });
    };

    const handleSavePaymentEdit = (updatedPayment: Payment, remarks: string) => {
        const updatedPayments = lead.payments?.map(p => p.id === updatedPayment.id ? updatedPayment : p) || [];
        const oldPayment = lead.payments?.find(p => p.id === updatedPayment.id);
        
        // Audit Log Generation
        const changes = [];
        if (oldPayment?.received !== updatedPayment.received) changes.push(`Received: ${oldPayment?.received} -> ${updatedPayment.received}`);
        if (oldPayment?.tax !== updatedPayment.tax) changes.push(`Tax: ${oldPayment?.tax} -> ${updatedPayment.tax}`);
        if (oldPayment?.fee !== updatedPayment.fee) changes.push(`Fee: ${oldPayment?.fee} -> ${updatedPayment.fee}`);
        if (oldPayment?.sales_amount !== updatedPayment.sales_amount) changes.push(`SalesCredit: ${oldPayment?.sales_amount} -> ${updatedPayment.sales_amount}`);
        if (oldPayment?.date !== updatedPayment.date) changes.push(`Date: ${new Date(oldPayment?.date || '').toLocaleDateString()} -> ${new Date(updatedPayment.date).toLocaleDateString()}`);
        if (oldPayment?.method !== updatedPayment.method) changes.push(`Mode: ${oldPayment?.method} -> ${updatedPayment.method}`);
        
        // Log activity (Audit)
        const logContent = `Payment Receipt Edited (${updatedPayment.receipt_number}). ${changes.join(', ')}. Audit Note: ${remarks}`;
        onAddActivity(logContent);
        
        onUpdateLead({ ...lead, payments: updatedPayments });
        setEditingPayment(null);
    };

    const advance_paid = lead.payments?.reduce((sum, p) => sum + (p.received || p.amount || 0), 0) || 0;

    // Use local details for rendering lists
    const displayTasks = details.tasks;
    const displayDocuments = details.documents;
    const displayActivities = details.activities;

    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    // ... (keep existing handlers)

    const handleOpenReceipt = () => {
        setIsReceiptOpen(true);
    };

    // Prepare Invoice Data
    const invoiceItems: InvoiceItem[] = lead.service_sets?.flatMap(set => {
        const items = set.subservices.map(sub => ({
            name: sub.name,
            description: set.mainService !== sub.name ? set.mainService : undefined,
            quantity: sub.quantity,
            rate: sub.amount,
            taxAmount: sub.tax_amount,
            total: (sub.amount * sub.quantity) + (sub.tax_amount || 0),
            date: new Date(lead.created_at).toLocaleDateString('en-GB')
        }));
        if (set.service_fee && set.service_fee > 0) {
            items.push({
                name: "Service Fee",
                description: `${set.mainService} - Surcharges`,
                quantity: 1,
                rate: set.service_fee,
                total: set.service_fee
            });
        }
        return items;
    }) || [];

    // Fallback if no service sets (e.g. manually entered total)
    if (invoiceItems.length === 0 && (lead.total_payment || 0) > 0) {
        invoiceItems.push({
            name: "Professional Services",
            description: lead.service_requested || "Services as agreed",
            quantity: 1,
            rate: lead.total_payment || 0,
            total: lead.total_payment || 0
        });
    }

    const receiptSubtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    // Use the calculated advance_paid from existing logic
    // advance_paid is already defined in the component: const advance_paid = lead.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

    return (
        <div className="space-y-6">
            {/* ... (Keep existing Header) */}
            <header className="flex items-start justify-between gap-4">
               {/* ... (Keep existing Header content) */}
                <div className="flex items-center gap-4 flex-1">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 shrink-0 self-start">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Button>
                    <div className="relative h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        {lead.avatar_url ? (
                            <img src={lead.avatar_url} alt={lead.business_name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                            <BriefcaseIcon className="h-10 w-10 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            {lead.business_name}
                            {lead.reference_number && (
                                <span className="text-xs font-mono font-bold bg-blue-50 text-[#1c398e] border border-blue-200 px-2 py-0.5 rounded shadow-sm">
                                    {lead.reference_number}
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500">{lead.first_name} {lead.last_name}</p>
                        <p className="text-xs text-slate-400 mt-1">Lead since {new Date(lead.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="self-start flex gap-2">
                     <Button variant="outline" className="gap-2" onClick={handleOpenReceipt}>
                        <FileTextIcon className="h-4 w-4" /> View Receipt
                    </Button>
                    <Button variant="primary" className="gap-2" onClick={onEditLead}> <EditIcon className="h-4 w-4" /> Edit Lead</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* ... (Keep existing Left Column) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ... (Lead Workflow Card - no changes needed, it's just visual stepper) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Workflow</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <StatusStepper currentStatus={lead.status} onStatusChange={handleStatusUpdate} />
                             {/* ... (Mark as Lost/Success buttons) */}
                             {lead.status !== 'Lost' && lead.status !== 'Success' && (
                                <div className="mt-6 text-center border-t pt-4">
                                    <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate('Lost')}>Mark as Lost</Button>
                                    <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('Success')} className="ml-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border-green-200">Mark as Success</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ... (Contact Details Card) */}
                    <Card>
                         <CardHeader>
                            <CardTitle>Contact Details</CardTitle>
                        </CardHeader>
                         <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                             <div><strong className="font-medium text-slate-600 block">Contact Person</strong> {lead.first_name} {lead.last_name}</div>
                             {lead.reference_number && <div><strong className="font-medium text-slate-600 block">Reference ID</strong> <span className="font-mono font-semibold text-[#1c398e]">{lead.reference_number}</span></div>}
                             <div><strong className="font-medium text-slate-600 block">Email</strong> {lead.email}</div>
                             <div><strong className="font-medium text-slate-600 block">Phone</strong> {lead.phone_number}</div>
                             {lead.alternate_mobile && (
                                 <div>
                                     <strong className="font-medium text-slate-600 block">Alternate Mobile</strong>
                                     <span className="flex items-center gap-1.5">
                                         {lead.alternate_mobile}
                                         {lead.alternate_is_whatsapp && (
                                             <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">
                                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-green-600">
                                                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                 </svg>
                                                 WhatsApp
                                             </span>
                                         )}
                                     </span>
                                 </div>
                             )}
                             {lead.pan_number && <div><strong className="font-medium text-slate-600 block">PAN Number</strong> {lead.pan_number}</div>}
                             <div><strong className="font-medium text-slate-600 block">Source</strong> {lead.source}</div>
                             <div><strong className="font-medium text-slate-600 block">Business Category</strong> {lead.business_category || 'Other'}</div>
                             <div><strong className="font-medium text-slate-600 block">Industry Type</strong> {lead.industry_type || 'Other'}</div>
                             <div className="sm:col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                     <strong className="font-medium text-slate-600 block">Services Requested</strong>
                                     {/* Added small add payment button/icon if needed, but per-service add is better */}
                                </div>
                                {lead.service_sets && lead.service_sets.length > 0 ? (
                                    <div className="space-y-4">
                                        {lead.service_sets.map((set) => (
                                            <ServiceSetItem
                                                key={set.id}
                                                serviceSet={set}
                                                onAddPayment={(amount, method) => handleAddPayment(amount, method, set.id, set.mainService)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500">{lead.service_requested}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ... (Tasks & Agenda Card - no changes) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Tasks & Agenda</CardTitle>
                            <Button size="sm" variant="outline" onClick={() => {
                                setNewTaskContent('');
                                setNewTaskDueDate('');
                                setNewTaskPriority('Medium');
                                setIsTaskDialogOpen(true);
                            }}>
                                <PlusIcon className="h-4 w-4 mr-1" /> Add Task
                            </Button>
                        </CardHeader>
                         <CardContent>
                            {/* ... (Task list content) */}
                            {isTaskDialogOpen && (
                                <div className="mb-4 p-4 border rounded-lg bg-slate-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Task description..."
                                            value={newTaskContent}
                                            onChange={(e) => setNewTaskContent(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                type="datetime-local"
                                                value={newTaskDueDate}
                                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                                                className="w-auto"
                                            />
                                            <Select
                                                value={newTaskPriority}
                                                onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                                                className="w-32"
                                            >
                                                {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                            </Select>
                                            <div className="flex-1"></div>
                                            <Button variant="ghost" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleAddTask}>Add Task</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                             {isLoadingDetails && <div className="text-center py-4 text-slate-500">Loading tasks...</div>}
                             {!isLoadingDetails && displayTasks?.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">No tasks scheduled.</p>
                            )}

                            <div className="space-y-2">
                                {displayTasks && displayTasks.length > 0 ? (
                                    <div className="overflow-x-auto border border-slate-250/60 rounded-xl mt-2">
                                        <table className="min-w-full divide-y divide-slate-250/60 text-left">
                                            <thead className="bg-slate-50/50">
                                                <tr>
                                                    <th scope="col" className="w-16 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Description</th>
                                                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date & Time</th>
                                                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                                                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</th>
                                                    <th scope="col" className="w-16 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-100">
                                                {displayTasks.map((task) => {
                                                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;
                                                    const priorityBadgeColor = 
                                                        task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200';
                                                    return (
                                                        <tr 
                                                            key={task.id}
                                                            className={`group transition-all duration-200 ${task.is_completed ? 'bg-slate-50/40' : 'hover:bg-slate-50/20'} ${completedTaskId === task.id ? 'bg-green-50/60' : ''} ${animatedTaskId === task.id ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
                                                        >
                                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                <button
                                                                    onClick={() => handleToggleTask(task)}
                                                                    className={`transition-colors duration-300 ${task.is_completed ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-slate-400'} ${completedTaskId === task.id ? 'scale-125' : ''}`}
                                                                >
                                                                    <CheckCircleIcon className={`h-5 w-5 ${task.is_completed ? 'fill-current' : ''}`} />
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                                <span className={task.is_completed ? 'text-slate-400 line-through font-normal' : 'text-slate-800'}>
                                                                    {task.content}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-xs">
                                                                {task.due_date ? (
                                                                    <span className={isOverdue ? 'text-red-600 font-bold flex items-center gap-1.5' : 'text-slate-600 font-medium'}>
                                                                        {task.due_date.includes('T') 
                                                                            ? new Date(task.due_date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                                            : new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                        }
                                                                        {isOverdue && <span className="text-[9px] font-bold uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full border border-red-200">Overdue</span>}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400 italic">No date set</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold">
                                                                <span className={`px-2.5 py-0.5 rounded-full border ${priorityBadgeColor}`}>
                                                                    {task.priority}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                                                                {task.created_by?.name || 'Unknown'}
                                                            </td>
                                                             <td className="px-4 py-3 whitespace-nowrap text-right text-xs">
                                                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg" onClick={() => handleEditTaskClick(task)}>
                                                                        <EditIcon className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg" onClick={() => handleDeleteTaskClick(task)}>
                                                                        <Trash2Icon className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                             </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ... (Documents & Activity Cards - no major changes needed except maybe keeping them consistent) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 space-y-4">
                                {documentUploads.map((row) => (
                                    <div key={row.id} className="flex gap-2 items-center">
                                        <Select
                                            value={row.docType}
                                            onChange={(e) => handleUploadRowChange(row.id, { docType: e.target.value })}
                                            className="w-1/3"
                                        >
                                            {DOCUMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                        </Select>
                                        <div className="flex-1 relative">
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => handleUploadRowChange(row.id, { file: e.target.files?.[0] || null })}
                                            />
                                            <div className="w-full px-3 py-2 border rounded-md text-sm text-slate-500 bg-white flex items-center justify-between">
                                                <span className="truncate">{row.file ? row.file.name : "Choose file..."}</span>
                                                <FileUpIcon className="h-4 w-4" />
                                            </div>
                                        </div>
                                         {documentUploads.length > 1 && (
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveUploadRow(row.id)}>
                                                <Trash2Icon className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleAddUploadRow} className="text-gray-600">
                                        <PlusIcon className="h-4 w-4 mr-1" /> Add Another File
                                    </Button>
                                    <Button onClick={handleUploadSelectedFiles} disabled={isUploading || !documentUploads.some(r => r.file)} className="flex-1 bg-[#1c398e] text-white hover:bg-[#152c6f]">
                                        {isUploading ? 'Uploading...' : 'Upload All Selected'}
                                    </Button>
                                </div>
                            </div>

                             <div className="space-y-3">
                                {isLoadingDetails && <div className="text-center py-4 text-slate-500">Loading documents...</div>}

                                {(!displayDocuments || displayDocuments.length === 0) && !isLoadingDetails && (
                                    <p className="text-sm text-slate-500 text-center py-4">No documents uploaded.</p>
                                )}

                                {displayDocuments?.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-blue-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <FileTextIcon className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{doc.type}</p>
                                                <p className="text-xs text-slate-500">{doc.name} • {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <DownloadIcon className="h-4 w-4" />
                                            </a>
                                            <button
                                                onClick={() => handleDeleteClick(doc)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2Icon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                        </CardHeader>
                         <CardContent>
                             <div className="flex gap-2 mb-6">
                                <Input
                                    placeholder="Add a note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                    className="flex-1"
                                />
                                <Button onClick={handleAddNote}>Add Note</Button>
                            </div>
                             <div className="relative pl-4 border-l-2 border-slate-200 space-y-8">
                                {isLoadingDetails && <div className="text-center py-4 text-slate-500">Loading history...</div>}

                                {displayActivities?.map((activity) => (
                                    <div key={activity.id} className="relative">
                                         <div className="absolute -left-[23px] top-1 bg-white border-2 border-slate-200 rounded-full p-1">
                                            <ActivityIcon type={activity.type} />
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-medium text-slate-900">
                                                    {activity.user?.name || 'Unknown User'}
                                                    <span className="font-normal text-slate-600"> {activity.type === 'Note' ? 'added a note' : 'updated the lead'}</span>
                                                </p>
                                                <span className="text-xs text-slate-400">{timeAgo(activity.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{activity.content}</p>
                                        </div>
                                    </div>
                                ))}

                                {!isLoadingDetails && (!displayActivities || displayActivities.length === 0) && (
                                    <p className="text-sm text-slate-500 italic ml-2">No activity recorded yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* ... (Status Card) */}
                    <Card>
                         <CardContent className="p-4 grid grid-cols-2 gap-4">
                             <div>
                                <h4 className="text-xs font-semibold uppercase text-slate-500">Status</h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                                    {lead.status}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold uppercase text-slate-500">Priority</h4>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2.5 w-2.5 rounded-full ${getPriorityColor(lead.priority)}`}></div>
                                    <span className="text-sm font-medium">{lead.priority}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ... (Assigned To Card) */}
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                            {lead.assigned_to ? (
                                <img src={lead.assigned_to.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.assigned_to.name)}`} alt={lead.assigned_to.name} className="h-10 w-10 rounded-full" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1c398e] font-bold text-sm shrink-0">HO</div>
                            )}
                            <div>
                                <CardTitle className="text-base">Assigned To</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    {lead.assigned_to ? lead.assigned_to.name : (
                                        <span className="font-semibold text-[#1c398e]">🏢 Head Office</span>
                                    )}
                                </CardDescription>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                           <CardTitle className="text-base flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-full bg-blue-50 text-[#1c398e]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    </div>
                                    Payment Progress
                                </div>
                                <Button size="sm" variant="ghost" onClick={handleOpenReceipt} title="View Receipt">
                                    <FileTextIcon className="h-4 w-4 text-blue-600" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <span>Payment Status</span>
                                    <span>{Math.min(Math.round((advance_paid / (lead.total_payment || 1)) * 100), 100)}% Paid</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner relative">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-[#1c398e] transition-all duration-700 ease-out shadow-sm relative"
                                        style={{ width: `${Math.min(((advance_paid / (lead.total_payment || 1)) * 100), 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-xs text-slate-500 block mb-1">Total Amount</span>
                                    <span className="font-bold text-slate-800 text-base">₹{(lead.total_payment || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                    <span className="text-xs text-green-600 block mb-1">Advance Paid</span>
                                    <span className="font-bold text-green-700 text-base">₹{advance_paid.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            
                            <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                                <span className="text-sm font-medium text-slate-600">Remaining Due</span>
                                <span className="text-lg font-bold text-[#1c398e]">₹{((lead.total_payment || 0) - advance_paid).toLocaleString('en-IN')}</span>
                            </div>
                            <Button className="w-full mt-2" onClick={handleOpenReceipt} variant="outline">
                                View / Download Receipt
                            </Button>

                            {/* Payment History List */}
                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Payment History</h4>
                                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                                    {(lead.payments && lead.payments.length > 0) ? lead.payments.map((payment) => (
                                        <div key={payment.id} className="relative group p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 transition-all">
                                            {/* Header: Date & Check# */}
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                    {new Date(payment.date).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-400">{payment.receipt_number}</span>
                                            </div>

                                            {/* Financials Grid */}
                                            <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-sm mb-2">
                                                <div className="text-slate-500 text-xs">Bill Total:</div>
                                                <div className="text-right font-medium text-slate-800">₹{(payment.total || 0).toLocaleString('en-IN')}</div>
                                                
                                                <div className="text-slate-500 text-xs">Received:</div>
                                                <div className="text-right font-bold text-green-600">₹{(payment.received || payment.amount || 0).toLocaleString('en-IN')}</div>
                                                
                                                <div className="text-slate-500 text-xs">Due:</div>
                                                <div className={`text-right font-bold ${(payment.due || 0) > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                    ₹{(payment.due || 0).toLocaleString('en-IN')}
                                                </div>
                                            </div>

                                            {/* Footer: Sales & Method */}
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-1">
                                                <div className="flex flex-col">
                                                     <span className="text-[9px] text-indigo-400 uppercase font-bold">Sales Credit</span>
                                                     <span className="text-xs font-bold text-indigo-700">₹{(payment.sales_amount || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] text-slate-400 block">{payment.method}</span>
                                                </div>
                                            </div>

                                            {/* Edit Action */}
                                            <div className="absolute top-2 right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    className="h-7 text-xs shadow-sm bg-white hover:bg-blue-50"
                                                    onClick={() => setEditingPayment(payment)}
                                                >
                                                    View / Edit
                                                </Button>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-slate-400 italic text-center py-2">No payments recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                     {/* ... (Lead Score Card) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TargetIcon className="h-5 w-5 text-slate-500" />
                                Lead Score
                            </CardTitle>
                        </CardHeader>
                         <CardContent>
                             <div className="text-center mb-4">
                                <p className="text-5xl font-bold">{score}</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${scoreInfo.color} ${scoreInfo.textColor}`}>
                                    {scoreInfo.category} Lead
                                </span>
                            </div>
                            <ul className="text-sm space-y-1 text-slate-600">
                                {scoreBreakdown.map(item => (
                                    <li key={item.label} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-b-0">
                                        <span>{item.label}</span>
                                        <span className="font-semibold text-slate-800">{item.points}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Receipt Modal */}
            <Dialog 
                isOpen={isReceiptOpen} 
                onClose={() => setIsReceiptOpen(false)}
                title="Payment Receipt"
                maxWidth="max-w-4xl"
            >
                <StandardInvoice
                    customer={{
                        name: lead.first_name + ' ' + lead.last_name,
                        email: lead.email,
                        phone: lead.phone_number,
                        address: lead.address,
                        business_name: lead.business_name || '',
                        business_address: lead.address,
                        id: lead.id,
                        reference_number: lead.reference_number, // Sync Lead Reference ID to Invoice view
                        branch_name: '', // Optional or default
                        created_at: lead.created_at,
                        is_active: true,
                         // ... map other fields ensuring compatibility with Customer type
                    } as any}
                    invoiceNumber={lead.payments && lead.payments.length > 0 ? lead.payments[lead.payments.length - 1].receipt_number : (lead.reference_number || `E-000-${new Date(lead.created_at).getFullYear()}`)}
                    date={new Date().toLocaleDateString('en-GB')}
                    items={invoiceItems}
                    subtotal={receiptSubtotal}
                    advanceAmount={advance_paid}
                    grandTotal={receiptSubtotal} // Receipt shows total project value
                    title="PAYMENT SUMMARY"
                    type="invoice"
                />
                <div className="flex justify-end mt-4">
                     <Button variant="ghost" onClick={() => setIsReceiptOpen(false)}>Close</Button>
                </div>
            </Dialog>

            <ConfirmationDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Document"
                description={`Are you sure you want to delete the document "${docToDelete?.name}"? This action cannot be undone.`}
                confirmButtonText="Yes, Delete"
            />
             <ConfirmationDialog
                isOpen={isTaskDeleteConfirmOpen}
                onClose={() => setIsTaskDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDeleteTask}
                title="Delete Task"
                description={`Are you sure you want to delete this task: "${taskToDelete?.content}"?`}
                confirmButtonText="Yes, Delete"
            />

            {/* Edit Payment Dialog */}
            {editingPayment && (
                <EditPaymentDialog 
                    isOpen={!!editingPayment} 
                    onClose={() => setEditingPayment(null)} 
                    payment={editingPayment} 
                    onSave={handleSavePaymentEdit} 
                />
            )}

            {/* Edit Task / Agenda Dialog */}
            {isEditTaskDialogOpen && (
                <Dialog
                    isOpen={isEditTaskDialogOpen}
                    onClose={() => {
                        setIsEditTaskDialogOpen(false);
                        setEditingTask(null);
                    }}
                    title="Edit Scheduled Task / Agenda"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 block mb-1">Task / Agenda Description</label>
                            <Input
                                placeholder="Enter details..."
                                value={editTaskContent}
                                onChange={(e) => setEditTaskContent(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Due Date & Time</label>
                                <Input
                                    type="datetime-local"
                                    value={editTaskDueDate}
                                    onChange={(e) => setEditTaskDueDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Priority</label>
                                <Select
                                    value={editTaskPriority}
                                    onChange={(e) => setEditTaskPriority(e.target.value as TaskPriority)}
                                    className="w-full"
                                >
                                    {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                            <Button variant="ghost" onClick={() => {
                                setIsEditTaskDialogOpen(false);
                                setEditingTask(null);
                            }}>Cancel</Button>
                            <Button onClick={handleSaveTaskEdit} className="bg-[#1c398e] text-white hover:bg-[#152c6f]">Save Changes</Button>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default LeadDetail;