'use client';

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel,
  BackgroundVariant,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  XYPosition,
  Viewport,
} from '@xyflow/react';
import { useWorkflowStore } from '@/store/workflow';
import { WorkflowNode } from '@/types/workflow';

// Node components
import {
  AIComputeNode,
  StorageNode,
  ChainInteractionNode,
  LogicNode,
  InputNode,
  OutputNode,
} from '@/components/nodes';

const nodeTypes = {
  'ai-compute': AIComputeNode,
  'storage': StorageNode,
  'chain-interaction': ChainInteractionNode,
  'logic': LogicNode,
  'input': InputNode,
  'output': OutputNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Enhanced onNodesChange with logging
  const handleNodesChange = useCallback((changes: any) => {
    console.log('React Flow nodes changing:', changes);
    onNodesChange(changes);
  }, [onNodesChange]);
  
  const { isExecuting } = useWorkflowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      console.log('Dropped node type:', type);
      
      if (!type) {
        console.warn('No node type found in drop data');
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) {
        console.warn('No flow bounds found');
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      console.log('Creating node at position:', position);

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        draggable: true,
        selectable: true,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')} Node`,
          config: {},
          status: 'idle' as const,
        },
      };

      console.log('Adding node:', newNode);
      console.log('Available nodeTypes:', Object.keys(nodeTypes));
      console.log('Node type exists:', type in nodeTypes);
      console.log('Node draggable:', newNode.draggable);

      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode);
        console.log('Updated nodes array:', updatedNodes);
        return updatedNodes;
      });
    },
    [screenToFlowPosition, setNodes]
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  // Debug logging
  console.log('Current nodes in Flow:', nodes);
  console.log('Available nodeTypes:', nodeTypes);

  return (
    <div 
      ref={reactFlowWrapper} 
      className="w-full h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative" 
      style={{ minHeight: '600px' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={proOptions}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className="bg-transparent h-full w-full"
        elevateNodesOnSelect={true}
        minZoom={0.1}
        maxZoom={4}
        selectNodesOnDrag={true}
        nodesDraggable={true}
        nodesConnectable={true}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1.5} 
          color="#cbd5e1"
          className="opacity-60"
        />
        <Controls 
          className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg"
          position="top-right"
          style={{ top: 20, right: 20 }}
        />
        <MiniMap 
          nodeStrokeColor="#6366f1"
          nodeColor="#a5b4fc"
          nodeBorderRadius={12}
          maskColor="rgba(100, 116, 139, 0.1)"
          className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg"
          position="bottom-right"
          style={{ bottom: 20, right: 20 }}
        />
        
        <Panel position="top-left" className="bg-white/90 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-xl" style={{ top: 20, left: 20 }}>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">F</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900">FlowG Workflow Builder</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Drag nodes from the sidebar to build your AI workflow
            </p>
            {isExecuting && (
              <div className="flex items-center space-x-3 mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">Workflow executing on 0G Network...</span>
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-xl pointer-events-none"></div>
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}