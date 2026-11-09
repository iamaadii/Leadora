// ExportDropdown.jsx
// Phase 9: Multi-format Data Export Dropdown (CSV, Excel, PDF)

import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Table, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';

export function ExportDropdown({ onExport, isExporting = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFormat = (format) => {
    setIsOpen(false);
    onExport(format);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        leftIcon={isExporting ? Loader2 : Download}
        rightIcon={ChevronDown}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isExporting}
        className="h-9 text-xs font-medium border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
      >
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black/5 divide-y divide-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            <button
              onClick={() => handleSelectFormat('csv')}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 transition-colors"
            >
              <Table className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-medium block">Export as CSV</span>
                <span className="text-[11px] text-slate-400">RFC 4180 with injection defense</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectFormat('excel')}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-medium block">Export as Excel (.xlsx)</span>
                <span className="text-[11px] text-slate-400">Styled workbook with KPI overview</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectFormat('pdf')}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <div>
                <span className="font-medium block">Export as PDF</span>
                <span className="text-[11px] text-slate-400">Printable landscape document</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

