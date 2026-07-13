import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CreditCard, Download, CheckCircle, AlertTriangle } from 'lucide-react';

export const BillingSettings: React.FC = () => {
    // Mock Data
    const currentPlan = {
        name: 'Pro Plan',
        price: '₹2,999/mo',
        renewalDate: '2025-01-14',
        status: 'Active',
        users: 15,
        storage: '50GB'
    };

    const history = [
        { id: 'INV-001', date: 'Dec 14, 2024', amount: '₹2,999', status: 'Paid' },
        { id: 'INV-002', date: 'Nov 14, 2024', amount: '₹2,999', status: 'Paid' },
    ];

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-indigo-900">Current Subscription</CardTitle>
                            <CardDescription>You are on the <span className="font-semibold text-indigo-700">{currentPlan.name}</span>.</CardDescription>
                        </div>
                        <Badge className="bg-indigo-600 text-white hover:bg-indigo-700">{currentPlan.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                            <p className="text-xs font-medium text-slate-500 uppercase">Monthly Cost</p>
                            <p className="text-2xl font-bold text-slate-900">{currentPlan.price}</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                            <p className="text-xs font-medium text-slate-500 uppercase">Next Renewal</p>
                            <p className="text-lg font-semibold text-slate-800">{currentPlan.renewalDate}</p>
                            <p className="text-xs text-slate-400">Auto-renewal is on</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                            <p className="text-xs font-medium text-slate-500 uppercase">Usage</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm font-medium">{currentPlan.users} Users</p>
                                    <p className="text-sm font-medium">{currentPlan.storage} Storage</p>
                                </div>
                                <Button variant="link" className="text-indigo-600 h-auto p-0 text-xs">Manage Limits</Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Upgrade Plan</Button>
                        <Button variant="outline">Change Payment Method</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                    <CardDescription>Download past invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {history.map(inv => (
                            <div key={inv.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded text-slate-500">
                                        <ReceiptIcon />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{inv.id}</p>
                                        <p className="text-xs text-slate-500">{inv.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-slate-700">{inv.amount}</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{inv.status}</Badge>
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-700">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Helper icon
const ReceiptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 17V7" /></svg>
);
