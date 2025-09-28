'use client';

import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Brain } from 'lucide-react';
import BaseNode from './BaseNode';
import { WorkflowNode, AIComputeConfig } from '@/types/workflow';

export default function AIComputeNode(props: NodeProps<WorkflowNode>) {
  const config = props.data.config as AIComputeConfig;
  
  // Default to official 0G models
  const defaultModel = config.operation === 'text-generation' 
    ? 'llama-3.3-70b-instruct'
    : 'deepseek-r1-70b';

  return (
    <BaseNode
      {...props}
    >
        <div className="space-y-1">
          <div className="text-gray-600">
            {config.operation || 'process'}
          </div>
          <div className="text-gray-600">
            {config.model || defaultModel}
          </div>
          {config.prompt && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 text-gray-700">
              {config.prompt.substring(0, 80)}
              {config.prompt.length > 80 && '...'}
            </div>
          )}
      </div>
    </BaseNode>
  );
}