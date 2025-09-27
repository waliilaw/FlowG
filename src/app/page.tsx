'use client';

import React, { useState } from 'react';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import NodesSidebar from '@/components/workflow/NodesSidebar';
import ExecutionPanel from '@/components/workflow/ExecutionPanel';
import { useWorkflowStore } from '@/store/workflow';
import { useZGNetwork } from '@/hooks/useZGNetwork';

export default function Home() {
  const { executeWorkflow, saveWorkflow, isExecuting, nodes } = useWorkflowStore();
  const { status, isInitializing } = useZGNetwork();
  const [workflowName, setWorkflowName] = useState('');

  const handleSaveWorkflow = () => {
    const name = workflowName || `Workflow_${Date.now()}`;
    saveWorkflow(name);
    setWorkflowName('');
  };

  const handleExecuteWorkflow = async () => {
    if (nodes.length === 0) {
      alert('Please add some nodes to your workflow first!');
      return;
    }
    await executeWorkflow();
  };

  return (
    <div className="flex h-screen w-full bg-white">
      <NodesSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    FlowG
                  </h1>
                  <p className="text-sm text-slate-600">
                    AI Workflow Builder
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <span className={`w-2 h-2 rounded-full ${
                  isInitializing ? 'bg-yellow-400' :
                  status.compute === 'connected' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-slate-600">
                  {isInitializing ? 'Connecting...' : '0G Network'}
                </span>
              </div>
              
              <input
                type="text"
                placeholder="Workflow name..."
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              
              <button
                onClick={handleSaveWorkflow}
                className="px-4 py-1.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Save
              </button>

              <button
                onClick={handleExecuteWorkflow}
                disabled={isExecuting || nodes.length === 0}
                className="px-4 py-1.5 text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors"
              >
                {isExecuting ? 'Running...' : 'Execute'}
              </button>
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