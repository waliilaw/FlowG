'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowNode } from '@/types/workflow';
import { nodeTheme } from '@/lib/theme/nodes';
import { safeStringify } from '@/lib/utils/json';

interface BaseNodeProps extends NodeProps<WorkflowNode> {
  icon: React.ReactNode;
  color: string;
  children?: React.ReactNode;
}

export default function BaseNode({
  data,
  selected,
  icon,
  color,
  children,
}: BaseNodeProps) {
  const status = data.status || 'idle';
  const theme = nodeTheme;

  return (
    <div
      className={cn(
        theme.base.container,
        theme.status[status].border,
        selected && 'ring-2 ring-blue-100',
        'cursor-grab active:cursor-grabbing select-none'
      )}
      style={{ userSelect: 'none' }}
    >
      {/* Status indicator */}
      {theme.status[status].indicator && (
        <div className={theme.status[status].indicator} />
      )}

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className={theme.handle.base}
        style={{ left: -4 }}
      />

      {/* Node header */}
      <div className={theme.base.header}>
        <div className={cn(theme.base.icon, color)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={theme.base.title}>{data.label}</h3>
          {data.description && (
            <p className={theme.base.description}>{data.description}</p>
          )}
        </div>
      </div>

      {/* Node content */}
      <div className={theme.base.content}>
        {children}
      </div>

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