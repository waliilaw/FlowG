'use client';

import React from 'react';
import { Brain, Database, Link, GitBranch, ArrowDown, ArrowUp } from 'lucide-react';

const nodeTypes = [
  {
    type: 'ai-compute',
    label: 'AI Compute',
    description: 'Execute AI tasks on 0G Compute Network',
    icon: <Brain size={20} />,
    color: 'bg-purple-500',
  },
  {
    type: 'storage',
    label: 'Storage',
    description: 'Store and retrieve data on 0G Storage',
    icon: <Database size={20} />,
    color: 'bg-blue-500',
  },
  {
    type: 'chain-interaction',
    label: 'Chain Interaction',
    description: 'Deploy contracts and interact with 0G Chain',
    icon: <Link size={20} />,
    color: 'bg-green-500',
  },
  {
    type: 'logic',
    label: 'Logic',
    description: 'Add conditional logic and control flow',
    icon: <GitBranch size={20} />,
    color: 'bg-orange-500',
  },
  {
    type: 'input',
    label: 'Input',
    description: 'Define workflow inputs',
    icon: <ArrowDown size={20} />,
    color: 'bg-indigo-500',
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Define workflow outputs',
    icon: <ArrowUp size={20} />,
    color: 'bg-teal-500',
  },
];

export default function NodesSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    console.log('Started dragging node type:', nodeType);
  };

  return (
    <div className="w-72 bg-white border-r border-slate-200 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Nodes
        </h2>
        <p className="text-xs text-slate-500">
          Drag nodes to build your workflow
        </p>
      </div>

      <div className="space-y-4">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
            className="group flex items-center p-3 bg-white rounded-lg cursor-grab hover:bg-slate-50 transition-all duration-200 border border-slate-200 hover:border-slate-300"
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-white mr-3 ${node.color}`}>
              {node.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-sm mb-1">
                {node.label}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {node.description}
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-slate-600 text-xs">+</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">0G</span>
          </div>
          <h3 className="font-bold text-blue-900 text-sm">
            Powered by 0G Network
          </h3>
        </div>
        <p className="text-xs text-blue-700 leading-relaxed">
          All workflows run on 0G&apos;s decentralized infrastructure for maximum performance, security, and reliability.
        </p>
        <div className="mt-3 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-600 font-medium">Network Active</span>
        </div>
      </div>
    </div>
  );
}