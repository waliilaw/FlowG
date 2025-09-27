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
      icon={<Brain size={16} />}
      color="bg-purple-500"
    >
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">Operation:</span> {config.operation || 'process'}
        </div>
        <div>
          <span className="font-medium">Model:</span> {config.model || defaultModel}
        </div>
        {config.prompt && (
          <div>
            <span className="font-medium">Prompt:</span>
            <div className="mt-1 p-2 bg-slate-50 rounded text-xs">
              {config.prompt.substring(0, 100)}
              {config.prompt.length > 100 && '...'}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
}