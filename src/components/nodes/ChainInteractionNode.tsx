'use client';

import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Link } from 'lucide-react';
import { ethers } from 'ethers';
import BaseNode from './BaseNode';
import { WorkflowNode, ChainConfig } from '@/types/workflow';

export default function ChainInteractionNode(props: NodeProps<WorkflowNode>) {
  const config = props.data.config as ChainConfig;
  const operation = config.operation || 'deploy-contract';

  return (
    <BaseNode
      {...props}
      icon={<Link size={16} />}
      color="bg-green-500"
    >
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">Operation:</span> 
          <span className="capitalize">{operation.replace('-', ' ')}</span>
        </div>
        
        {/* Contract Address */}
        {config.contractAddress && (
          <div>
            <span className="font-medium">Contract:</span> 
            <div className="mt-1 font-mono text-xs bg-green-50 p-1.5 rounded break-all">
              {config.contractAddress.substring(0, 8)}...{config.contractAddress.slice(-6)}
            </div>
          </div>
        )}

        {/* Method Details */}
        {operation === 'call-contract' && config.methodName && (
          <>
            <div>
              <span className="font-medium">Method:</span> {config.methodName}
            </div>
            {config.parameters && config.parameters.length > 0 && (
              <div>
                <span className="font-medium">Args:</span>
                <div className="mt-1 bg-slate-50 p-1.5 rounded text-xs">
                  {config.parameters.map((p, i) => (
                    <div key={i} className="truncate">
                      {String(p).substring(0, 30)}
                      {String(p).length > 30 && '...'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Deployment Info */}
        {operation === 'deploy-contract' && (
          <div>
            <span className="font-medium">Constructor Args:</span>
            <div className="mt-1 bg-slate-50 p-1.5 rounded text-xs">
              {config.constructorArgs?.length 
                ? config.constructorArgs.map((arg, i) => (
                    <div key={i} className="truncate">
                      {String(arg).substring(0, 30)}
                      {String(arg).length > 30 && '...'}
                    </div>
                  ))
                : 'No constructor arguments'
              }
            </div>
          </div>
        )}

        {/* Token Operations */}
        {(operation === 'wrap-og' || operation === 'unwrap-og') && config.value && (
          <div>
            <span className="font-medium">Amount:</span>
            <div className="mt-1 font-mono text-xs bg-green-50 p-1.5 rounded">
              {ethers.formatEther(BigInt(config.value || '0'))} OG
            </div>
          </div>
        )}

        {/* Gas Limit if specified */}
        {config.gasLimit && (
          <div className="text-slate-500">
            Gas Limit: {config.gasLimit.toLocaleString()}
          </div>
        )}
      </div>
    </BaseNode>
  );
}