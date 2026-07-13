import React, { useState, useEffect } from 'react';
import { Lead } from '../../types';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { Input } from './Input';

interface SuccessConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dob: string, pan: string, aadhar: string) => void;
  lead: Lead | null;
}

export const SuccessConversionModal: React.FC<SuccessConversionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lead,
}) => {
  const [dob, setDob] = useState('');
  const [pan, setPan] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setDob('');
      setPan(lead.pan_number || '');
      setAadhar('');
      setError(null);
    }
  }, [lead, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dob) {
      setError('Date of Birth is mandatory to convert this lead.');
      return;
    }

    // Optional validation for PAN format if entered
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
      setError('Invalid PAN number format (e.g. ABCDE1234F).');
      return;
    }

    onConfirm(dob, pan.toUpperCase(), aadhar);
  };

  if (!lead) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="🎉 Lead Success: Convert to Customer"
      description={`Excellent job! Let's convert "${lead.business_name || (lead.first_name + ' ' + lead.last_name)}" into a customer record. Date of Birth is mandatory.`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="modal-dob" className="block text-xs font-semibold text-slate-700">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <Input
            id="modal-dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            className="w-full bg-white text-slate-800"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="modal-pan" className="block text-xs font-semibold text-slate-700">
            PAN Number (Optional)
          </label>
          <Input
            id="modal-pan"
            placeholder="ABCDE1234F"
            value={pan}
            onChange={(e) => setPan(e.target.value)}
            className="w-full bg-white text-slate-800"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="modal-aadhar" className="block text-xs font-semibold text-slate-700">
            Aadhar Number (Optional)
          </label>
          <Input
            id="modal-aadhar"
            placeholder="Enter Aadhar Number"
            value={aadhar}
            onChange={(e) => setAadhar(e.target.value)}
            className="w-full bg-white text-slate-800"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel Status Change
          </Button>
          <Button type="submit" disabled={!dob} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Convert to Customer
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
