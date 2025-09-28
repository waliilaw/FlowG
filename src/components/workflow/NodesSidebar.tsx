'use client';

import React from 'react';

// Custom pattern components
const PatternLines = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" className="text-white">
    <path d="M1 1 L11 1 M1 4 L11 4 M1 7 L11 7 M1 10 L11 10" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

const PatternTriangles = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" className="text-white">
    <path d="M6 2 L10 8 L2 8 Z M6 4 L8 7 L4 7 Z" fill="currentColor"/>
  </svg>
);

const PatternCurves = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" className="text-white">
    <path d="M2 2 Q6 6 10 2 M2 6 Q6 10 10 6 M2 10 Q6 6 10 10" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

const PatternDots = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" className="text-white">
    <circle cx="3" cy="3" r="1" fill="currentColor"/>
    <circle cx="9" cy="3" r="1" fill="currentColor"/>
    <circle cx="6" cy="6" r="1" fill="currentColor"/>
    <circle cx="3" cy="9" r="1" fill="currentColor"/>
    <circle cx="9" cy="9" r="1" fill="currentColor"/>
  </svg>
);

const PatternGrid = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" className="text-white">
    <path d="M0 4 L12 4 M0 8 L12 8 M4 0 L4 12 M8 0 L8 12" stroke="currentColor" strokeWidth="0.5" fill="none"/>
  </svg>
);

const PatternWaves = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" className="text-white">
    <path d="M0 6 Q3 3 6 6 Q9 9 12 6" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M0 3 Q3 0 6 3 Q9 6 12 3" stroke="currentColor" strokeWidth="1" fill="none"/>
    <path d="M0 9 Q3 6 6 9 Q9 12 12 9" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

const nodeTypes = [
  {
    type: 'ai-compute',
    label: 'AI Compute',
    description: 'Execute AI tasks on 0G Compute Network',
    pattern: <PatternLines />,
    color: 'bg-black',
  },
  {
    type: 'storage',
    label: 'Storage',
    description: 'Store and retrieve data on 0G Storage',
    pattern: <PatternGrid />,
    color: 'bg-black',
  },
  {
    type: 'chain-interaction',
    label: 'Chain Interaction',
    description: 'Deploy contracts and interact with 0G Chain',
    pattern: <PatternTriangles />,
    color: 'bg-black',
  },
  {
    type: 'logic',
    label: 'Logic',
    description: 'Add conditional logic and control flow',
    pattern: <PatternCurves />,
    color: 'bg-black',
  },
  {
    type: 'input',
    label: 'Input',
    description: 'Define workflow inputs',
    pattern: <PatternDots />,
    color: 'bg-black',
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Define workflow outputs',
    pattern: <PatternWaves />,
    color: 'bg-black',
  },
];

export default function NodesSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    console.log('Started dragging node type:', nodeType);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-black text-black mb-2">
          nodes
        </h2>
        <p className="text-xs text-gray-600 font-light mb-3">
          drag to canvas
        </p>
        <div className="text-xs text-gray-500 font-light">
          {nodeTypes.length} available
        </div>
      </div>

      <div className="space-y-4">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
            className="group flex items-center p-3 bg-white hover:bg-gray-50 cursor-grab border-b border-gray-100 transition-colors"
          >
            {/* Unique Pattern Icon */}
            <div className="w-6 h-6 bg-black flex items-center justify-center mr-3">
              {node.pattern}
            </div>
            
            {/* Node Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-black mb-1">
                {node.label.toLowerCase()}
              </h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                {node.description.toLowerCase()}
              </p>
            </div>
            
            {/* Minimal drag indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-gray-400 text-xs">⋮⋮</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="mb-3">
          <h3 className="text-sm font-black text-black mb-1">
            0g network
          </h3>
          <p className="text-xs text-gray-600 font-light">
            decentralized ai infrastructure
          </p>
        </div>
        
        <div className="space-y-2 text-xs font-light">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">compute</span>
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">storage</span>
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">chain</span>
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}