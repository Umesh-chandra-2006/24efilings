import React, { useState } from 'react';
import { ServiceSet } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { ChevronDown } from './icons';

interface ServiceSetItemProps {
    serviceSet: ServiceSet;
    onAddPayment: (amount: number, method: string) => void;
}

export const ServiceSetItem: React.FC<ServiceSetItemProps> = ({ serviceSet, onAddPayment }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Bank Transfer'>('UPI');

    const handleAdd = () => {
        const val = parseFloat(amount);
        if (val > 0) {
            onAddPayment(val, method);
            setAmount('');
        } else {
            alert('Enter valid amount');
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-slate-50">
            <button
                className="w-full flex items-center justify-between p-3 bg-slate-100 hover:bg-slate-200 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="font-semibold text-slate-700">{serviceSet.mainService}</span>
                </div>
            </button>
            {isExpanded && (
                <div className="p-3 border-t border-slate-200">
                    <ul className="space-y-1 pl-4 list-disc list-inside text-sm mb-4">
                        {(serviceSet.subservices || []).map((sub, idx) => (
                            <li key={idx}>
                                {sub.name} (Qty: {sub.quantity || 1}, Rate: ₹{(sub.amount || 0).toLocaleString('en-IN')})
                            </li>
                        ))}
                        {serviceSet.service_fee ? (
                            <li className="font-medium text-slate-700">
                                Service Fee: ₹{(serviceSet.service_fee).toLocaleString('en-IN')}
                            </li>
                        ) : null}
                        {serviceSet.discount ? (
                            <li className="font-medium text-red-500">
                                Discount: -₹{(serviceSet.discount).toLocaleString('en-IN')}
                            </li>
                        ) : null}
                    </ul>

                    <div className="bg-white p-3 rounded border border-slate-200">
                        <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Update Payment</h5>
                        <div className="flex flex-col gap-2">
                            <Input
                                type="number"
                                placeholder="Amount (₹)"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Select
                                    value={method}
                                    onChange={e => setMethod(e.target.value as any)}
                                    className="flex-1"
                                >
                                    <option>UPI</option>
                                    <option>Card</option>
                                    <option>Bank Transfer</option>
                                    <option>Cash</option>
                                </Select>
                                <Button size="sm" onClick={handleAdd}>Add</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
