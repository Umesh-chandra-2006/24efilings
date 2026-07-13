import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Plus, ShieldAlert, Check } from 'lucide-react';
import { Settings } from 'lucide-react';

interface RoleSettingsProps {
    showToast: (type: 'success' | 'error', message: string) => void;
}

export const RoleSettings: React.FC<RoleSettingsProps> = ({ showToast }) => {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                // Try to fetch from DB
                const { data, error } = await (supabase.from('roles' as any) as any).select('*').order('created_at', { ascending: true });
                if (!error && data && data.length > 0) {
                    setRoles(data);
                } else {
                    // Fallback to constants if table empty or not accessible (or not yet created)
                    setRoles([
                        { name: 'Super Admin', description: 'Full System Access', is_system_role: true, permissions: ['all'] },
                        { name: 'Admin', description: 'Unit/Branch Management', is_system_role: true, permissions: ['manage_leads'] },
                        { name: 'Sales Executive', description: 'Lead Handling', is_system_role: true, permissions: ['view_leads'] },
                    ]);
                }
            } catch (e) {
                console.error("Error fetching roles", e);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>Manage user roles and their access levels.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" /> Create New Role</Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {roles.map((role, idx) => (
                                <div key={idx} className="border rounded-lg p-4 flex flex-col justify-between hover:border-blue-200 transition-colors bg-white shadow-sm">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-slate-800">{role.name}</h3>
                                            {role.is_system_role && <Badge variant="secondary" className="text-xs">System</Badge>}
                                        </div>
                                        <p className="text-sm text-slate-500 mb-4">{role.description || 'No description'}</p>

                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-slate-400 uppercase mb-2">Permissions</p>
                                            <div className="flex flex-wrap gap-1">
                                                {(role.permissions || []).slice(0, 3).map((p: string, i: number) => (
                                                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border">
                                                        {p.replace(/_/g, ' ')}
                                                    </span>
                                                ))}
                                                {(role.permissions || []).length > 3 && (
                                                    <span className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full border">
                                                        +{(role.permissions?.length || 0) - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <Button variant="outline" size="sm" className="w-full text-xs h-8">Edit Permissions</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
