import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { useApi } from '../../hooks/useApi';
import { Loader2, Bell, Mail, MessageSquare } from 'lucide-react';

interface NotificationSettingsProps {
    showToast: (type: 'success' | 'error', message: string) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ showToast }) => {
    const { settings, updateOrganizationSettings } = useApi();
    const [saving, setSaving] = useState(false);

    // Default rules structure
    const defaultRules = [
        { id: 'lead_assigned', label: 'Lead Assigned', email: true, in_app: true, sms: false },
        { id: 'lead_status', label: 'Lead Status Changed', email: false, in_app: true, sms: false },
        { id: 'payment_received', label: 'Payment Received', email: true, in_app: true, sms: true },
        { id: 'doc_uploaded', label: 'Document Uploaded', email: true, in_app: true, sms: false },
    ];

    const [rules, setRules] = useState(defaultRules);

    useEffect(() => {
        if (settings && (settings as any).notification_rules && (settings as any).notification_rules.length > 0) {
            setRules((settings as any).notification_rules);
        }
    }, [settings]);

    const handleToggle = (id: string, channel: 'email' | 'in_app' | 'sms') => {
        setRules(current =>
            current.map(rule =>
                rule.id === id ? { ...rule, [channel]: !rule[channel] } : rule
            )
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateOrganizationSettings({
                // @ts-ignore
                notification_rules: rules
            });
            showToast('success', "Notification rules updated");
        } catch (e: any) {
            showToast('error', e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Rules</CardTitle>
                <CardDescription>Control how and when the system notifies users.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-3">Event</th>
                                <th className="px-4 py-3 text-center"><Mail className="w-4 h-4 mx-auto mb-1" /> Email</th>
                                <th className="px-4 py-3 text-center"><Bell className="w-4 h-4 mx-auto mb-1" /> In-App</th>
                                <th className="px-4 py-3 text-center"><MessageSquare className="w-4 h-4 mx-auto mb-1" /> SMS/WhatsApp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rules.map(rule => (
                                <tr key={rule.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-700">{rule.label}</td>
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={rule.email}
                                            onChange={() => handleToggle(rule.id, 'email')}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={rule.in_app}
                                            onChange={() => handleToggle(rule.id, 'in_app')}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={rule.sms}
                                            onChange={() => handleToggle(rule.id, 'sms')}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end pt-6">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save Rules'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
