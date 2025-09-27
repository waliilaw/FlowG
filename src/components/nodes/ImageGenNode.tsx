'use client';

import React from 'react';
import { NodeProps } from '@xyflow/react';
import { ImageIcon } from 'lucide-react';
import BaseNode from './BaseNode';
import { WorkflowNode, AIComputeConfig } from '@/types/workflow';

export default function ImageGenNode(props: NodeProps<WorkflowNode>) {
  const config = props.data.config as AIComputeConfig;

  return (
    <BaseNode
      {...props}
      icon={<ImageIcon size={16} />}
      color="bg-pink-500"
    >
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">Task:</span> image-generation
        </div>
        <div>
          <span className="font-medium">Model:</span> {config.model || 'stable-diffusion-xl'}
        </div>
        {config.parameters?.prompt && (
          <div>
            <span className="font-medium">Prompt:</span>
            <div className="mt-1 p-2 bg-slate-50 rounded text-xs">
              {config.parameters.prompt.substring(0, 100)}
              {config.parameters.prompt.length > 100 && '...'}
            </div>
          </div>
        )}
        {config.outputs?.imageUrl && (
          <div className="mt-2">
            <div className="aspect-square w-full bg-slate-100 rounded-lg overflow-hidden">
              <img 
                src={config.outputs.imageUrl} 
                alt={config.parameters?.prompt || 'Generated image'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
}