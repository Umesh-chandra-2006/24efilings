import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { User, TransferLog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// New Components
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { CompanySettings } from '../components/settings/CompanySettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { LeadSettings } from '../components/settings/LeadSettings';
import { RoleSettings } from '../components/settings/RoleSettings';
import { BillingSettings } from '../components/settings/BillingSettings';
import { AuditLogsSettings } from '../components/settings/AuditLogsSettings';

interface SettingsProps {
    currentUser?: User;
    transferLogs?: TransferLog[];
    auditLogs?: any[];
}

const Settings: React.FC<SettingsProps> = ({
    currentUser = { id: '', name: '', role: 'Sales Executive' } as any,
    transferLogs = [],
    auditLogs = []
}) => {
    // Toast State
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToastMessage({ type, message });
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Navigation
    const allTabs: { name: string, access: User['role'][] }[] = [
        { name: 'Profile', access: ['Super Admin', 'Admin', 'Sales Executive'] },
        { name: 'Security', access: ['Super Admin', 'Admin', 'Sales Executive'] },
        { name: 'Notifications', access: ['Super Admin', 'Admin', 'Sales Executive'] },
        { name: 'Company Profile', access: ['Super Admin'] },
        { name: 'Lead Settings', access: ['Super Admin', 'Admin'] },
        { name: 'Roles & Permissions', access: ['Super Admin', 'Admin'] },
        { name: 'Billing', access: ['Super Admin'] },
        { name: 'Audit Logs', access: ['Super Admin'] },
    ];

    const accessibleTabs = allTabs.filter(tab => tab.access.includes(currentUser.role));
    // Ensure activeTab is valid
    const [activeTab, setActiveTab] = useState(() => {
        return accessibleTabs.find(t => t.name === 'Profile')?.name || accessibleTabs[0]?.name || 'Profile';
    });

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Profile':
                return <ProfileSettings currentUser={currentUser} showToast={showToast} />;
            case 'Security':
                return <SecuritySettings currentUser={currentUser} showToast={showToast} />;
            case 'Notifications':
                return <NotificationSettings showToast={showToast} />;
            case 'Company Profile':
                return <CompanySettings showToast={showToast} />;
            case 'Lead Settings':
                return <LeadSettings showToast={showToast} />;
            case 'Roles & Permissions':
                return <RoleSettings showToast={showToast} />;
            case 'Billing':
                return <BillingSettings />;
            case 'Audit Logs':
                return <AuditLogsSettings transferLogs={transferLogs} auditLogs={auditLogs} />;
            default: return null;
        }
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-slate-500">Manage your account and system preferences.</p>
            </header>

            {/* Custom Toast Notification Area */}
            {toastMessage && (
                <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-opacity animate-in fade-in slide-in-from-top-5 ${toastMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border`}>
                    {toastMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="font-medium text-sm">{toastMessage.message}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto custom-scrollbar" aria-label="Tabs">
                            {accessibleTabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`${activeTab === tab.name
                                        ? 'border-[#1c398e] text-[#1c398e]'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
                                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer outline-none focus:text-[#1c398e]`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </CardHeader>
                <CardContent className="min-h-[400px] p-6">
                    {renderTabContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;
