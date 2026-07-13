import React, { useState, useRef, useEffect } from 'react';
import { Lead } from '../types';
import { getPriorityColor } from '../constants';
import { Clock, MoreHorizontal, FileText, Trash2, Edit, Target } from 'lucide-react';
import { getScoreCategory } from '../lib/scoring';
import { Badge } from './ui/Badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { Card } from './ui/Card';

interface LeadCardProps {
    lead: Lead;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, leadId: string) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onViewLead: (leadId: string) => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onDragStart, onDragEnd, onViewLead, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const scoreInfo = getScoreCategory(lead.score || 0);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(prev => !prev);
    }

    // Priority colors mapping for border/accent
    const getPriorityBorderColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'border-l-red-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-blue-500';
            default: return 'border-l-slate-300';
        }
    }

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead.id)}
            onDragEnd={onDragEnd}
            onClick={() => onViewLead(lead.id)}
            className={cn(
                "group relative bg-card text-card-foreground rounded-xl shadow-sm border border-border/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing overflow-hidden",
                "border-l-[3px]",
                getPriorityBorderColor(lead.priority)
            )}
        >
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="pr-[4.5rem]">
                        <h3 className="font-semibold text-base leading-tight truncate">{lead.business_name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{lead.first_name} {lead.last_name}</p>
                    </div>

                    <div className="absolute top-2 right-2" ref={menuRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleMenuClick}
                        >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>

                        {isMenuOpen && (
                            <div className="absolute z-50 right-0 mt-1 w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                                <button onClick={(e) => { e.stopPropagation(); onViewLead(lead.id); setIsMenuOpen(false); }} className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                                    <FileText className="mr-2 h-3.5 w-3.5" /> View Details
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onEdit(); setIsMenuOpen(false); }} className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                                    <Edit className="mr-2 h-3.5 w-3.5" /> Edit Lead
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(); setIsMenuOpen(false); }} className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-destructive hover:bg-destructive/10 hover:text-destructive">
                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Badges/Tags */}
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider font-bold py-0 h-5 border-0 bg-secondary text-secondary-foreground")}>
                        {lead.status}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px] font-bold py-0 h-5 gap-1 border-0", scoreInfo.color, scoreInfo.textColor)}>
                        <Target className="h-3 w-3" /> {lead.score || 0}
                    </Badge>
                </div>

                {/* Shared Indicator */}
                {/* We need to know who the current user is to show "Shared". 
                    However, LeadCard doesn't have currentUser prop easily available without prop drilling.
                    We can infer it if we check if we are viewing the "My Leads" section and the lead is not assigned to us?
                    For now, let's just show it if we have the info. 
                    Actually, we can pass currentUser or check if created_by exists and differs from assigned_to.
                */}
                {(lead.created_by && lead.assigned_to && lead.created_by !== lead.assigned_to.id) && (
                    <div className="absolute top-2 right-9">
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 h-5 px-1.5">
                            Shared
                        </Badge>
                    </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{timeAgo(lead.created_at)}</span>
                    </div>

                    <Avatar className="h-6 w-6 border border-background ring-1 ring-border/50">
                        <AvatarImage src={lead.assigned_to?.avatar_url} alt={lead.assigned_to?.name} />
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                            {lead.assigned_to?.name?.substring(0, 2).toUpperCase() || 'UN'}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
    );
};

