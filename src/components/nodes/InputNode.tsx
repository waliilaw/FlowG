'use client';

import React from 'react';
import { NodeProps } from '@xyflow/react';
import { ArrowDown } from 'lucide-react';
import BaseNode from './BaseNode';
import { WorkflowNode } from '@/types/workflow';

export default function InputNode(props: NodeProps<WorkflowNode>) {
  const config = props.data.config;

  return (
    <BaseNode
      {...props}
      icon={<ArrowDown size={16} />}
      color="bg-indigo-500"
    >
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">Type:</span> Input Node
        </div>
        {config.inputType && (
          <div>
            <span className="font-medium">Input Type:</span> {config.inputType}
          </div>
        )}
        {config.value && (
          <div>
            <span className="font-medium">Value:</span>
            <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
              {typeof config.value === 'string' 
                ? config.value.substring(0, 50) + (config.value.length > 50 ? '...' : '')
                : JSON.stringify(config.value)
              }
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
}