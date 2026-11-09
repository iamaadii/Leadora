import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';

export function DateRangeFilter({
  selectedRange = '30d',
  startDate = '',
  endDate = '',
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);

  const OPTIONS = [
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
    { id: 'this_month', label: 'This month' },
    { id: 'prev_month', label: 'Previous month' },
    { id: 'custom', label: 'Custom range' },
  ];

  const currentOption = OPTIONS.find((o) => o.id === selectedRange) || OPTIONS[1];

  const handleSelect = (optionId) => {
    if (optionId === 'custom') {
      setIsCustomModalOpen(true);
      setIsOpen(false);
    } else {
      onChange({ range: optionId });
      setIsOpen(false);
    }
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    onChange({
      range: 'custom',
      startDate: new Date(customStart).toISOString(),
      endDate: new Date(customEnd).toISOString(),
    });
    setIsCustomModalOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 shadow-2xs transition"
      >
        <Calendar className="w-3.5 h-3.5 text-slate-500" />
        <span>{currentOption.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-44 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-xs divide-y divide-slate-50">
            {OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition ${
                  selectedRange === opt.id ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                }`}
              >
                <span>{opt.label}</span>
                {selectedRange === opt.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Custom Range Popover/Dialog */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 max-w-sm w-full space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Select Custom Date Range</h3>
              <p className="text-xs text-slate-500">Pick starting and ending dates (up to 1 year).</p>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setIsCustomModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="xs" variant="primary">
                  Apply Range
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
