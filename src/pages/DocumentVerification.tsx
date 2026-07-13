import React, { useState } from 'react';
import { Lead, Document as DocType } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Popover } from '../components/ui/Popover';
import { Calendar } from '../components/ui/Calendar';
import { CalendarIcon } from '../components/icons';
import { Dialog } from '../components/ui/Dialog';
import { Textarea } from '../components/ui/Textarea';

interface DocumentVerificationProps {
  leads?: Lead[];
  dateRange?: { from: string; to: string };
  setDateRange?: (value: React.SetStateAction<{ from: string; to: string; }>) => void;
  onUpdateDocumentStatus?: (leadId: string, docId: string, status: 'Approved' | 'Rejected', notes: string) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  leads = [],
  dateRange = { from: '', to: '' },
  setDateRange,
  onUpdateDocumentStatus
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ lead: Lead, doc: DocType, action: 'Approved' | 'Rejected' } | null>(null);
  const [reason, setReason] = useState('');

  const leadsWithDocs = leads.filter(lead => lead.documents && lead.documents.length > 0);

  const getStatusChip = (status: 'Pending' | 'Approved' | 'Rejected') => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
  }

  const handleActionClick = (lead: Lead, doc: DocType, action: 'Approved' | 'Rejected') => {
    setModalData({ lead, doc, action });
    setIsModalOpen(true);
    setReason(doc.verification_notes || '');
  };

  const handleConfirmAction = () => {
    if (modalData) {
      onUpdateDocumentStatus?.(modalData.lead.id, modalData.doc.id, modalData.action, reason);
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setReason('');
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Verification</h1>
          <p className="text-slate-500">Review and approve or reject client documents.</p>
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
                    <span>Filter by creation date</span>
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
            <Button variant="ghost" size="sm" onClick={() => setDateRange?.({ from: '', to: '' })}>
              Clear
            </Button>
          }
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Pending Documents</CardTitle>
          <CardDescription>Documents that require your attention.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-auto max-h-[70vh] -mx-4 md:-mx-6 border-b rounded-t-md">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-[#1c398e] text-white sticky top-0 z-10 shadow-sm">
                <tr>
                  <th scope="col" className="px-4 py-3 md:px-6 font-medium text-left">Lead / Document</th>
                  <th scope="col" className="px-4 py-3 md:px-6 hidden sm:table-cell font-medium text-left">Uploaded</th>
                  <th scope="col" className="px-4 py-3 md:px-6 font-medium text-left">Status</th>
                  <th scope="col" className="px-4 py-3 md:px-6 font-medium text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {leadsWithDocs.flatMap(lead =>
                  lead.documents?.map(doc => (
                    <tr key={`${lead.id}-${doc.id}`} className="bg-white border-b hover:bg-slate-50/50">
                      <td className="px-4 py-3 md:px-6">
                        <div className="font-semibold">{lead.business_name}</div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#1c398e] font-medium text-sm">{doc.type}</a>
                        <div className="text-xs text-slate-500">{doc.name}</div>
                      </td>
                      <td className="px-4 py-3 md:px-6 hidden sm:table-cell">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 md:px-6">
                        {getStatusChip(doc.status)}
                        {doc.verification_notes && (
                          <p className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={doc.verification_notes}>
                            Note: {doc.verification_notes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 md:px-6">
                        {doc.status === 'Pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50" onClick={() => handleActionClick(lead, doc, 'Approved')}>Approve</Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleActionClick(lead, doc, 'Rejected')}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`${modalData?.action} Document`}
        description={`Add a reason for ${modalData?.action === 'Approved' ? 'approving' : 'rejecting'} "${modalData?.doc.name}".`}
      >
        <div className="space-y-4">
          <label htmlFor="verification-reason" className="text-sm font-medium text-slate-700">Reason / Notes (Optional)</label>
          <Textarea
            id="verification-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Document is clear and valid."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleConfirmAction} variant={modalData?.action === 'Approved' ? 'primary' : 'destructive'}>
              Confirm {modalData?.action}
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
};

export default DocumentVerification;