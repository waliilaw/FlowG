'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowNode } from '@/types/workflow';
import { nodeTheme } from '@/lib/theme/nodes';
import { safeStringify } from '@/lib/utils/json';

// Pattern components
const PatternLines = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" className="text-white">
    <path d="M1 1 L11 1 M1 4 L11 4 M1 7 L11 7 M1 10 L11 10" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

const PatternTriangles = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" className="text-white">
    <path d="M6 2 L10 8 L2 8 Z M6 4 L8 7 L4 7 Z" fill="currentColor"/>
  </svg>
);

const PatternCurves = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" className="text-white">
    <path d="M2 2 Q6 6 10 2 M2 6 Q6 10 10 6 M2 10 Q6 6 10 10" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

const PatternDots = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" className="text-white">
    <circle cx="3" cy="3" r="1" fill="currentColor"/>
    <circle cx="9" cy="3" r="1" fill="currentColor"/>
    <circle cx="6" cy="6" r="1" fill="currentColor"/>
    <circle cx="3" cy="9" r="1" fill="currentColor"/>
    <circle cx="9" cy="9" r="1" fill="currentColor"/>
  </svg>
);

const PatternGrid = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" className="text-white">
    <path d="M0 4 L12 4 M0 8 L12 8 M4 0 L4 12 M8 0 L8 12" stroke="currentColor" strokeWidth="0.5" fill="none"/>
  </svg>
);

const PatternWaves = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" className="text-white">
    <path d="M0 6 Q3 3 6 6 Q9 9 12 6" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M0 3 Q3 0 6 3 Q9 6 12 3" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M0 9 Q3 6 6 9 Q9 12 12 9" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

// Pattern mapping function
const getNodePattern = (nodeType: string) => {
  switch (nodeType) {
    case 'ai-compute': return <PatternLines />;
    case 'storage': return <PatternGrid />;
    case 'chain-interaction': return <PatternTriangles />;
    case 'logic': return <PatternCurves />;
    case 'input': return <PatternDots />;
    case 'output': return <PatternWaves />;
    default: return <span className="text-white text-xs">•</span>;
  }
};

interface BaseNodeProps extends NodeProps<WorkflowNode> {
  icon?: React.ReactNode;
  color?: string;
  children?: React.ReactNode;
}

export default function BaseNode({
  data,
  selected,
  type,
  children,
}: BaseNodeProps) {
  const status = data.status || 'idle';
  const theme = nodeTheme;
  const nodePattern = getNodePattern(type || '');

  return (
    <div
      className={cn(
        'relative bg-white border-2 border-gray-300 transition-all duration-200',
        selected && 'border-black',
        status === 'running' && 'border-gray-600',
        status === 'completed' && 'border-black',
        status === 'error' && 'border-gray-500',
        'cursor-grab active:cursor-grabbing select-none hover:shadow-sm'
      )}
      style={{ userSelect: 'none', minWidth: '180px' }}
    >
      {/* Status indicator */}
      {theme.status[status].indicator && (
        <div className={theme.status[status].indicator} />
      )}

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-gray-400 bg-white hover:border-black transition-colors"
        style={{ left: -6 }}
      />

      {/* Node header */}
      <div className="flex items-center p-3 border-b border-gray-200 bg-white">
        <div className="w-4 h-4 bg-black mr-3 flex items-center justify-center">
          {nodePattern}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-sm text-black">{data.label.toLowerCase()}</h3>
          {data.description && (
            <p className="text-xs text-gray-600 font-light mt-0.5">{data.description.toLowerCase()}</p>
          )}
        </div>
        <div className={cn(
          'w-2 h-2',
          status === 'idle' && 'bg-gray-300',
          status === 'running' && 'bg-black animate-pulse',
          status === 'completed' && 'bg-black',
          status === 'error' && 'bg-gray-500'
        )} />
      </div>

      {/* Node content */}
      <div className="p-3 bg-white text-xs font-light">
        {children}
      </div>
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-gray-400 bg-white hover:border-black transition-colors"
        style={{ right: -6 }}
      />

            {/* Error display */}
      {(data.errors ?? []).length > 0 && (
        <div className="mt-3 px-3 pb-3">
          <div className={cn(
            "p-2 bg-red-50 border rounded",
            theme.status.error.border.replace('border-', '')
          )}>
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 mb-2">
              <AlertCircle size={14} />
              <span>Errors</span>
            </div>
            <div className="space-y-1">
              {(data.errors ?? []).map((error, index) => (
                <div key={index} className="text-xs text-red-600">
                  {error}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Output display */}
      {data.outputs && (
        <div className={theme.output.container}>
          <div className={theme.output.box}>
            <div className={theme.output.header}>
              <span className="text-slate-600">📤</span>
              <span className="text-xs font-medium text-slate-700">Output</span>
            </div>
            <pre className={theme.output.content}>
              {typeof data.outputs === 'string' 
                ? data.outputs 
                : safeStringify(data.outputs)}
            </pre>
          </div>
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className={theme.handle.base}
        style={{ right: -4 }}
      />
    </div>
  );
}