import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast.jsx';

export const KANBAN_STAGES = [
  { id: 'NEW', label: 'New', color: 'border-t-sky-500', headerBg: 'bg-sky-50 text-sky-700' },
  { id: 'CONTACTED', label: 'Contacted', color: 'border-t-indigo-500', headerBg: 'bg-indigo-50 text-indigo-700' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'border-t-amber-500', headerBg: 'bg-amber-50 text-amber-700' },
  { id: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'border-t-purple-500', headerBg: 'bg-purple-50 text-purple-700' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: 'border-t-blue-500', headerBg: 'bg-blue-50 text-blue-700' },
  { id: 'WON', label: 'Won', color: 'border-t-emerald-500', headerBg: 'bg-emerald-50 text-emerald-700' },
  { id: 'LOST', label: 'Lost', color: 'border-t-rose-500', headerBg: 'bg-rose-50 text-rose-700' },
];

export function LeadKanbanBoard({ leads = [], onStatusChange, isUpdating = false }) {
  const { toast } = useToast();
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Group leads by stage
  const stageGroups = KANBAN_STAGES.reduce((acc, stage) => {
    acc[stage.id] = leads.filter((l) => (l.status || 'NEW') === stage.id);
    return acc;
  }, {});

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (_e, stageId) => {
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === targetStageId) return;

    try {
      await onStatusChange(leadId, targetStageId);
      toast.success(`Moved "${lead.name}" to ${targetStageId.replace(/_/g, ' ')}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update stage';
      toast.error(msg, 'Kanban Error');
    } finally {
      setDraggedLeadId(null);
    }
  };

  const handleSelectStageChange = async (lead, newStage) => {
    if (lead.status === newStage) return;
    try {
      await onStatusChange(lead.id, newStage);
      toast.success(`Updated "${lead.name}" stage to ${newStage.replace(/_/g, ' ')}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update stage';
      toast.error(msg, 'Stage Update Error');
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full space-y-2">
      {/* Mobile scroll indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 lg:hidden px-1">
        <span>Scroll horizontally to view all pipeline stages</span>
        <span className="font-semibold text-blue-600">7 Stages &rarr;</span>
      </div>

      <div className="w-full overflow-x-auto pb-4 touch-pan-x">
        <div className="flex gap-4 min-w-[1300px] items-start">
        {KANBAN_STAGES.map((stage) => {
          const columnLeads = stageGroups[stage.id] || [];
          const totalValue = columnLeads.reduce(
            (sum, l) => sum + (parseFloat(l.estimated_value) || 0),
            0,
          );
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`flex-1 flex flex-col bg-slate-100/70 rounded-2xl border-t-4 ${
                stage.color
              } border border-slate-200/80 transition min-w-[220px] max-w-[280px] ${
                isOver ? 'ring-2 ring-blue-500 bg-blue-50/40' : ''
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-slate-800 tracking-tight">
                      {stage.label}
                    </h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-200/80 text-slate-700">
                      {columnLeads.length}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2.5 min-h-[450px] flex-1">
                {columnLeads.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                    No leads
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const isBeingDragged = draggedLeadId === lead.id;
                    const assignedRep = lead.assigned_to_name || lead.assigned_user_name || 'Unassigned';

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs hover:shadow-md transition cursor-grab active:cursor-grabbing space-y-2.5 ${
                          isBeingDragged ? 'opacity-40 border-dashed border-blue-400' : ''
                        }`}
                      >
                        {/* Title & Link */}
                        <div className="flex items-start justify-between gap-1.5">
                          <Link
                            to={`/leads/${lead.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600 transition line-clamp-1 flex-1 flex items-center space-x-1"
                          >
                            <span>{lead.name}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          </Link>

                          {/* Quick stage selector */}
                          <select
                            value={lead.status || 'NEW'}
                            onChange={(e) => handleSelectStageChange(lead, e.target.value)}
                            disabled={isUpdating}
                            aria-label="Change stage"
                            className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 cursor-pointer min-h-[28px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {KANBAN_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Company & Source */}
                        <div className="space-y-1">
                          {lead.company && (
                            <div className="flex items-center space-x-1 text-[11px] text-slate-600 truncate">
                              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{lead.company}</span>
                            </div>
                          )}
                          {lead.source && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                              {lead.source}
                            </span>
                          )}
                        </div>

                        {/* Value & Assignee Footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-emerald-700">
                            {formatCurrency(lead.estimated_value)}
                          </span>

                          <div className="flex items-center space-x-1 text-slate-500 truncate max-w-[110px]" title={assignedRep}>
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                              {assignedRep[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="truncate">{assignedRep}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
