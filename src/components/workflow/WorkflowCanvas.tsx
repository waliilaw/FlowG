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
  const { isExecuting, setNodes: setStoreNodes, setEdges: setStoreEdges } = useWorkflowStore();

  // Sync React Flow nodes/edges to Zustand store
  useEffect(() => {
    setStoreNodes(nodes);
  }, [nodes, setStoreNodes]);
  useEffect(() => {
    setStoreEdges(edges);
  }, [edges, setStoreEdges]);

  // Enhanced onNodesChange with logging
  const handleNodesChange = useCallback((changes: any) => {
    console.log('React Flow nodes changing:', changes);
    onNodesChange(changes);
  }, [onNodesChange]);

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
      className="w-full h-[calc(100vh-4rem)] bg-gray-50 relative border-l border-gray-200" 
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
          type: 'straight',
          animated: true,
          style: { 
            stroke: '#000000', 
            strokeWidth: 2,
            strokeDasharray: '8 4',
          },
        }}
        connectionLineStyle={{ 
          stroke: '#000000', 
          strokeWidth: 2,
          strokeDasharray: '8 4'
        }}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        {/* Minimal background pattern */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #d1d5db 0.5px, transparent 0.5px)`,
            backgroundSize: '24px 24px',
            opacity: 0.3
          }}
        />
        <Controls 
          className="bg-white border border-gray-300 shadow-sm"
          position="top-right"
          style={{ top: 16, right: 16 }}
        />
        <MiniMap 
          nodeStrokeColor="#000000"
          nodeColor="#f3f4f6"
          nodeBorderRadius={0}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-white border border-gray-300 shadow-sm"
          position="bottom-right"
          style={{ bottom: 16, right: 16, width: 160, height: 120 }}
        />
        
        <Panel position="top-left" className="bg-white border border-gray-300 p-4 shadow-sm max-w-xs" style={{ top: 16, left: 16 }}>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-black flex items-center justify-center">
                <span className="text-white italic text-sm font-regular">FG</span>
              </div>
              <div>
                <h3 className="font-black text-sm text-black">FlowG</h3>
                <p className="text-xs text-gray-600 font-light">workflow builder</p>
              </div>
            </div>
            
            <div className="space-y-1 text-xs text-gray-600 font-light">
              <div>{nodes.length} nodes</div>
              <div>{edges.length} connections</div>
            </div>
            
            {isExecuting && (
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                <span className="text-xs text-black font-light">executing...</span>
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
      
      {/* Minimal decorative element */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-400 font-light pointer-events-none">
        powered by 0g network
      </div>
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