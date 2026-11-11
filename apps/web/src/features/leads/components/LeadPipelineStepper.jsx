import React from 'react';
import { Check, AlertTriangle, RotateCcw } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'NEW', label: 'New' },
  { id: 'CONTACTED', label: 'Contacted' },
  { id: 'INTERESTED', label: 'Interested' },
  { id: 'QUALIFIED', label: 'Qualified' },
  { id: 'PROPOSAL_SENT', label: 'Proposal' },
  { id: 'CONVERTED', label: 'Won' },
];

export function LeadPipelineStepper({
  currentStatus,
  lossReason,
  onStatusChange,
  isLoading = false,
}) {
  const isLost = currentStatus === 'LOST';
  const currentIndex = PIPELINE_STAGES.findIndex((s) => s.id === currentStatus);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs space-y-3">
      {/* If Lost: Show clear loss banner with re-engagement action */}
      {isLost ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-rose-50/80 border border-rose-200/90 text-rose-900 animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-950">
                Opportunity Marked as Lost
              </p>
              {lossReason && (
                <p className="text-[11px] text-rose-700">Reason: {lossReason}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onStatusChange('NEW')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-white border border-rose-200 rounded-lg hover:bg-rose-100/70 transition shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reopen Lead</span>
          </button>
        </div>
      ) : null}

      {/* Stepper Pipeline Bar */}
      <div className="relative">
        {/* Horizontal scroll container for mobile */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none snap-x">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = !isLost && currentIndex > idx;
            const isCurrent = !isLost && currentIndex === idx;

            return (
              <button
                key={stage.id}
                type="button"
                disabled={isLoading}
                onClick={() => onStatusChange(stage.id)}
                className={`flex-1 min-w-[90px] sm:min-w-0 py-2 px-2.5 sm:px-3 rounded-xl flex items-center justify-center sm:justify-start space-x-2 transition-all duration-150 snap-start text-left cursor-pointer border ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200/80 hover:bg-emerald-100/80'
                    : 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {/* Step indicator circle */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : idx + 1}
                </div>

                {/* Stage Label */}
                <span
                  className={`text-xs font-semibold truncate ${
                    isCurrent
                      ? 'text-white'
                      : isCompleted
                      ? 'text-emerald-950'
                      : 'text-slate-700'
                  }`}
                >
                  {stage.label}
                </span>
              </button>
            );
          })}

          {/* Mark as Lost Quick Trigger */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onStatusChange('LOST')}
            className={`py-2 px-2.5 sm:px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all text-xs font-semibold border cursor-pointer shrink-0 ${
              isLost
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50/60 text-rose-700 border-rose-200/70 hover:bg-rose-100 hover:text-rose-900'
            }`}
          >
            <span>Lost</span>
          </button>
        </div>
      </div>
    </div>
  );
}
