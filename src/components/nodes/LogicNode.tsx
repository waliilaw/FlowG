'use client';

import React from 'react';
import { NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import BaseNode from './BaseNode';
import { WorkflowNode, LogicConfig } from '@/types/workflow';

export default function LogicNode(props: NodeProps<WorkflowNode>) {
  const config = props.data.config as LogicConfig;

  return (
    <BaseNode
      {...props}
      icon={<GitBranch size={16} />}
      color="bg-orange-500"
    >
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">Operation:</span> {config.operation || 'condition'}
        </div>
        {config.condition && (
          <div>
            <span className="font-medium">Condition:</span>
            <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono">
              {config.condition}
            </div>
          </div>
        )}
        {config.loopCount && (
          <div>
            <span className="font-medium">Loop Count:</span> {config.loopCount}
          </div>
        )}
        {config.delay && (
          <div>
            <span className="font-medium">Delay:</span> {config.delay}ms
          </div>
        )}
      </div>
    </BaseNode>
  );
}