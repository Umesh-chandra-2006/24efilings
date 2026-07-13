import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { TransferLog } from '../../types';
import { Clock, Search, ArrowRightLeft, ShieldAlert, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditLogsSettingsProps {
    transferLogs: TransferLog[];
    auditLogs: any[];
}

export const AuditLogsSettings: React.FC<AuditLogsSettingsProps> = ({ transferLogs, auditLogs }) => {
    const [subTab, setSubTab] = useState<'transfers' | 'audit'>('transfers');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

    const filteredTransfers = useMemo(() => {
        if (!transferLogs) return [];
        return transferLogs.filter(log => {
            const q = searchQuery.toLowerCase();
            return (
                (log.employee_name && log.employee_name.toLowerCase().includes(q)) ||
                (log.transferred_by_name && log.transferred_by_name.toLowerCase().includes(q)) ||
                (log.from_city_name && log.from_city_name.toLowerCase().includes(q)) ||
                (log.to_city_name && log.to_city_name.toLowerCase().includes(q)) ||
                (log.from_branch_name && log.from_branch_name.toLowerCase().includes(q)) ||
                (log.to_branch_name && log.to_branch_name.toLowerCase().includes(q)) ||
                (log.transfer_type && log.transfer_type.toLowerCase().includes(q))
            );
        });
    }, [transferLogs, searchQuery]);

    const filteredAudits = useMemo(() => {
        if (!auditLogs) return [];
        return auditLogs.filter(log => {
            const q = searchQuery.toLowerCase();
            return (
                (log.action && log.action.toLowerCase().includes(q)) ||
                (log.entity && log.entity.toLowerCase().includes(q)) ||
                (log.user_name && log.user_name.toLowerCase().includes(q)) ||
                (log.details && JSON.stringify(log.details).toLowerCase().includes(q))
            );
        });
    }, [auditLogs, searchQuery]);

    const toggleExpandAudit = (id: string) => {
        setExpandedAuditId(prev => prev === id ? null : id);
    };

    const formatDate = (isoString: string) => {
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-400" /> System Action & Transfer Logs
                    </h3>
                    <p className="text-xs text-slate-500">Monitor employee transfers and system administrative actions.</p>
                </div>
                
                {/* Search bar */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-full text-xs pl-9 pr-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => { setSubTab('transfers'); setSearchQuery(''); }}
                    className={`px-4 py-2 border-b-2 font-bold text-xs transition-colors cursor-pointer outline-none ${
                        subTab === 'transfers'
                            ? 'border-[#1c398e] text-[#1c398e]'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    User Transfer Logs ({filteredTransfers.length})
                </button>
                <button
                    onClick={() => { setSubTab('audit'); setSearchQuery(''); }}
                    className={`px-4 py-2 border-b-2 font-bold text-xs transition-colors cursor-pointer outline-none ${
                        subTab === 'audit'
                            ? 'border-[#1c398e] text-[#1c398e]'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    System Actions ({filteredAudits.length})
                </button>
            </div>

            {subTab === 'transfers' ? (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                                <tr>
                                    <th className="px-5 py-3.5 whitespace-nowrap">Employee</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">Transfer Type</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">From Location</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">To Location</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">Transferred By</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTransfers.length > 0 ? (
                                    filteredTransfers.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3 whitespace-nowrap font-bold text-slate-800">
                                                {log.employee_name}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                                                    log.transfer_type === 'City Transfer'
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                }`}>
                                                    {log.transfer_type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="font-semibold text-slate-700">{log.from_city_name}</div>
                                                <div className="text-[10px] text-slate-400">{log.from_branch_name}</div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="font-semibold text-slate-700">{log.to_city_name}</div>
                                                <div className="text-[10px] text-slate-400">{log.to_branch_name}</div>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap font-medium text-slate-600">
                                                {log.transferred_by_name}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-slate-400 font-mono">
                                                {formatDate(log.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-slate-400 italic">
                                            No transfer logs found matching search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAudits.length > 0 ? (
                        filteredAudits.map((log) => {
                            const isExpanded = expandedAuditId === log.id;
                            return (
                                <div key={log.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
                                    <div 
                                        onClick={() => toggleExpandAudit(log.id)}
                                        className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2 bg-slate-50 border rounded-lg text-slate-500 shrink-0">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-slate-800 text-sm">{log.action}</span>
                                                    <span className="text-[9px] uppercase tracking-wider bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                                                        {log.entity}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Performed by <span className="font-semibold text-slate-700">{log.user_name}</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="text-[10px] text-slate-400 font-mono">{formatDate(log.created_at)}</span>
                                            {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Details JSON</p>
                                            <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
                                                {typeof log.details === 'object' 
                                                    ? JSON.stringify(log.details, null, 2) 
                                                    : typeof log.details === 'string'
                                                        ? (() => {
                                                            try {
                                                                return JSON.stringify(JSON.parse(log.details), null, 2);
                                                            } catch (e) {
                                                                return log.details;
                                                            }
                                                        })()
                                                        : JSON.stringify(log.details || {}, null, 2)
                                                }
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 italic">
                            No system action logs found matching search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
