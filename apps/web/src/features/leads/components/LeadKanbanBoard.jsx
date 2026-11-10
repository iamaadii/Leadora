import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth.js';
import {
  Building2,
  ExternalLink,
  GripVertical,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast.jsx';
import { Select } from '../../../components/ui/Select.jsx';

export const KANBAN_STAGES = [
  {
    id: 'NEW',
    label: 'New',
    color: 'border-t-sky-500',
    headerBg: 'bg-sky-50 text-sky-700',
    badgeDot: 'bg-sky-500',
    tagBg: 'bg-sky-100/80 text-sky-800',
  },
  {
    id: 'CONTACTED',
    label: 'Contacted',
    color: 'border-t-indigo-500',
    headerBg: 'bg-indigo-50 text-indigo-700',
    badgeDot: 'bg-indigo-500',
    tagBg: 'bg-indigo-100/80 text-indigo-800',
  },
  {
    id: 'QUALIFIED',
    label: 'Qualified',
    color: 'border-t-amber-500',
    headerBg: 'bg-amber-50 text-amber-700',
    badgeDot: 'bg-amber-500',
    tagBg: 'bg-amber-100/80 text-amber-800',
  },
  {
    id: 'PROPOSAL_SENT',
    label: 'Proposal Sent',
    color: 'border-t-purple-500',
    headerBg: 'bg-purple-50 text-purple-700',
    badgeDot: 'bg-purple-500',
    tagBg: 'bg-purple-100/80 text-purple-800',
  },
  {
    id: 'NEGOTIATION',
    label: 'Negotiation',
    color: 'border-t-blue-500',
    headerBg: 'bg-blue-50 text-blue-700',
    badgeDot: 'bg-blue-500',
    tagBg: 'bg-blue-100/80 text-blue-800',
  },
  {
    id: 'WON',
    label: 'Won',
    color: 'border-t-emerald-500',
    headerBg: 'bg-emerald-50 text-emerald-700',
    badgeDot: 'bg-emerald-500',
    tagBg: 'bg-emerald-100/80 text-emerald-800',
  },
  {
    id: 'LOST',
    label: 'Lost',
    color: 'border-t-rose-500',
    headerBg: 'bg-rose-50 text-rose-700',
    badgeDot: 'bg-rose-500',
    tagBg: 'bg-rose-100/80 text-rose-800',
  },
];

export function LeadKanbanBoard({
  leads = [],
  onStatusChange,
  isUpdating = false,
  isArchived = false,
  onRestoreLead,
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isDemo = Boolean(user?.isDemo || user?.role === 'DEMO');

  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const columnRefs = useRef({});

  // Group leads by pipeline stage
  const stageGroups = KANBAN_STAGES.reduce((acc, stage) => {
    acc[stage.id] = leads.filter((l) => (l.status || 'NEW') === stage.id);
    return acc;
  }, {});

  // Total board metrics
  const totalLeadsCount = leads.length;
  const totalPipelineValue = leads.reduce(
    (sum, l) => sum + (parseFloat(l.estimated_value) || 0),
    0,
  );

  const scrollToStage = (stageId) => {
    const el = columnRefs.current[stageId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const handleDragStart = (e, leadId) => {
    if (isArchived) return; // Prevent drag on archived leads
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e, stageId) => {
    if (isArchived) return;
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
    if (isArchived) return;
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === targetStageId) return;

    if (isDemo) {
      toast.warning(
        'Action disabled in Demo Mode: Creating and modifying records is disabled in the live product demo.',
        'Demo Mode (Read-Only)',
      );
      setDraggedLeadId(null);
      return;
    }

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

    if (isDemo) {
      toast.warning(
        'Action disabled in Demo Mode: Creating and modifying records is disabled in the live product demo.',
        'Demo Mode (Read-Only)',
      );
      return;
    }

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
    <div className="w-full space-y-4">
      {/* Archived Notice Banner */}
      {isArchived && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                Archived Leads Pipeline View ({totalLeadsCount} Leads)
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Displaying archived opportunities across their recorded pipeline stages. Stage drag-and-drop is locked for archived leads.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Navigation & Jump Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Stage Jump Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Jump to:
          </span>
          {KANBAN_STAGES.map((stage) => {
            const count = stageGroups[stage.id]?.length || 0;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => scrollToStage(stage.id)}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shrink-0 transition"
                title={`Jump to ${stage.label}`}
              >
                <span className={`w-2 h-2 rounded-full ${stage.badgeDot}`} />
                <span>{stage.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200/80 text-[10px] font-bold text-slate-700">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Board Meta Totals */}
        <div className="flex items-center justify-between md:justify-end space-x-3 text-xs shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <span className="text-slate-500 font-medium">
            Leads: <strong className="text-slate-900">{totalLeadsCount}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">
            Pipeline: <strong className="text-emerald-700">{formatCurrency(totalPipelineValue)}</strong>
          </span>
        </div>
      </div>

      {/* Main Kanban Columns Scroll Area */}
      <div className="w-full overflow-x-auto pb-4 pt-1 touch-pan-x">
        <div className="flex gap-4 min-w-max items-start">
          {KANBAN_STAGES.map((stage) => {
            const columnLeads = stageGroups[stage.id] || [];
            const stageValue = columnLeads.reduce(
              (sum, l) => sum + (parseFloat(l.estimated_value) || 0),
              0,
            );
            const isOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                ref={(el) => (columnRefs.current[stage.id] = el)}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={(e) => handleDragLeave(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`w-[290px] shrink-0 flex flex-col bg-slate-100/70 rounded-2xl border-t-4 ${
                  stage.color
                } border border-slate-200/80 transition shadow-2xs ${
                  isOver ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/80 bg-white/70 rounded-t-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${stage.badgeDot}`} />
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                        {stage.label}
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700">
                        {columnLeads.length}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 pl-4">
                      {formatCurrency(stageValue)}
                    </p>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-3 min-h-[440px] max-h-[calc(100vh-270px)] overflow-y-auto flex-1">
                  {columnLeads.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-300/80 rounded-xl flex flex-col items-center justify-center p-3 text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-400">No leads in stage</p>
                      <p className="text-[10px] text-slate-400">
                        {isArchived ? 'No archived records' : 'Drag leads here to advance'}
                      </p>
                    </div>
                  ) : (
                    columnLeads.map((lead) => {
                      const isBeingDragged = draggedLeadId === lead.id;
                      const assignedRep =
                        lead.assigned_to_first_name
                          ? `${lead.assigned_to_first_name} ${lead.assigned_to_last_name || ''}`
                          : lead.assigned_to_name || lead.assigned_user_name || 'Unassigned';

                      return (
                        <div
                          key={lead.id}
                          draggable={!isArchived}
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => {
                            if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'BUTTON' && !e.target.closest('select, button')) {
                              navigate(isDemo ? `/demo/leads/${lead.id}` : `/leads/${lead.id}`);
                            }
                          }}
                          className={`group bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition space-y-2.5 cursor-pointer ${
                            !isArchived ? 'active:cursor-grabbing' : ''
                          } ${
                            isBeingDragged ? 'opacity-30 border-dashed border-blue-500 scale-95' : ''
                          }`}
                        >
                          {/* Card Header: Grab Handle, Lead Name, Link */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-1.5 flex-1 min-w-0">
                              {!isArchived && (
                                <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
                              )}
                              <Link
                                to={isDemo ? `/demo/leads/${lead.id}` : `/leads/${lead.id}`}
                                className="text-xs font-bold text-slate-900 hover:text-blue-600 transition leading-snug line-clamp-2"
                                title={lead.name}
                              >
                                {lead.name}
                              </Link>
                            </div>
                            <Link
                              to={isDemo ? `/demo/leads/${lead.id}` : `/leads/${lead.id}`}
                              className="text-slate-400 hover:text-blue-600 p-0.5 rounded shrink-0 transition"
                              title="Open lead details"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                          {/* Company & Source Badges */}
                          <div className="space-y-1.5">
                            {lead.company && (
                              <div className="flex items-center space-x-1.5 text-xs text-slate-600 truncate">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate font-medium">{lead.company}</span>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-1.5">
                              {lead.source && (
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                                  {lead.source.replace(/_/g, ' ')}
                                </span>
                              )}
                              {isArchived && (
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800">
                                  Archived
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Value & Assignee Footer */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-extrabold text-emerald-700">
                              {formatCurrency(lead.estimated_value)}
                            </span>

                            <div
                              className="flex items-center space-x-1.5 text-slate-600 text-[11px] truncate max-w-[130px]"
                              title={`Assigned to: ${assignedRep}`}
                            >
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {assignedRep[0]?.toUpperCase() || 'U'}
                              </div>
                              <span className="truncate font-medium">{assignedRep}</span>
                            </div>
                          </div>

                          {/* Quick Stage Mover or Restore Action */}
                          {!isArchived ? (
                            <div className="pt-1 flex items-center justify-between gap-1.5 text-[11px]">
                              <span className="text-[10px] text-slate-400 font-medium shrink-0">Stage:</span>
                              <Select
                                size="sm"
                                value={lead.status || 'NEW'}
                                onChange={(e) => handleSelectStageChange(lead, e.target.value)}
                                disabled={isUpdating}
                                options={KANBAN_STAGES.map((s) => ({ value: s.id, label: s.label }))}
                                containerClassName="flex-1 min-w-0"
                                className="w-full text-[11px]"
                              />
                            </div>
                          ) : onRestoreLead ? (
                            <div className="pt-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => onRestoreLead(lead)}
                                className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore Lead</span>
                              </button>
                            </div>
                          ) : null}
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
