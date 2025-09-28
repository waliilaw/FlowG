'use client';

import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Database } from 'lucide-react';
import BaseNode from './BaseNode';
import { WorkflowNode, StorageConfig } from '@/types/workflow';

export default function StorageNode(props: NodeProps<WorkflowNode>) {
  const config = props.data.config as StorageConfig;

  return (
    <BaseNode
      {...props}
    >
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">Operation:</span> {config.operation || 'store'}
        </div>
        {config.operation === 'store' && config.filename && (
          <div>
            <span className="font-medium">Filename:</span> {config.filename}
          </div>
        )}
        {config.operation === 'retrieve' && config.hash && (
          <div>
            <span className="font-medium">Hash:</span>
            <div className="mt-1 p-2 bg-slate-50 rounded font-mono">
              {config.hash.substring(0, 10)}...{config.hash.substring(58)}
            </div>
          </div>
        )}
        {config.verify && (
          <div className="text-green-600">
            <span className="font-medium">✓ Verification Enabled</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
}