import React, { useState } from 'react';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { LineChart as LineChartIcon } from 'lucide-react';

export function LeadTrendChart({ data = null, isLoading = false }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  const timeline = data?.timeline || [];
  const isEmpty = timeline.length === 0;

  // Compute SVG chart coordinates
  const svgWidth = 500;
  const svgHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const maxVal = Math.max(
    ...timeline.map((p) => Math.max(p.newLeads || 0, p.conversions || 0)),
    5,
  );

  const getX = (index) => {
    if (timeline.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (timeline.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    return padding.top + chartHeight - (val / maxVal) * chartHeight;
  };

  // Generate SVG path strings
  let leadsPath = '';
  let leadsAreaPath = '';
  let convPath = '';

  if (timeline.length > 0) {
    timeline.forEach((point, i) => {
      const x = getX(i);
      const yLeads = getY(point.newLeads || 0);
      const yConv = getY(point.conversions || 0);

      if (i === 0) {
        leadsPath += `M ${x} ${yLeads}`;
        leadsAreaPath += `M ${x} ${padding.top + chartHeight} L ${x} ${yLeads}`;
        convPath += `M ${x} ${yConv}`;
      } else {
        leadsPath += ` L ${x} ${yLeads}`;
        leadsAreaPath += ` L ${x} ${yLeads}`;
        convPath += ` L ${x} ${yConv}`;
      }
    });

    const lastX = getX(timeline.length - 1);
    leadsAreaPath += ` L ${lastX} ${padding.top + chartHeight} Z`;
  }

  const formatDateLabel = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <LineChartIcon className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Lead Trends & Conversions</h3>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-600 font-medium">New Leads</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Conversions</span>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="h-56 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-xs font-medium text-slate-400">No leads recorded in this period.</p>
          <p className="text-[11px] text-slate-400">Try widening your date range filter.</p>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="leadAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y-axis Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = padding.top + chartHeight * (1 - pct);
              const val = Math.round(maxVal * pct);
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area fill for leads */}
            <path d={leadsAreaPath} fill="url(#leadAreaGradient)" />

            {/* Line for new leads */}
            <path
              d={leadsPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Line for conversions */}
            <path
              d={convPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data points */}
            {timeline.map((p, i) => {
              const x = getX(i);
              const yLeads = getY(p.newLeads || 0);

              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint({ ...p, x, y: yLeads })}
                >
                  <circle
                    cx={x}
                    cy={yLeads}
                    r={hoveredPoint?.date === p.date ? 5 : 3}
                    fill="#2563eb"
                    className="transition-all duration-150"
                  />
                </g>
              );
            })}

            {/* X-axis date labels */}
            {timeline.length > 0 && (
              <>
                <text
                  x={getX(0)}
                  y={svgHeight - 8}
                  textAnchor="start"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {formatDateLabel(timeline[0].date)}
                </text>
                {timeline.length > 2 && (
                  <text
                    x={getX(Math.floor(timeline.length / 2))}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-medium"
                  >
                    {formatDateLabel(timeline[Math.floor(timeline.length / 2)].date)}
                  </text>
                )}
                {timeline.length > 1 && (
                  <text
                    x={getX(timeline.length - 1)}
                    y={svgHeight - 8}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-medium"
                  >
                    {formatDateLabel(timeline[timeline.length - 1].date)}
                  </text>
                )}
              </>
            )}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none bg-slate-900 text-white rounded-xl shadow-lg p-2.5 text-xs z-30 transition-all -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                top: `${(hoveredPoint.y / svgHeight) * 100 - 10}%`,
              }}
            >
              <div className="font-semibold text-slate-300 border-b border-slate-700/60 pb-1 mb-1">
                {formatDateLabel(hoveredPoint.date)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between space-x-3 text-blue-400">
                  <span>New Leads:</span>
                  <span className="font-bold">{hoveredPoint.newLeads}</span>
                </div>
                <div className="flex items-center justify-between space-x-3 text-emerald-400">
                  <span>Conversions:</span>
                  <span className="font-bold">{hoveredPoint.conversions}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

