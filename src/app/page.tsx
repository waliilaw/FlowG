'use client';

import React, { useState } from 'react';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import NodesSidebar from '@/components/workflow/NodesSidebar';
import ExecutionPanel from '@/components/workflow/ExecutionPanel';
import { useWorkflowStore } from '@/store/workflow';
import { useZGNetwork } from '@/hooks/useZGNetwork';

export default function Home() {
  const { executeWorkflow, saveWorkflow, isExecuting, nodes, edges } = useWorkflowStore();
  const { status, isInitializing } = useZGNetwork();
  const [workflowName, setWorkflowName] = useState('');

  const handleSaveWorkflow = () => {
    const name = workflowName || `Workflow_${Date.now()}`;
    saveWorkflow(name);
    setWorkflowName('');
  };

  const handleExecuteWorkflow = async () => {
    // Get nodes from the store (which should be synced from React Flow)
    const currentNodes = useWorkflowStore.getState().nodes;
    
    if (currentNodes.length === 0) {
      alert('Please add some nodes to your workflow first!');
      return;
    }
    
    console.log('🚀 Starting workflow execution with nodes:', currentNodes);
    await executeWorkflow();
  };

  return (
    <div className="flex h-screen w-full bg-white">
      <NodesSidebar />
      
      <div className="flex-1 flex flex-col ">
        <header className="bg-white border-b border-gray-200 px-6 py-4 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-black rounded-sm flex items-center justify-center">
                  <span className="text-white italic text-xl font-regular">FG</span>
                </div>
                <div>
                  <h1 className="text-2xl text-black font-black tracking-tight">
                    FlowG
                  </h1>
                  <p className="text-sm text-gray-600 font-light">
                    AI Workflow Builder
                  </p>
                </div>
              </div>
              
              {/* Minimal info display */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-xs text-gray-500 font-light">
                  {nodes.length} nodes • {edges.length} connections
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Minimal Network Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isInitializing ? 'bg-gray-400' :
                  status.compute === 'connected' ? 'bg-black' : 'bg-gray-300'
                }`} />
                <span className="text-xs text-gray-600 font-light">
                  {isInitializing ? 'connecting' : 'ready'}
                </span>
              </div>
              
              {/* Minimal Controls */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="workflow name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:border-black transition-colors font-light w-32"
                />
                
                <button
                  onClick={handleSaveWorkflow}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors font-light"
                >
                  save
                </button>

                <button
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting || nodes.length === 0 || edges.length === 0}
                  className="px-4 py-2 text-sm text-white bg-black hover:bg-gray-800 disabled:bg-gray-300 transition-colors font-light"
                >
                  {isExecuting ? 'running...' : 'execute'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          <WorkflowCanvas />
          <ExecutionPanel />
        </div>
      </div>
    </div>
  );
}