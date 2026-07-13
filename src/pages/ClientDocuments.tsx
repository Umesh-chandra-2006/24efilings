import React, { useRef, useState, useMemo } from 'react';
import { Lead, Document as DocType } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileUpIcon, Trash2Icon, CalendarIcon, SearchIcon, FileTextIcon, DownloadIcon } from '../components/icons';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Popover } from '../components/ui/Popover';
import { Calendar } from '../components/ui/Calendar';

interface ClientDocumentsProps {
    leads: Lead[];
    dateRange: { from: string; to: string };
    setDateRange: (value: React.SetStateAction<{ from: string; to: string; }>) => void;
    onUploadDocument: (leadId: string, file: File) => Promise<void>;
    onDeleteDocument: (leadId: string, docId: string) => Promise<void>;
    onViewLead: (leadId: string) => void;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const ClientDocuments: React.FC<ClientDocumentsProps> = ({ leads, dateRange, setDateRange, onUploadDocument, onDeleteDocument, onViewLead }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingLeadId, setUploadingLeadId] = useState<string | null>(null);
    const [docToDelete, setDocToDelete] = useState<{ leadId: string, doc: DocType } | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusChip = (status: 'Pending' | 'Approved' | 'Rejected') => {
        const colors = {
            Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Approved: 'bg-green-100 text-green-800 border-green-200',
            Rejected: 'bg-red-100 text-red-800 border-red-200',
        };
        return <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${colors[status]}`}>{status}</span>;
    }

    const handleUploadClick = (leadId: string) => {
        setUploadingLeadId(leadId);
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && uploadingLeadId) {
            try {
                await onUploadDocument(uploadingLeadId, file);
            } catch (error) {
                console.error("Upload failed", error);
            } finally {
                setUploadingLeadId(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };

    const handleDeleteClick = (leadId: string, doc: DocType) => {
        setDocToDelete({ leadId, doc });
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (docToDelete) {
            await onDeleteDocument(docToDelete.leadId, docToDelete.doc.id);
            setIsDeleteConfirmOpen(false);
            setDocToDelete(null);
        }
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch =
                lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [leads, searchQuery]);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" />
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Client Documents</h1>
                    <p className="text-slate-500 mt-1">Centralized document management for all your clients.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Popover
                            align="end"
                            trigger={
                                <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal gap-2 bg-white shadow-sm hover:bg-slate-50">
                                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                                    <span className="hidden sm:inline">
                                        {dateRange.from ? (
                                            dateRange.to ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}` : `${formatDate(dateRange.from)}`
                                        ) : (
                                            <span className="text-slate-500">Filter Date</span>
                                        )}
                                    </span>
                                </Button>
                            }
                            content={<Calendar dateRange={dateRange} onDateChange={setDateRange} />}
                        />
                        {(dateRange.from || dateRange.to) &&
                            <Button variant="ghost" size="icon" onClick={() => setDateRange({ from: '', to: '' })} className="text-red-500 hover:bg-red-50">
                                <Trash2Icon className="h-4 w-4" />
                            </Button>
                        }
                    </div>
                </div>
            </header>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="relative overflow-auto flex-1 max-h-[70vh]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#1c398e] text-white font-medium border-b sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 w-[250px]">Client Details</th>
                                <th className="px-6 py-3">Documents Repository</th>
                                <th className="px-6 py-3 w-[150px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLeads.map(lead => (
                                <tr key={lead.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col">
                                            <button onClick={() => onViewLead(lead.id)} className="font-semibold text-slate-900 text-base text-left hover:text-blue-600 hover:underline transition-colors w-fit">
                                                {lead.business_name}
                                            </button>
                                            <span className="text-slate-500">{lead.first_name} {lead.last_name}</span>
                                            <span className="text-xs text-slate-400 mt-1">ID: {lead.id.slice(0, 8)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        {lead.documents && lead.documents.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-2">
                                                {lead.documents.map(doc => (
                                                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-md border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                                                                <FileTextIcon className="h-4 w-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-700 hover:text-blue-600 hover:underline block truncate">
                                                                    {doc.type}
                                                                </a>
                                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                    <span className="truncate max-w-[150px]">{doc.name}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 pl-2 shrink-0">
                                                            {getStatusChip(doc.status)}
                                                            <div className="flex items-center border-l pl-2 ml-2 gap-1">
                                                                <a href={doc.url} download={doc.name} title="Download">
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700">
                                                                        <DownloadIcon className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </a>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDeleteClick(lead.id, doc)}>
                                                                    <Trash2Icon className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6 text-slate-400 italic border-2 border-dashed border-slate-100 rounded-lg">
                                                <FileTextIcon className="h-8 w-8 mb-2 opacity-50" />
                                                <span>No documents uploaded</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 align-top text-right">
                                        <Button
                                            size="sm"
                                            className="gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 shadow-sm transition-all"
                                            onClick={() => handleUploadClick(lead.id)}
                                            disabled={!!uploadingLeadId}
                                        >
                                            {uploadingLeadId === lead.id ? (
                                                <>
                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-blue-600"></div>
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <FileUpIcon className="h-4 w-4" />
                                                    Upload
                                                </>
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredLeads.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <SearchIcon className="h-10 w-10 text-slate-300 mb-2" />
                                            <p className="text-lg font-medium text-slate-400">No clients found</p>
                                            <p className="text-sm">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Document"
                description={`Are you sure you want to delete the document "${docToDelete?.doc.name}" for lead "${leads.find(l => l.id === docToDelete?.leadId)?.business_name}"? This action cannot be undone.`}
                confirmButtonText="Yes, Delete"
            />
        </div>
    );
};

export default ClientDocuments;