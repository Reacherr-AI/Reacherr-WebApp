import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/Tooltip";

export interface MetricSegment {
  label: string;
  value: number; // Percentage width
  displayValue: string;
  color: string;
}

interface SegmentedMetricProps {
  title: string;
  total: string;
  unit: string;
  segments: MetricSegment[];
}

export const SegmentedMetric: React.FC<SegmentedMetricProps> = ({ title, total, segments, unit }) => (
  <div className="flex flex-col gap-2 min-w-[260px] bg-white p-3 rounded-xl border border-zinc-100 shadow-sm group">
    <div className="flex justify-between items-end px-1">
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{title}</span>
      <span className="text-sm font-mono font-bold text-zinc-800">
        ~{total}<span className="text-[10px] text-zinc-400 font-medium ml-0.5">{unit}</span>
      </span>
    </div>
    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-zinc-100">
      {segments.map((segment, i) => (
        <TooltipProvider key={i}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={cn("h-full transition-all hover:brightness-90 cursor-help", segment.color)} 
                style={{ width: `${segment.value}%` }} 
              />
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 text-white border-none p-2 rounded-lg shadow-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{segment.label}</p>
              <p className="text-xs font-mono font-bold">{segment.displayValue}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  </div>
);
export default SegmentedMetric;