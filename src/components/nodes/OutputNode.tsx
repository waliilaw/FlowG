'use client';

import React from 'react';
import { NodeProps } from '@xyflow/react';
import { ArrowUp } from 'lucide-react';
import BaseNode from './BaseNode';
import { WorkflowNode } from '@/types/workflow';

export default function OutputNode(props: NodeProps<WorkflowNode>) {
  const config = props.data.config;

  return (
    <BaseNode
      {...props}
    >
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">Type:</span> Output Node
        </div>
        {config.outputType && (
          <div>
            <span className="font-medium">Output Type:</span> {config.outputType}
          </div>
        )}
        {config.format && (
          <div>
            <span className="font-medium">Format:</span> {config.format}
          </div>
        )}
      </div>
    </BaseNode>
  );
}