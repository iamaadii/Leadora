// ExportDropdown.jsx
// Phase 9: Multi-format Data Export Dropdown (CSV, Excel, PDF)

import React from 'react';
import { Download, ChevronDown, Table, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Dropdown } from '../../../components/ui/Dropdown.jsx';

export function ExportDropdown({ onExport, isExporting = false }) {
  const handleSelectFormat = (format) => {
    onExport(format);
  };

  return (
    <Dropdown
      align="right"
      trigger={
        <Button
          variant="outline"
          size="sm"
          leftIcon={isExporting ? Loader2 : Download}
          rightIcon={ChevronDown}
          disabled={isExporting}
          className="h-9 text-xs font-semibold border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      }
    >
      <div className="py-1 divide-y divide-slate-100">
        <button
          type="button"
          onClick={() => handleSelectFormat('csv')}
          className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
        >
          <Table className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 block truncate">Export as CSV</span>
            <span className="text-[10px] text-slate-400 block truncate">RFC 4180 with injection defense</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectFormat('excel')}
          className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 block truncate">Export as Excel</span>
            <span className="text-[10px] text-slate-400 block truncate">Styled workbook (.xlsx)</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectFormat('pdf')}
          className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-rose-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 block truncate">Export as PDF</span>
            <span className="text-[10px] text-slate-400 block truncate">Printable landscape document (.pdf)</span>
          </div>
        </button>
      </div>
    </Dropdown>
  );
}
